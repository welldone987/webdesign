import type { Photo, ThemeSummary } from '../types/photography.ts';

export const allCollectionSlug = 'all';

export const themeAccents = {
  apricity: { accent: '#C99567', soft: '#EBD7BF' },
  azure: { accent: '#7F9FB0', soft: '#D7E4E9' },
  lush: { accent: '#8F9F76', soft: '#DEE7D2' },
  pall: { accent: '#8F8B84', soft: '#E0DDD7' },
} as const;

export function buildThemes(items: Photo[]): ThemeSummary[] {
  const themeMap = new Map<string, ThemeSummary>();

  for (const photo of items) {
    if (!themeMap.has(photo.themeSlug)) {
      themeMap.set(photo.themeSlug, {
        name: photo.category,
        slug: photo.themeSlug,
        subtitle: photo.themeSubtitle,
        description: photo.themeDescription,
        cover: photo,
        count: 0,
      });
    }

    const theme = themeMap.get(photo.themeSlug);
    if (theme) {
      theme.count += 1;
    }
  }

  return Array.from(themeMap.values());
}
