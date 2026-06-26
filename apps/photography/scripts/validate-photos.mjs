import { readFile } from 'node:fs/promises';

const requiredFields = ['src', 'alt', 'width', 'height', 'category', 'title', 'year'];
const fileUrl = new URL('../src/data/photos.json', import.meta.url);
const photos = JSON.parse(await readFile(fileUrl, 'utf8'));

if (!Array.isArray(photos)) {
  throw new Error('photos.json must contain an array.');
}

const slugs = new Set();

photos.forEach((photo, index) => {
  for (const field of requiredFields) {
    if (photo[field] === undefined || photo[field] === '') {
      throw new Error(`Photo at index ${index} is missing required field: ${field}`);
    }
  }

  if (typeof photo.width !== 'number' || typeof photo.height !== 'number') {
    throw new Error(`Photo at index ${index} must use numeric width and height.`);
  }

  if (photo.slug) {
    if (slugs.has(photo.slug)) {
      throw new Error(`Duplicate photo slug: ${photo.slug}`);
    }
    slugs.add(photo.slug);
  }
});

console.log(`Validated ${photos.length} photo records.`);
