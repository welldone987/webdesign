export type Photo = {
  src: string;
  previewSrc?: string;
  alt: string;
  width: number;
  height: number;
  previewWidth?: number;
  previewHeight?: number;
  category: string;
  themeSlug: string;
  themeSubtitle: string;
  themeDescription: string;
  title: string;
  year: number;
  date?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  location?: string;
  featured?: boolean;
  order?: number;
  slug?: string;
  originalFile?: string;
  placeholder?: string;
  optimized?: boolean;
  sizeBytes?: number;
  previewSizeBytes?: number;
};

export type ThemeSummary = {
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  cover: Photo;
  count: number;
};
