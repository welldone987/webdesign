import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

type PhotoRecord = {
  src?: string;
  previewSrc?: string;
  alt?: string;
  width?: number;
  height?: number;
  previewWidth?: number;
  previewHeight?: number;
  category?: string;
  title?: string;
  location?: string;
  year?: number;
  themeSlug?: string;
  themeSubtitle?: string;
  slug?: string;
  originalFile?: string;
  placeholder?: string;
};

const requiredFields = ['src', 'alt', 'width', 'height', 'category', 'title', 'year'] as const;
const fileUrl = new URL('../src/data/photos.json', import.meta.url);
const photos: unknown = JSON.parse(await readFile(fileUrl, 'utf8'));
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(appRoot, '..', '..');
const sourceRoot = path.join(repoRoot, '资源', '摄影图片');
const maxBytes = 5 * 1024 * 1024;
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const imageExtensionLabels = ['jpg', 'jpeg', 'png', 'webp'];
const themeSubtitles = new Map([
  ['apricity', 'Apricity'],
  ['azure', 'Azure'],
  ['lush', 'Lush'],
  ['pall', 'Pall'],
]);
const hashedPhotoPathPattern = /^\/images\/photography\/([a-z]+)\/\1-\d{2}-[a-f0-9]{10}\.jpg$/;
const hashedPreviewPathPattern = /^\/images\/photography\/([a-z]+)\/preview\/\1-\d{2}-[a-f0-9]{10}-preview\.jpg$/;

async function createSourceHash(inputFile: string): Promise<string> {
  return createHash('sha256').update(await readFile(inputFile)).digest('hex').slice(0, 10);
}

function assertValidSourceName(themeSubtitle: string, fileName: string): void {
  const baseName = path.basename(fileName, path.extname(fileName));
  const extension = path.extname(fileName).toLowerCase();
  const relativeName = `${themeSubtitle}/${fileName}`;

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

if (!Array.isArray(photos)) {
  throw new Error('photos.json must contain an array.');
}

const photoRecords = photos as PhotoRecord[];
const slugs = new Set<string>();
const imageHashes = new Map<string, string>();

for (const [index, photo] of photoRecords.entries()) {
  for (const field of requiredFields) {
    if (photo[field] === undefined || (field !== 'title' && photo[field] === '')) {
      throw new Error(`Photo at index ${index} is missing required field: ${field}`);
    }
  }

  if (typeof photo.title !== 'string') {
    throw new Error(`Photo at index ${index} must use a string title.`);
  }

  if (photo.location !== undefined && typeof photo.location !== 'string') {
    throw new Error(`Photo at index ${index} must use a string location.`);
  }

  if (typeof photo.width !== 'number' || typeof photo.height !== 'number') {
    throw new Error(`Photo at index ${index} must use numeric width and height.`);
  }

  if (!String(photo.src).startsWith('/images/photography/')) {
    throw new Error(`Photo at index ${index} must use a public photography image path.`);
  }

  if (!hashedPhotoPathPattern.test(String(photo.src))) {
    throw new Error(`Photo at index ${index} must use a content-hashed image path: ${String(photo.src)}`);
  }

  const themeSubtitle = themeSubtitles.get(String(photo.themeSlug));
  if (!themeSubtitle) {
    throw new Error(`Photo at index ${index} uses an unknown themeSlug: ${String(photo.themeSlug)}`);
  }

  if (photo.themeSubtitle !== themeSubtitle) {
    throw new Error(`Photo at index ${index} has mismatched themeSubtitle: ${String(photo.themeSubtitle)}`);
  }

  if (!photo.originalFile) {
    throw new Error(`Photo at index ${index} is missing originalFile.`);
  }
  assertValidSourceName(themeSubtitle, String(photo.originalFile));

  const sourceHash = await createSourceHash(path.join(sourceRoot, themeSubtitle, String(photo.originalFile)));
  if (!String(photo.src).includes(`-${sourceHash}.jpg`) || !String(photo.previewSrc).includes(`-${sourceHash}-preview.jpg`)) {
    throw new Error(`Photo at index ${index} paths do not match source content hash: ${String(photo.originalFile)}`);
  }

  if (!String(photo.src).startsWith(`/images/photography/${String(photo.themeSlug)}/`)) {
    throw new Error(`Photo at index ${index} src does not match themeSlug: ${String(photo.src)}`);
  }

  if (photo.slug && !String(photo.slug).startsWith(`${String(photo.themeSlug)}-`)) {
    throw new Error(`Photo at index ${index} slug does not match themeSlug: ${String(photo.slug)}`);
  }

  const imagePath = path.join(appRoot, 'public', String(photo.src).replace(/^\//, ''));
  const imageStats = await stat(imagePath);
  if (imageStats.size > maxBytes) {
    throw new Error(`Photo at index ${index} exceeds 5MB: ${String(photo.src)}`);
  }

  const imageMetadata = await sharp(imagePath, { limitInputPixels: false }).metadata();
  if (imageMetadata.width !== photo.width || imageMetadata.height !== photo.height) {
    throw new Error(
      `Photo at index ${index} has mismatched dimensions: ${String(photo.src)} json=${photo.width}x${photo.height} actual=${imageMetadata.width}x${imageMetadata.height}`,
    );
  }

  const imageHash = createHash('sha256').update(await readFile(imagePath)).digest('hex');
  const duplicateSrc = imageHashes.get(imageHash);
  if (duplicateSrc) {
    throw new Error(`Duplicate image content: ${duplicateSrc} and ${photo.src}`);
  }
  imageHashes.set(imageHash, String(photo.src));

  if (photo.slug) {
    if (slugs.has(photo.slug)) {
      throw new Error(`Duplicate photo slug: ${photo.slug}`);
    }
    slugs.add(photo.slug);
  }

  if (photo.previewSrc) {
    if (!String(photo.previewSrc).startsWith('/images/photography/')) {
      throw new Error(`Photo at index ${index} must use a public photography preview path.`);
    }

    if (!hashedPreviewPathPattern.test(String(photo.previewSrc))) {
      throw new Error(`Photo at index ${index} must use a content-hashed preview path: ${String(photo.previewSrc)}`);
    }

    if (!String(photo.previewSrc).startsWith(`/images/photography/${String(photo.themeSlug)}/preview/`)) {
      throw new Error(`Photo at index ${index} previewSrc does not match themeSlug: ${String(photo.previewSrc)}`);
    }

    if (typeof photo.previewWidth !== 'number' || typeof photo.previewHeight !== 'number') {
      throw new Error(`Photo at index ${index} must use numeric previewWidth and previewHeight.`);
    }

    const previewPath = path.join(appRoot, 'public', String(photo.previewSrc).replace(/^\//, ''));
    const previewStats = await stat(previewPath);
    if (previewStats.size > maxBytes) {
      throw new Error(`Photo preview at index ${index} exceeds 5MB: ${photo.previewSrc}`);
    }

    const previewMetadata = await sharp(previewPath, { limitInputPixels: false }).metadata();
    if (previewMetadata.width !== photo.previewWidth || previewMetadata.height !== photo.previewHeight) {
      throw new Error(
        `Photo at index ${index} has mismatched preview dimensions: ${String(photo.previewSrc)} json=${photo.previewWidth}x${photo.previewHeight} actual=${previewMetadata.width}x${previewMetadata.height}`,
      );
    }
  }

  if (photo.placeholder && !String(photo.placeholder).startsWith('data:image/')) {
    throw new Error(`Photo at index ${index} has an invalid placeholder data URL.`);
  }
}

console.log(`Validated ${photoRecords.length} photo records.`);
