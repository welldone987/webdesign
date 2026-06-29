import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TopBar } from '../components/TopBar.tsx';
import { allCollectionSlug } from '../data/themes.ts';
import { getPreviewSrc } from '../lib/photos.ts';
import { preloadImage, requestIdleTask, shouldSkipIdlePreload } from '../lib/imagePreload.ts';
import { MasonryGallery } from '../patterns/MasonryGallery.tsx';
import { ThemeRail } from '../patterns/ThemeRail.tsx';
import type { Photo, ThemeSummary } from '../types/photography.ts';

type ShowcaseViewProps = {
  themes: ThemeSummary[];
  activeTheme: ThemeSummary;
  activeThemeSlug: string;
  photos: Photo[];
  onBack: () => void;
  onSelectTheme: (themeSlug: string) => void;
  onOpenPhoto: (photo: Photo, trigger: HTMLButtonElement) => void;
};

type MobileMenuSection = 'overview' | 'presentation' | 'profile';

export function ShowcaseView({
  themes,
  activeTheme,
  activeThemeSlug,
  photos,
  onBack,
  onSelectTheme,
  onOpenPhoto,
}: ShowcaseViewProps) {
  const isAllPhotos = activeThemeSlug === allCollectionSlug;
  const displayName = isAllPhotos ? '全部图片' : activeTheme.name;
  const displaySubtitle = isAllPhotos ? 'All Photographs' : activeTheme.subtitle;
  const [mobileMenuSection, setMobileMenuSection] = useState<MobileMenuSection>('presentation');
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

  return (
    <motion.main
      animate={{ opacity: 1 }}
      className="min-h-screen px-5 py-6 sm:px-8"
      exit={{ opacity: 0 }}
      id="main-content"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <TopBar onBack={onBack} title="Selected Works" />
      <div className="mx-auto grid max-w-[1500px] min-w-0 gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="sticky top-0 z-30 min-w-0 overflow-hidden bg-porcelain/95 py-2 backdrop-blur lg:top-8 lg:h-[calc(100vh-4rem)] lg:bg-transparent lg:py-0 lg:backdrop-blur-0">
          <nav
            aria-label="展示页目录"
            className="min-w-0 border-b border-ink/10 pb-3 text-ink/64 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8"
          >
            <div className="lg:hidden">
              <div className="grid grid-cols-3 gap-4">
                <a
                  className={`${mobilePrimaryItemClass} ${
                    mobileMenuSection === 'overview'
                      ? 'border-ink text-ink'
                      : 'border-transparent text-ink/66'
                  }`}
                  href="#intro"
                  onClick={() => setMobileMenuSection('overview')}
                >
                  总览
                </a>
                <button
                  aria-controls="mobile-theme-menu"
                  aria-expanded={mobileMenuSection === 'presentation'}
                  className={`${mobilePrimaryItemClass} text-left ${
                    mobileMenuSection === 'presentation'
                      ? 'border-ink text-ink'
                      : 'border-transparent text-ink/66'
                  }`}
                  onClick={() => setMobileMenuSection('presentation')}
                  type="button"
                >
                  呈现
                </button>
                <a
                  className={`${mobilePrimaryItemClass} ${
                    mobileMenuSection === 'profile'
                      ? 'border-ink text-ink'
                      : 'border-transparent text-ink/66'
                  }`}
                  href="#profile"
                  onClick={() => setMobileMenuSection('profile')}
                >
                  个人简介
                </a>
              </div>
              {mobileMenuSection === 'presentation' ? (
                <div className="mt-3" id="mobile-theme-menu">
                  <ThemeRail
                    activeThemeSlug={activeThemeSlug}
                    isAllPhotos={isAllPhotos}
                    onSelectTheme={onSelectTheme}
                    themes={themes}
                  />
                </div>
              ) : null}
            </div>

            <div className="hidden lg:block">
              <a className={`${desktopTopLevelItemClass} text-ink underline underline-offset-4`} href="#intro">
                总览
              </a>
              <div className="mt-8">
                <p className={`${desktopTopLevelItemClass} mb-3 text-ink`}>呈现</p>
                <ThemeRail
                  activeThemeSlug={activeThemeSlug}
                  isAllPhotos={isAllPhotos}
                  onSelectTheme={onSelectTheme}
                  themes={themes}
                />
              </div>
              <a className={`${desktopTopLevelItemClass} mt-8 text-ink/64`} href="#profile">
                个人简介
              </a>
            </div>
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="mb-12 grid gap-6 border-b border-ink/10 pb-8 md:grid-cols-[0.8fr_1fr]" id="intro">
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.22em] text-moss">Photography Archive</p>
              <h1 className="mt-4 font-serif text-5xl leading-none text-ink sm:text-7xl">
                {displayName}
                <span className="ml-5 align-middle font-sans text-[0.5em] tracking-[0.08em] text-ink/38">
                  {displaySubtitle}
                </span>
              </h1>
            </div>
            <p className="max-w-2xl font-serif text-lg leading-8 text-ink/68">
              这是一组以个人观看经验整理的摄影集。界面保持留白，让目录、瀑布流和大图详情服务于照片本身。
              当前{isAllPhotos ? '图库' : '主题'}包含 {photos.length} 张作品。
            </p>
          </header>

          <MasonryGallery onOpenPhoto={onOpenPhoto} photos={photos} />

          <section className="mt-20 border-t border-ink/10 py-10" id="profile">
            <h2 className="font-serif text-3xl">个人简介</h2>
            <p className="mt-4 max-w-2xl font-serif text-lg leading-8 text-ink/65">
              一个持续整理影像的人。偏好安静的光、可停留的细节，以及照片中没有被立即说完的部分。
            </p>
          </section>
        </section>
      </div>
    </motion.main>
  );
}
