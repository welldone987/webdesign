import { AnimatePresence } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import photos from '../data/photos.json';
import { buildThemes } from '../data/themes.ts';
import { preloadImage } from '../lib/imagePreload.ts';
import { HomePage } from '../pages/HomePage.tsx';
import { ThemeGalleryPage } from '../pages/ThemeGalleryPage.tsx';
import { DetailOverlay } from '../patterns/DetailOverlay.tsx';
import type { Photo } from '../types/photography.ts';
import type { SitePage } from './pageState.ts';

const allPhotos = photos as Photo[];

export function PhotographyApp() {
  const [page, setPage] = useState<SitePage>('home');
  const [activeThemeSlug, setActiveThemeSlug] = useState(allPhotos[0]?.themeSlug ?? 'warm');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const photoTriggerRef = useRef<HTMLButtonElement | null>(null);
  const themes = useMemo(() => buildThemes(allPhotos), []);
  const activeTheme = themes.find((theme) => theme.slug === activeThemeSlug) ?? themes[0];
  const activePhotos = allPhotos.filter((photo) => photo.themeSlug === activeTheme?.slug);

  const selectTheme = (themeSlug: string) => {
    setActiveThemeSlug(themeSlug);
  };

  const openThemeGallery = (themeSlug: string) => {
    setActiveThemeSlug(themeSlug);
    setPage('theme-gallery');
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const openPhoto = (photo: Photo, trigger: HTMLButtonElement) => {
    photoTriggerRef.current = trigger;
    preloadImage(photo.src);
    setSelectedPhoto(photo);
  };

  const selectPhoto = (photo: Photo) => {
    preloadImage(photo.src);
    setSelectedPhoto(photo);
  };

  const closePhoto = () => {
    setSelectedPhoto(null);
    window.requestAnimationFrame(() => photoTriggerRef.current?.focus());
  };

  return (
    <div className="min-h-screen bg-white text-ink">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-ink focus:px-4 focus:py-3 focus:text-white"
        href="#main-content"
      >
        跳到主要内容
      </a>
      <AnimatePresence mode="wait">
        {page === 'home' ? (
          <HomePage
            activeThemeSlug={activeThemeSlug}
            key="home"
            onOpenThemeGallery={openThemeGallery}
            onSelectTheme={selectTheme}
            photos={allPhotos}
            themes={themes}
          />
        ) : (
          <ThemeGalleryPage
            activeThemeSlug={activeThemeSlug}
            key="theme-gallery"
            onHome={() => setPage('home')}
            onOpenPhoto={openPhoto}
            onSelectTheme={selectTheme}
            photos={activePhotos}
            themes={themes}
          />
        )}
      </AnimatePresence>
      <DetailOverlay onClose={closePhoto} onSelectPhoto={selectPhoto} photos={activePhotos} selectedPhoto={selectedPhoto} />
    </div>
  );
}
