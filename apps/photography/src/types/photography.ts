export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  category: string;
  title: string;
  year: number;
  location?: string;
  featured?: boolean;
  order?: number;
  slug?: string;
};
