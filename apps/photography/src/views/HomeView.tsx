import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { getPreviewSrc } from '../lib/photos.ts';
import { preloadImage, requestIdleTask, shouldSkipIdlePreload } from '../lib/imagePreload.ts';
import { useReducedMotionPreference } from '../motion/useReducedMotionPreference.ts';
import { HomeHero } from '../patterns/HomeHero.tsx';
import { HomePreloader } from '../patterns/HomePreloader.tsx';
import { HomeVisualSections } from '../patterns/HomeVisualSections.tsx';
import { ProfileFooter } from '../patterns/ProfileFooter.tsx';
import type { Photo, ThemeSummary } from '../types/photography.ts';

type HomeViewProps = {
  photos: Photo[];
  themes: ThemeSummary[];
  activeThemeSlug: string;
  onSelectTheme: (themeSlug: string) => void;
  onOpenThemeGallery: (themeSlug: string) => void;
};

export function HomeView({ photos, themes, activeThemeSlug, onSelectTheme, onOpenThemeGallery }: HomeViewProps) {
  const prefersReducedMotion = useReducedMotionPreference();

  useEffect(() => {
    if (shouldSkipIdlePreload()) {
      return;
    }

    return requestIdleTask(() => {
      themes.forEach((theme) => preloadImage(getPreviewSrc(theme.cover)));
    });
  }, [themes]);

  return (
    <motion.main
      animate={{ opacity: 1 }}
      className="min-h-screen overflow-x-hidden bg-white text-black"
      id="main-content"
      initial={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
    >
      <HomePreloader prefersReducedMotion={prefersReducedMotion} />
      <HomeHero
        activeThemeSlug={activeThemeSlug}
        onOpenThemeGallery={onOpenThemeGallery}
        onSelectTheme={onSelectTheme}
        prefersReducedMotion={prefersReducedMotion}
        themes={themes}
      />
      <HomeVisualSections
        onOpenThemeGallery={onOpenThemeGallery}
        photos={photos}
        prefersReducedMotion={prefersReducedMotion}
        themes={themes}
      />
      <ProfileFooter />
    </motion.main>
  );
}
