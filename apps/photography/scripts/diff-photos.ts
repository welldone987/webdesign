import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Theme = {
  name: string;
  slug: string;
  subtitle: string;
};

type PhotoRecord = {
  src?: string;
  previewSrc?: string;
  originalFile?: string;
  slug?: string;
  themeSlug?: string;
  themeSubtitle?: string;
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(appRoot, '..', '..');
const sourceRoot = path.join(repoRoot, '资源', '摄影图片');
const publicRoot = path.join(appRoot, 'public', 'images', 'photography');
const photosFile = path.join(appRoot, 'src', 'data', 'photos.json');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const imageExtensionLabels = ['jpg', 'jpeg', 'png', 'webp'];

const themes: Theme[] = [
  { name: '暖', slug: 'apricity', subtitle: 'Apricity' },
  { name: '湛', slug: 'azure', subtitle: 'Azure' },
  { name: '盛', slug: 'lush', subtitle: 'Lush' },
  { name: '郁', slug: 'pall', subtitle: 'Pall' },
];

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function listSourceFiles(theme: Theme): Promise<string[]> {
  const sourceDir = path.join(sourceRoot, theme.subtitle);
  const entries = await readdir(sourceDir, { withFileTypes: true });
  const sourceFiles = entries
    .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
    .map((entry) => {
      assertValidSourceName(theme, entry.name);
      return entry.name;
    })
    .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }));

  return sourceFiles;
}

function assertValidSourceName(theme: Theme, fileName: string): void {
  const baseName = path.basename(fileName, path.extname(fileName));
  const extension = path.extname(fileName).toLowerCase();
  const relativeName = `${theme.subtitle}/${fileName}`;

  if (!imageExtensions.has(extension)) {
    const lowerName = fileName.toLowerCase();
    const looksLikeMissingDot = imageExtensionLabels.some((label) => lowerName.endsWith(label));
    const hint = looksLikeMissingDot
      ? '文件名末尾像是漏写了扩展名前的点号'
      : `仅支持 ${imageExtensionLabels.map((label) => `.${label}`).join('、')} 图片`;

    throw new Error(
      `源图文件名格式无效：${relativeName}。${hint}。请改为类似「小憩；澳门-路环半岛.jpg」的格式。`,
    );
  }

  const separatorCount = (baseName.match(/；/g) ?? []).length;
  if (separatorCount !== 1) {
    throw new Error(
      `源图文件名格式无效：${relativeName}。必须且只能使用一个中文分号「；」分隔照片名与地点，格式为「照片名；地点.扩展名」。`,
    );
  }
}

async function listPublicImages(directory: string): Promise<string[]> {
  if (!(await pathExists(directory))) {
    return [];
  }

  const results: string[] = [];
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

async function hashFile(filePath: string): Promise<string> {
  return createHash('sha256').update(await readFile(filePath)).digest('hex');
}

const photos: unknown = JSON.parse(await readFile(photosFile, 'utf8'));
if (!Array.isArray(photos)) {
  throw new Error('photos.json must contain an array.');
}

const photoRecords = photos as PhotoRecord[];
const problems: string[] = [];
const warnings: string[] = [];
const expectedPublicPaths = new Set<string>();
const currentOriginalFiles = new Set(
  photoRecords
    .map((photo) => (photo.originalFile ? String(photo.originalFile).toLowerCase() : undefined))
    .filter(Boolean),
);

for (const photo of photoRecords) {
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
  const themePhotos = photoRecords.filter((photo) => photo.themeSlug === theme.slug);
  const currentOriginals = new Set(
    themePhotos
      .map((photo) => (photo.originalFile ? String(photo.originalFile).toLowerCase() : undefined))
      .filter(Boolean),
  );

  for (const fileName of sourceFiles) {
    if (!currentOriginals.has(fileName.toLowerCase())) {
      if (currentOriginalFiles.has(fileName.toLowerCase())) {
        warnings.push(`跳过重复源图：${theme.subtitle}/${fileName}`);
      } else {
        problems.push(`新增源图未生成到 photos.json：${theme.subtitle}/${fileName}`);
      }
    }
  }

  for (const photo of themePhotos) {
    if (photo.originalFile && !sourceSet.has(String(photo.originalFile).toLowerCase())) {
      problems.push(`photos.json 引用已不存在的源图：${theme.subtitle}/${photo.originalFile}`);
    }

    if (photo.themeSubtitle !== theme.subtitle) {
      problems.push(`主题代号不一致：${photo.slug ?? photo.src} 应为 ${theme.subtitle}，当前为 ${photo.themeSubtitle}`);
    }
  }

  warnings.push(`${theme.name}/${theme.subtitle}: 源图 ${sourceFiles.length} 张，数据 ${themePhotos.length} 条`);
}

for (const photo of photoRecords) {
  for (const field of ['src', 'previewSrc'] as const) {
    const asset = photo[field];
    if (!asset) {
      continue;
    }

    const assetPath = path.resolve(appRoot, 'public', asset.replace(/^\//, ''));
    if (!(await pathExists(assetPath))) {
      problems.push(`photos.json 引用的资源不存在：${asset}`);
    }
  }
}

const publicImages = await listPublicImages(publicRoot);
for (const publicImage of publicImages) {
  if (!expectedPublicPaths.has(path.resolve(publicImage))) {
    problems.push(`public 中存在未被 photos.json 引用的图片：${path.relative(publicRoot, publicImage)}`);
  }
}

const sourceHashes = new Map<string, string>();
for (const theme of themes) {
  const sourceFiles = await listSourceFiles(theme);
  for (const fileName of sourceFiles) {
    const sourcePath = path.join(sourceRoot, theme.subtitle, fileName);
    const hash = await hashFile(sourcePath);
    const existing = sourceHashes.get(hash);
    if (existing) {
      warnings.push(`资源目录中存在重复图片：${existing} 与 ${theme.subtitle}/${fileName}`);
    } else {
      sourceHashes.set(hash, `${theme.subtitle}/${fileName}`);
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

console.log(`Photo drift check passed for ${photoRecords.length} records.`);
