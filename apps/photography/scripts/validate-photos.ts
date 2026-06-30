import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  year?: number;
  slug?: string;
  placeholder?: string;
};

const requiredFields = ['src', 'alt', 'width', 'height', 'category', 'title', 'year'] as const;
const fileUrl = new URL('../src/data/photos.json', import.meta.url);
const photos: unknown = JSON.parse(await readFile(fileUrl, 'utf8'));
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const maxBytes = 5 * 1024 * 1024;

if (!Array.isArray(photos)) {
  throw new Error('photos.json must contain an array.');
}

const photoRecords = photos as PhotoRecord[];
const slugs = new Set<string>();
const imageHashes = new Map<string, string>();

for (const [index, photo] of photoRecords.entries()) {
  for (const field of requiredFields) {
    if (photo[field] === undefined || photo[field] === '') {
      throw new Error(`Photo at index ${index} is missing required field: ${field}`);
    }
  }

  if (typeof photo.width !== 'number' || typeof photo.height !== 'number') {
    throw new Error(`Photo at index ${index} must use numeric width and height.`);
  }

  if (!String(photo.src).startsWith('/images/photography/')) {
    throw new Error(`Photo at index ${index} must use a public photography image path.`);
  }

  const imagePath = path.join(appRoot, 'public', String(photo.src).replace(/^\//, ''));
  const imageStats = await stat(imagePath);
  if (imageStats.size > maxBytes) {
    throw new Error(`Photo at index ${index} exceeds 5MB: ${String(photo.src)}`);
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

    if (typeof photo.previewWidth !== 'number' || typeof photo.previewHeight !== 'number') {
      throw new Error(`Photo at index ${index} must use numeric previewWidth and previewHeight.`);
    }

    const previewPath = path.join(appRoot, 'public', String(photo.previewSrc).replace(/^\//, ''));
    const previewStats = await stat(previewPath);
    if (previewStats.size > maxBytes) {
      throw new Error(`Photo preview at index ${index} exceeds 5MB: ${photo.previewSrc}`);
    }
  }

  if (photo.placeholder && !String(photo.placeholder).startsWith('data:image/')) {
    throw new Error(`Photo at index ${index} has an invalid placeholder data URL.`);
  }
}

console.log(`Validated ${photoRecords.length} photo records.`);
