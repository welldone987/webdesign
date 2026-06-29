import { useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import photos from '../data/photos.json';
import { allCollectionSlug, buildThemes } from '../data/themes.ts';
import { preloadImage } from '../lib/imagePreload.ts';
import { useReducedMotionPreference } from '../motion/useReducedMotionPreference.ts';
import { DetailOverlay } from '../patterns/DetailOverlay.tsx';
import type { Photo } from '../types/photography.ts';
import { GuideView } from '../views/GuideView.tsx';
import { HomeView } from '../views/HomeView.tsx';
import { ShowcaseView } from '../views/ShowcaseView.tsx';
import type { PhotographyView } from './viewState.ts';

const allPhotos = photos as Photo[];

export function PhotographyApp() {
  const prefersReducedMotion = useReducedMotionPreference();
  const [view, setView] = useState<PhotographyView>('home');
  const [activeThemeSlug, setActiveThemeSlug] = useState(allPhotos[0]?.themeSlug ?? 'warm');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const photoTriggerRef = useRef<HTMLButtonElement | null>(null);
  const themes = useMemo(() => buildThemes(allPhotos), []);
  const pallPhotos = useMemo(() => allPhotos.filter((photo) => photo.themeSlug === 'umbrage'), []);
  const activeTheme = themes.find((theme) => theme.slug === activeThemeSlug) ?? themes[0];
  const activePhotos =
    activeThemeSlug === allCollectionSlug ? allPhotos : allPhotos.filter((photo) => photo.themeSlug === activeTheme?.slug);

  const openGuide = () => {
    setView('guide');
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const openShowcase = (themeSlug: string) => {
    setActiveThemeSlug(themeSlug);
    setView('showcase');
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
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
    <div className="min-h-screen bg-porcelain text-ink">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-ink focus:px-4 focus:py-3 focus:text-porcelain"
        href="#main-content"
      >
        跳到主要内容
      </a>
      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <HomeView fallbackPhotos={allPhotos} key="home" onEnter={openGuide} photos={pallPhotos} />
        ) : null}
        {view === 'guide' ? (
          <GuideView key="guide" onBack={() => setView('home')} onSelectTheme={openShowcase} themes={themes} />
        ) : null}
        {view === 'showcase' && activeTheme ? (
          <ShowcaseView
            activeTheme={activeTheme}
            activeThemeSlug={activeThemeSlug}
            key="showcase"
            onBack={() => setView('guide')}
            onOpenPhoto={openPhoto}
            onSelectTheme={openShowcase}
            photos={activePhotos}
            themes={themes}
          />
        ) : null}
      </AnimatePresence>
      <DetailOverlay onClose={closePhoto} onSelectPhoto={selectPhoto} photos={activePhotos} selectedPhoto={selectedPhoto} />
    </div>
  );
}
