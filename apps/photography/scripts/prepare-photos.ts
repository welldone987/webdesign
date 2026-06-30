import { copyFile, mkdir, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import exifr from 'exifr';
import sharp, { type Metadata } from 'sharp';

type Theme = {
  name: string;
  slug: string;
  subtitle: string;
  description: string;
};

type ExifData = {
  date?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
};

type CompressionResult = {
  optimized: boolean;
  quality: number;
  resized: boolean;
  bytes: number;
};

type CopyResult = CompressionResult & {
  sourceBytes: number;
};

type PreviewResult = {
  width: number;
  height: number;
  bytes: number;
};

type PhotoRecord = {
  src: string;
  previewSrc: string;
  alt: string;
  width: number;
  height: number;
  previewWidth: number;
  previewHeight: number;
  category: string;
  themeSlug: string;
  themeSubtitle: string;
  themeDescription: string;
  placeholder: string;
  title: string;
  year: number;
  date?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  featured: boolean;
  order: number;
  slug: string;
  originalFile: string;
  optimized: boolean;
  sizeBytes: number;
  previewSizeBytes: number;
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(appRoot, '..', '..');
const sourceRoot = path.join(repoRoot, '资源', '摄影图片');
const publicRoot = path.join(appRoot, 'public', 'images', 'photography');
const photosFile = path.join(appRoot, 'src', 'data', 'photos.json');
const maxBytes = 5 * 1024 * 1024;
const previewMaxSize = 900;
const placeholderWidth = 36;

const themes: Theme[] = [
  {
    name: '暖',
    slug: 'warm',
    subtitle: 'Apricity',
    description: '柔和的光、近处的温度，以及日常里安静停留的瞬间。',
  },
  {
    name: '湛',
    slug: 'azure',
    subtitle: 'Azure',
    description: '清透、冷静，保留天空与水面之间的呼吸感。',
  },
  {
    name: '盛',
    slug: 'bloom',
    subtitle: 'Lush',
    description: '明亮而丰盛，记录色彩舒展、生命向外生长的片刻。',
  },
  {
    name: '郁',
    slug: 'umbrage',
    subtitle: 'Pall',
    description: '更深、更密，把视线收回到阴影、纹理与未说完的部分。',
  },
];

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const excludedSourceIndexes = new Map<string, Set<number>>([
  ['warm', new Set([1, 4, 5])],
  ['bloom', new Set([9])],
  ['umbrage', new Set([5])],
]);

function formatDate(value: unknown): string | undefined {
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

function formatShutter(value: unknown): string | undefined {
  if (typeof value !== 'number') {
    return undefined;
  }

  if (!Number.isFinite(value) || value <= 0) {
    return undefined;
  }

  if (value < 1) {
    const denominator = Math.round(1 / value);
    return `1/${denominator}s`;
  }

  return `${Number(value.toFixed(1))}s`;
}

function formatAperture(value: unknown): string | undefined {
  if (typeof value !== 'number') {
    return undefined;
  }

  return Number.isFinite(value) ? `f/${Number(value.toFixed(1))}` : undefined;
}

function formatIso(value: unknown): string | undefined {
  if (typeof value !== 'number') {
    return undefined;
  }

  return Number.isFinite(value) ? `ISO ${Math.round(value)}` : undefined;
}

async function readExif(inputFile: string): Promise<ExifData> {
  try {
    const data = (await exifr.parse(inputFile, {
      tiff: true,
      exif: true,
      pick: ['DateTimeOriginal', 'CreateDate', 'ModifyDate', 'FNumber', 'ExposureTime', 'ISO'],
    })) as Record<string, unknown> | undefined;

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

async function optimizeJpegToBudget(
  inputFile: string,
  outputFile: string,
  imageMetadata: Metadata,
): Promise<CompressionResult> {
  const qualities = [92, 90, 88, 86, 84, 82, 80, 78, 76];
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
  let scale = 0.92;

  while (scale >= 0.48) {
    const resizedWidth = Math.max(1800, Math.round(width * scale));
    const resizedHeight = Math.max(1800, Math.round(height * scale));

    await rm(tempFile, { force: true });
    await sharp(inputFile, { limitInputPixels: false })
      .rotate()
      .resize({
        width: resizedWidth,
        height: resizedHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(tempFile);

    const outputStats = await stat(tempFile);
    if (outputStats.size <= maxBytes) {
      await rm(outputFile, { force: true });
      await rename(tempFile, outputFile);
      return { optimized: true, quality: 82, resized: true, bytes: outputStats.size };
    }

    scale -= 0.04;
  }

  for (const quality of [74, 72, 70]) {
    await rm(tempFile, { force: true });
    await sharp(inputFile, { limitInputPixels: false })
      .rotate()
      .resize({
        width: 1800,
        height: 1800,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(tempFile);

    const outputStats = await stat(tempFile);
    if (outputStats.size <= maxBytes) {
      await rm(outputFile, { force: true });
      await rename(tempFile, outputFile);
      return { optimized: true, quality, resized: true, bytes: outputStats.size };
    }
  }

  await rm(tempFile, { force: true });
  throw new Error(`Unable to compress ${inputFile} below 5MB.`);
}

async function copyOrCompress(
  inputFile: string,
  outputFile: string,
  sourceStats: { size: number },
  imageMetadata: Metadata,
): Promise<CopyResult> {
  const result = await optimizeJpegToBudget(inputFile, outputFile, imageMetadata);
  return { ...result, sourceBytes: sourceStats.size };
}

async function createPreview(inputFile: string, outputFile: string): Promise<PreviewResult> {
  await sharp(inputFile, { limitInputPixels: false })
    .rotate()
    .resize({
      width: previewMaxSize,
      height: previewMaxSize,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(outputFile);

  const previewStats = await stat(outputFile);
  const previewMetadata = await sharp(outputFile, { limitInputPixels: false }).metadata();

  return {
    width: previewMetadata.width ?? 0,
    height: previewMetadata.height ?? 0,
    bytes: previewStats.size,
  };
}

async function createPlaceholder(inputFile: string): Promise<string> {
  const buffer = await sharp(inputFile, { limitInputPixels: false })
    .rotate()
    .resize({
      width: placeholderWidth,
      withoutEnlargement: true,
    })
    .blur(1.2)
    .jpeg({ quality: 42, mozjpeg: true })
    .toBuffer();

  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

await rm(publicRoot, { recursive: true, force: true });
await mkdir(publicRoot, { recursive: true });

const photos: PhotoRecord[] = [];
const seenOriginalFiles = new Set<string>();

for (const theme of themes) {
  const sourceDir = path.join(sourceRoot, theme.name);
  const outputDir = path.join(publicRoot, theme.slug);
  const previewDir = path.join(outputDir, 'preview');
  await mkdir(outputDir, { recursive: true });
  await mkdir(previewDir, { recursive: true });

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
    const previewName = `${theme.slug}-${String(themeIndex).padStart(2, '0')}-preview.jpg`;
    const outputFile = path.join(outputDir, outputName);
    const previewFile = path.join(previewDir, previewName);
    const sourceStats = await stat(inputFile);
    const sourceImage = sharp(inputFile, { limitInputPixels: false });
    const inputMetadata = await sourceImage.metadata();
    const exif = await readExif(inputFile);

    const result = await copyOrCompress(inputFile, outputFile, sourceStats, inputMetadata);
    const outputMetadata = await sharp(outputFile, { limitInputPixels: false }).metadata();
    const preview = await createPreview(outputFile, previewFile);
    const placeholder = await createPlaceholder(outputFile);
    const title = `${theme.name} ${String(themeIndex).padStart(2, '0')}`;

    photos.push({
      src: `/images/photography/${theme.slug}/${outputName}`,
      previewSrc: `/images/photography/${theme.slug}/preview/${previewName}`,
      alt: `${theme.name}主题摄影作品 ${themeIndex}`,
      width: outputMetadata.width ?? 0,
      height: outputMetadata.height ?? 0,
      previewWidth: preview.width,
      previewHeight: preview.height,
      category: theme.name,
      themeSlug: theme.slug,
      themeSubtitle: theme.subtitle,
      themeDescription: theme.description,
      placeholder,
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
      previewSizeBytes: preview.bytes,
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
