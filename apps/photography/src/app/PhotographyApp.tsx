import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { allPhotos, defaultThemeSlug, getPhotosByTheme, themes } from '../data/photoCollection.ts';
import { HomePage } from '../pages/HomePage.tsx';
import { ThemeGalleryPage } from '../pages/ThemeGalleryPage.tsx';
import { DetailOverlay } from '../patterns/DetailOverlay.tsx';
import type { SitePage } from './pageState.ts';
import { usePhotoDetail } from './usePhotoDetail.ts';

export function PhotographyApp() {
  const [page, setPage] = useState<SitePage>('home');
  const [activeThemeSlug, setActiveThemeSlug] = useState(defaultThemeSlug);
  const { selectedPhoto, openPhoto, selectPhoto, closePhoto } = usePhotoDetail();
  const activeTheme = themes.find((theme) => theme.slug === activeThemeSlug) ?? themes[0];
  const activePhotos = getPhotosByTheme(activeTheme?.slug ?? defaultThemeSlug);

  const selectTheme = (themeSlug: string) => {
    setActiveThemeSlug(themeSlug);
  };

  const openThemeGallery = (themeSlug: string) => {
    setActiveThemeSlug(themeSlug);
    setPage('theme-gallery');
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
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
