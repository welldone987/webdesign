import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(appRoot, '..', '..');
const sourceRoot = path.join(repoRoot, '资源', '摄影图片');
const publicRoot = path.join(appRoot, 'public', 'images', 'photography');
const photosFile = path.join(appRoot, 'src', 'data', 'photos.json');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const themes = [
  { name: '暖', slug: 'warm', subtitle: 'Apricity' },
  { name: '湛', slug: 'azure', subtitle: 'Azure' },
  { name: '盛', slug: 'bloom', subtitle: 'Lush' },
  { name: '郁', slug: 'umbrage', subtitle: 'Pall' },
];

const excludedSourceIndexes = new Map([
  ['warm', new Set([1, 4, 5])],
  ['bloom', new Set([9])],
  ['umbrage', new Set([5])],
]);

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function listSourceFiles(theme) {
  const sourceDir = path.join(sourceRoot, theme.name);
  const entries = await readdir(sourceDir, { withFileTypes: true });
  const sourceFiles = entries
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }));

  const excludedIndexes = excludedSourceIndexes.get(theme.slug) ?? new Set();
  return sourceFiles.filter((_, index) => !excludedIndexes.has(index + 1));
}

async function listPublicImages(directory) {
  if (!(await pathExists(directory))) {
    return [];
  }

  const results = [];
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await listPublicImages(entryPath)));
    } else if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      results.push(entryPath);
    }
  }

  return results;
}

async function hashFile(filePath) {
  return createHash('sha256').update(await readFile(filePath)).digest('hex');
}

const photos = JSON.parse(await readFile(photosFile, 'utf8'));
if (!Array.isArray(photos)) {
  throw new Error('photos.json must contain an array.');
}

const problems = [];
const warnings = [];
const expectedPublicPaths = new Set();
const currentOriginalFiles = new Set(
  photos
    .map((photo) => (photo.originalFile ? String(photo.originalFile).toLowerCase() : undefined))
    .filter(Boolean),
);

for (const photo of photos) {
  if (photo.src) {
    expectedPublicPaths.add(path.resolve(appRoot, 'public', String(photo.src).replace(/^\//, '')));
  }
  if (photo.previewSrc) {
    expectedPublicPaths.add(path.resolve(appRoot, 'public', String(photo.previewSrc).replace(/^\//, '')));
  }
}

for (const theme of themes) {
  const sourceFiles = await listSourceFiles(theme);
  const sourceSet = new Set(sourceFiles.map((fileName) => fileName.toLowerCase()));
  const themePhotos = photos.filter((photo) => photo.themeSlug === theme.slug);
  const currentOriginals = new Set(
    themePhotos
      .map((photo) => (photo.originalFile ? String(photo.originalFile).toLowerCase() : undefined))
      .filter(Boolean),
  );

  for (const fileName of sourceFiles) {
    if (!currentOriginals.has(fileName.toLowerCase())) {
      if (currentOriginalFiles.has(fileName.toLowerCase())) {
        warnings.push(`跳过重复源图：${theme.name}/${fileName}`);
      } else {
        problems.push(`新增源图未生成到 photos.json：${theme.name}/${fileName}`);
      }
    }
  }

  for (const photo of themePhotos) {
    if (photo.originalFile && !sourceSet.has(String(photo.originalFile).toLowerCase())) {
      problems.push(`photos.json 引用已不存在的源图：${theme.name}/${photo.originalFile}`);
    }

    if (photo.themeSubtitle !== theme.subtitle) {
      problems.push(`主题代号不一致：${photo.slug ?? photo.src} 应为 ${theme.subtitle}，当前为 ${photo.themeSubtitle}`);
    }
  }

  warnings.push(`${theme.name}/${theme.subtitle}: 源图 ${sourceFiles.length} 张，数据 ${themePhotos.length} 条`);
}

for (const photo of photos) {
  for (const field of ['src', 'previewSrc']) {
    if (!photo[field]) {
      continue;
    }

    const assetPath = path.resolve(appRoot, 'public', String(photo[field]).replace(/^\//, ''));
    if (!(await pathExists(assetPath))) {
      problems.push(`photos.json 引用的资源不存在：${photo[field]}`);
    }
  }
}

const publicImages = await listPublicImages(publicRoot);
for (const publicImage of publicImages) {
  if (!expectedPublicPaths.has(path.resolve(publicImage))) {
    problems.push(`public 中存在未被 photos.json 引用的图片：${path.relative(publicRoot, publicImage)}`);
  }
}

const sourceHashes = new Map();
for (const theme of themes) {
  const sourceFiles = await listSourceFiles(theme);
  for (const fileName of sourceFiles) {
    const sourcePath = path.join(sourceRoot, theme.name, fileName);
    const hash = await hashFile(sourcePath);
    const existing = sourceHashes.get(hash);
    if (existing) {
      warnings.push(`资源目录中存在重复图片：${existing} 与 ${theme.name}/${fileName}`);
    } else {
      sourceHashes.set(hash, `${theme.name}/${fileName}`);
    }
  }
}

for (const line of warnings) {
  console.log(line);
}

if (problems.length > 0) {
  console.error('\nPhoto drift check failed:');
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log(`Photo drift check passed for ${photos.length} records.`);
