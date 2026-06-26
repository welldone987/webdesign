import { copyFile, mkdir, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import exifr from 'exifr';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(appRoot, '..', '..');
const sourceRoot = path.join(repoRoot, '资源', '摄影图片');
const publicRoot = path.join(appRoot, 'public', 'images', 'photography');
const photosFile = path.join(appRoot, 'src', 'data', 'photos.json');
const maxBytes = 15 * 1024 * 1024;

const themes = [
  {
    name: '暖',
    slug: 'warm',
    subtitle: 'Apricity',
    description: '偏向柔和、亲近与温度的画面。',
  },
  {
    name: '湛',
    slug: 'azure',
    subtitle: 'Azure',
    description: '更清透、冷静、带有空气感的影像。',
  },
  {
    name: '盛',
    slug: 'bloom',
    subtitle: 'Lush',
    description: '明亮、丰盛、带有展开感的瞬间。',
  },
  {
    name: '郁',
    slug: 'umbrage',
    subtitle: 'Penumbra',
    description: '更深、更密、更内向的观看经验。',
  },
];

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const excludedSourceIndexes = new Map([
  ['warm', new Set([1, 4, 5])],
  ['bloom', new Set([9])],
  ['umbrage', new Set([5])],
]);

function formatDate(value) {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const text = String(value).trim();
  const match = text.match(/^(\d{4})[:/-](\d{2})[:/-](\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : text;
}

function formatShutter(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return undefined;
  }

  if (value < 1) {
    const denominator = Math.round(1 / value);
    return `1/${denominator}s`;
  }

  return `${Number(value.toFixed(1))}s`;
}

function formatAperture(value) {
  return Number.isFinite(value) ? `f/${Number(value.toFixed(1))}` : undefined;
}

function formatIso(value) {
  return Number.isFinite(value) ? `ISO ${Math.round(value)}` : undefined;
}

async function readExif(inputFile) {
  try {
    const data = await exifr.parse(inputFile, {
      tiff: true,
      exif: true,
      pick: ['DateTimeOriginal', 'CreateDate', 'ModifyDate', 'FNumber', 'ExposureTime', 'ISO'],
    });

    return {
      date: formatDate(data?.DateTimeOriginal ?? data?.CreateDate ?? data?.ModifyDate),
      aperture: formatAperture(data?.FNumber),
      shutterSpeed: formatShutter(data?.ExposureTime),
      iso: formatIso(data?.ISO),
    };
  } catch {
    return {};
  }
}

async function compressLargeJpeg(inputFile, outputFile, imageMetadata) {
  const qualities = [96, 94, 92, 90, 88, 86, 84, 82];
  const base = sharp(inputFile, { limitInputPixels: false }).rotate();
  const tempFile = `${outputFile}.${process.pid}.tmp`;

  for (const quality of qualities) {
    await rm(tempFile, { force: true });
    await base
      .clone()
      .jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(tempFile);

    const outputStats = await stat(tempFile);
    if (outputStats.size <= maxBytes) {
      await rm(outputFile, { force: true });
      await rename(tempFile, outputFile);
      return { optimized: true, quality, resized: false, bytes: outputStats.size };
    }
  }

  const width = imageMetadata.width ?? 2400;
  const height = imageMetadata.height ?? 1600;
  let scale = 0.96;

  while (scale >= 0.64) {
    const resizedWidth = Math.max(1200, Math.round(width * scale));
    const resizedHeight = Math.max(1200, Math.round(height * scale));

    await rm(tempFile, { force: true });
    await sharp(inputFile, { limitInputPixels: false })
      .rotate()
      .resize({
        width: resizedWidth,
        height: resizedHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(tempFile);

    const outputStats = await stat(tempFile);
    if (outputStats.size <= maxBytes) {
      await rm(outputFile, { force: true });
      await rename(tempFile, outputFile);
      return { optimized: true, quality: 86, resized: true, bytes: outputStats.size };
    }

    scale -= 0.04;
  }

  await rm(tempFile, { force: true });
  throw new Error(`Unable to compress ${inputFile} below 15MB.`);
}

async function copyOrCompress(inputFile, outputFile, sourceStats, imageMetadata) {
  if (sourceStats.size <= maxBytes) {
    await copyFile(inputFile, outputFile);
    return { optimized: false, bytes: sourceStats.size };
  }

  return compressLargeJpeg(inputFile, outputFile, imageMetadata);
}

await rm(publicRoot, { recursive: true, force: true });
await mkdir(publicRoot, { recursive: true });

const photos = [];
const seenOriginalFiles = new Set();

for (const theme of themes) {
  const sourceDir = path.join(sourceRoot, theme.name);
  const outputDir = path.join(publicRoot, theme.slug);
  await mkdir(outputDir, { recursive: true });

  const sourceFiles = (await readdir(sourceDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true }));

  const excludedIndexes = excludedSourceIndexes.get(theme.slug) ?? new Set();
  const files = sourceFiles.filter((_, index) => !excludedIndexes.has(index + 1));
  let themeIndex = 0;

  for (const fileName of files) {
    const originalKey = fileName.toLowerCase();
    if (seenOriginalFiles.has(originalKey)) {
      console.log(`${theme.name}: skipped duplicate source ${fileName}`);
      continue;
    }
    seenOriginalFiles.add(originalKey);
    themeIndex += 1;

    const inputFile = path.join(sourceDir, fileName);
    const outputName = `${theme.slug}-${String(themeIndex).padStart(2, '0')}.jpg`;
    const outputFile = path.join(outputDir, outputName);
    const sourceStats = await stat(inputFile);
    const sourceImage = sharp(inputFile, { limitInputPixels: false });
    const inputMetadata = await sourceImage.metadata();
    const exif = await readExif(inputFile);

    const result = await copyOrCompress(inputFile, outputFile, sourceStats, inputMetadata);
    const outputMetadata = await sharp(outputFile, { limitInputPixels: false }).metadata();
    const title = `${theme.name} ${String(themeIndex).padStart(2, '0')}`;

    photos.push({
      src: `/images/photography/${theme.slug}/${outputName}`,
      alt: `${theme.name}主题摄影作品 ${themeIndex}`,
      width: outputMetadata.width,
      height: outputMetadata.height,
      category: theme.name,
      themeSlug: theme.slug,
      themeSubtitle: theme.subtitle,
      themeDescription: theme.description,
      title,
      year: exif.date ? Number(exif.date.slice(0, 4)) : 2026,
      date: exif.date,
      aperture: exif.aperture,
      shutterSpeed: exif.shutterSpeed,
      iso: exif.iso,
      featured: themeIndex === 1,
      order: photos.length + 1,
      slug: `${theme.slug}-${String(themeIndex).padStart(2, '0')}`,
      originalFile: fileName,
      optimized: result.optimized,
      sizeBytes: result.bytes,
    });

    console.log(
      `${theme.name} ${themeIndex}/${files.length}: ${fileName} -> ${outputName} ${
        result.optimized ? 'optimized' : 'copied'
      }`,
    );
  }
}

await writeFile(`${photosFile}.tmp`, `${JSON.stringify(photos, null, 2)}\n`, 'utf8');
await rm(photosFile, { force: true });
await copyFile(`${photosFile}.tmp`, photosFile);
await rm(`${photosFile}.tmp`, { force: true });

console.log(`Prepared ${photos.length} photos.`);
