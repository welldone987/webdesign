import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPreviewSrc } from '../lib/photos.ts';
import { preloadImage, requestIdleTask, shouldSkipIdlePreload } from '../lib/imagePreload.ts';
import { MasonryGallery } from '../patterns/MasonryGallery.tsx';
import { ThemeRail } from '../patterns/ThemeRail.tsx';
import type { Photo, ThemeSummary } from '../types/photography.ts';

type ShowcaseViewProps = {
  themes: ThemeSummary[];
  activeThemeSlug: string;
  photos: Photo[];
  onHome: () => void;
  onSelectTheme: (themeSlug: string) => void;
  onOpenPhoto: (photo: Photo, trigger: HTMLButtonElement) => void;
};

type ShowcaseSection = 'presentation' | 'profile';

export function ShowcaseView({
  themes,
  activeThemeSlug,
  photos,
  onHome,
  onSelectTheme,
  onOpenPhoto,
}: ShowcaseViewProps) {
  const [activeSection, setActiveSection] = useState<ShowcaseSection>('presentation');
  const activeTheme = themes.find((theme) => theme.slug === activeThemeSlug) ?? themes[0];
  const topLevelItemClass =
    'min-h-11 px-1 font-serif text-base font-semibold leading-none transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-umber';
  const mobilePrimaryItemClass = `${topLevelItemClass} border-b-2`;
  const desktopTopLevelItemClass = `${topLevelItemClass} block w-full text-left`;

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
        <aside className="sticky top-0 z-30 min-w-0 overflow-hidden bg-white/95 py-2 text-ink backdrop-blur lg:top-8 lg:h-[calc(100vh-4rem)] lg:bg-transparent lg:py-0 lg:backdrop-blur-0">
          <nav
            aria-label="展示页目录"
            className="min-w-0 border-b border-ink/10 pb-3 text-ink lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8"
          >
            <div className="lg:hidden">
              <div className="grid grid-cols-3 gap-3 text-center">
                <button
                  className={`${mobilePrimaryItemClass} grid place-items-center border-transparent text-ink/66`}
                  onClick={onHome}
                  type="button"
                >
                  总览
                </button>
                <button
                  aria-controls="mobile-theme-menu"
                  aria-expanded={activeSection === 'presentation'}
                  className={`${mobilePrimaryItemClass} grid place-items-center ${
                    activeSection === 'presentation'
                      ? 'border-ink text-ink'
                      : 'border-transparent text-ink/66'
                  }`}
                  onClick={() => setActiveSection('presentation')}
                  type="button"
                >
                  呈现
                </button>
                <button
                  className={`${mobilePrimaryItemClass} grid place-items-center ${
                    activeSection === 'profile'
                      ? 'border-ink text-ink'
                      : 'border-transparent text-ink/66'
                  }`}
                  onClick={() => setActiveSection('profile')}
                  type="button"
                >
                  个人简介
                </button>
              </div>
              {activeSection === 'presentation' ? (
                <div className="mt-3" id="mobile-theme-menu">
                  <ThemeRail
                    activeThemeSlug={activeThemeSlug}
                    onSelectTheme={handleSelectTheme}
                    themes={themes}
                  />
                </div>
              ) : null}
            </div>

            <div className="hidden lg:block">
              <button className={`${desktopTopLevelItemClass} text-ink/64`} onClick={onHome} type="button">
                总览
              </button>
              <div className="mt-8">
                <button
                  aria-expanded={activeSection === 'presentation'}
                  className={`${desktopTopLevelItemClass} mb-3 ${
                    activeSection === 'presentation' ? 'text-ink underline underline-offset-4' : 'text-ink/64'
                  }`}
                  onClick={() => setActiveSection('presentation')}
                  type="button"
                >
                  呈现
                </button>
                <ThemeRail
                  activeThemeSlug={activeThemeSlug}
                  onSelectTheme={handleSelectTheme}
                  themes={themes}
                />
              </div>
              <button
                className={`${desktopTopLevelItemClass} mt-8 ${
                  activeSection === 'profile' ? 'text-ink underline underline-offset-4' : 'text-ink/64'
                }`}
                onClick={() => setActiveSection('profile')}
                type="button"
              >
                个人简介
              </button>
            </div>
          </nav>
        </aside>

        <section className="min-w-0 pb-16">
          {activeSection === 'presentation' ? (
            <>
              {activeTheme ? (
                <header className="hidden border-b border-ink/10 pb-8 lg:block">
                  <p className="font-serif text-sm uppercase tracking-[0.32em] text-ink/45">Photography Archive</p>
                  <h1 className="mt-5 flex items-baseline gap-7 text-ink">
                    <span className="font-serif text-6xl leading-none xl:text-7xl">{activeTheme.name}</span>
                    <span className="font-sans text-5xl leading-none tracking-normal xl:text-6xl">
                      {activeTheme.subtitle}
                    </span>
                  </h1>
                </header>
              ) : null}
              <div className={activeTheme ? 'lg:pt-11' : undefined}>
                <MasonryGallery onOpenPhoto={onOpenPhoto} photos={photos} />
              </div>
            </>
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
