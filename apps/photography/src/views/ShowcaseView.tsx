import { useEffect } from 'react';
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
            className="min-w-0 border-b border-ink/10 pb-5 font-serif text-sm text-ink/64 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8"
          >
            <a className="block py-2 text-ink underline underline-offset-4" href="#intro">
              摄影集网站简介
            </a>
            <div className="mt-8">
              <p className="mb-3 font-serif text-base font-semibold text-ink">呈现</p>
              <ThemeRail
                activeThemeSlug={activeThemeSlug}
                isAllPhotos={isAllPhotos}
                onSelectTheme={onSelectTheme}
                themes={themes}
              />
            </div>
            <a className="mt-8 block py-2 transition hover:text-ink" href="#profile">
              个人简介
            </a>
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
