import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const requiredFields = ['src', 'alt', 'width', 'height', 'category', 'title', 'year'];
const fileUrl = new URL('../src/data/photos.json', import.meta.url);
const photos = JSON.parse(await readFile(fileUrl, 'utf8'));
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const maxBytes = 15 * 1024 * 1024;

if (!Array.isArray(photos)) {
  throw new Error('photos.json must contain an array.');
}

const slugs = new Set();

for (const [index, photo] of photos.entries()) {
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

  const imagePath = path.join(appRoot, 'public', photo.src.replace(/^\//, ''));
  const imageStats = await stat(imagePath);
  if (imageStats.size > maxBytes) {
    throw new Error(`Photo at index ${index} exceeds 15MB: ${photo.src}`);
  }

  if (photo.slug) {
    if (slugs.has(photo.slug)) {
      throw new Error(`Duplicate photo slug: ${photo.slug}`);
    }
    slugs.add(photo.slug);
  }
}

console.log(`Validated ${photos.length} photo records.`);
