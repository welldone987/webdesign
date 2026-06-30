import photos from './photos.json';
import { buildThemes } from './themes.ts';
import type { Photo } from '../types/photography.ts';

export const allPhotos = photos as Photo[];
export const themes = buildThemes(allPhotos);
export const defaultThemeSlug = allPhotos[0]?.themeSlug ?? themes[0]?.slug ?? 'warm';

export function getPhotosByTheme(themeSlug: string) {
  return allPhotos.filter((photo) => photo.themeSlug === themeSlug);
}
