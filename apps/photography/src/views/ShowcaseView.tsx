import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { getPreviewSrc } from '../lib/photos.ts';
import { preloadImage, requestIdleTask, shouldSkipIdlePreload } from '../lib/imagePreload.ts';
import { MasonryGallery } from '../patterns/MasonryGallery.tsx';
import type { Photo, ThemeSummary } from '../types/photography.ts';
import { ShowcaseNavigation, type ShowcaseSection } from './ShowcaseNavigation.tsx';

type ShowcaseViewProps = {
  themes: ThemeSummary[];
  activeThemeSlug: string;
  photos: Photo[];
  onHome: () => void;
  onSelectTheme: (themeSlug: string) => void;
  onOpenPhoto: (photo: Photo, trigger: HTMLButtonElement) => void;
};

export function ShowcaseView({
  themes,
  activeThemeSlug,
  photos,
  onHome,
  onSelectTheme,
  onOpenPhoto,
}: ShowcaseViewProps) {
  const [activeSection, setActiveSection] = useState<ShowcaseSection>('presentation');
  const presentationTopRef = useRef<HTMLDivElement>(null);
  const activeTheme = themes.find((theme) => theme.slug === activeThemeSlug) ?? themes[0];

  useEffect(() => {
    if (shouldSkipIdlePreload()) {
      return;
    }

    return requestIdleTask(() => {
      photos.slice(0, 9).forEach((photo) => preloadImage(getPreviewSrc(photo)));
    });
  }, [photos]);

  const handleSelectTheme = (themeSlug: string) => {
    setActiveSection('presentation');
    onSelectTheme(themeSlug);
    window.requestAnimationFrame(() => {
      const top = presentationTopRef.current?.getBoundingClientRect().top ?? 0;
      window.scrollTo({ top: window.scrollY + top - 16, behavior: 'auto' });
    });
  };

  return (
    <motion.main
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white px-5 py-6 text-ink sm:px-8"
      exit={{ opacity: 0 }}
      id="main-content"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mx-auto grid max-w-[1500px] min-w-0 gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <ShowcaseNavigation
          activeSection={activeSection}
          activeThemeSlug={activeThemeSlug}
          onHome={onHome}
          onSelectSection={setActiveSection}
          onSelectTheme={handleSelectTheme}
          themes={themes}
        />

        <section className="min-w-0 pb-16">
          {activeSection === 'presentation' ? (
            <div ref={presentationTopRef}>
              {activeTheme ? (
                <header className="hidden border-b border-ink/10 pb-8 lg:block">
                  <p className="font-serif text-sm uppercase tracking-[0.32em] text-ink/45">Photography Archive</p>
                  <h1 className="mt-5 flex items-baseline gap-7 text-ink">
                    <span className="font-serif text-6xl leading-none xl:text-7xl">{activeTheme.name}</span>
                    <span className="font-serif text-2xl font-light leading-none tracking-normal xl:text-3xl">
                      {activeTheme.subtitle}
                    </span>
                  </h1>
                </header>
              ) : null}
              <div className={activeTheme ? 'lg:pt-11' : undefined}>
                <MasonryGallery onOpenPhoto={onOpenPhoto} photos={photos} />
              </div>
            </div>
          ) : null}

          {activeSection === 'profile' ? (
            <section className="mx-auto max-w-3xl border-t border-ink/10 py-12" id="profile">
              <h1 className="font-serif text-4xl leading-tight sm:text-5xl">个人简介</h1>
              <p className="mt-6 font-serif text-xl leading-9 text-ink/65">
                拍摄是整理记忆的方式。偏好安静的光、可停留的细节，以及画面里没有被立即说完的部分。
              </p>
            </section>
          ) : null}

          <footer className="mt-16 border-t border-ink/10 pt-6 text-center font-sans text-[0.68rem] tracking-[0.12em] text-ink/42">
            ©2026 InNothing. All Rights Reserved.
          </footer>
        </section>
      </div>
    </motion.main>
  );
}
