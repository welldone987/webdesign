import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import photos from './data/photos.json';
import type { Photo, ThemeSummary } from './types/photography.ts';

const allPhotos = photos as Photo[];
const missingText = '已消失';
const allCollectionSlug = 'all';
const preloadedImages = new Set<string>();
const themeAccents = {
  warm: { accent: '#C99567', soft: '#EBD7BF' },
  azure: { accent: '#7F9FB0', soft: '#D7E4E9' },
  bloom: { accent: '#8F9F76', soft: '#DEE7D2' },
  umbrage: { accent: '#8F8B84', soft: '#E0DDD7' },
} as const;

type View = 'home' | 'guide' | 'showcase';

function getPreviewSrc(photo: Photo) {
  return photo.previewSrc ?? photo.src;
}

function getPreviewWidth(photo: Photo) {
  return photo.previewWidth ?? photo.width;
}

function getPreviewHeight(photo: Photo) {
  return photo.previewHeight ?? photo.height;
}

function shouldSkipIdlePreload() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(connection?.saveData);
}

function preloadImage(src: string) {
  if (!src || preloadedImages.has(src)) {
    return;
  }

  preloadedImages.add(src);
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
}

function requestIdleTask(callback: () => void) {
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(callback, { timeout: 1800 });
    return () => window.cancelIdleCallback(handle);
  }

  const handle = globalThis.setTimeout(callback, 300);
  return () => globalThis.clearTimeout(handle);
}

function buildThemes(items: Photo[]): ThemeSummary[] {
  const themeMap = new Map<string, ThemeSummary>();

  for (const photo of items) {
    if (!themeMap.has(photo.themeSlug)) {
      themeMap.set(photo.themeSlug, {
        name: photo.category,
        slug: photo.themeSlug,
        subtitle: photo.themeSubtitle,
        description: photo.themeDescription,
        cover: photo,
        count: 0,
      });
    }

    const theme = themeMap.get(photo.themeSlug);
    if (theme) {
      theme.count += 1;
    }
  }

  return Array.from(themeMap.values());
}

function App() {
  const prefersReducedMotion = useReducedMotion();
  const [view, setView] = useState<View>('home');
  const [activeThemeSlug, setActiveThemeSlug] = useState(allPhotos[0]?.themeSlug ?? 'warm');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const photoTriggerRef = useRef<HTMLButtonElement | null>(null);
  const themes = useMemo(() => buildThemes(allPhotos), []);
  const umbragePhotos = useMemo(() => allPhotos.filter((photo) => photo.themeSlug === 'umbrage'), []);
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
          <HomeView key="home" onEnter={openGuide} photos={umbragePhotos} />
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
      <PhotoDetailOverlay
        onClose={closePhoto}
        onSelectPhoto={selectPhoto}
        photos={activePhotos}
        selectedPhoto={selectedPhoto}
      />
    </div>
  );
}

type HomeViewProps = {
  photos: Photo[];
  onEnter: () => void;
};

function HomeView({ photos, onEnter }: HomeViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const animationPhotos = photos.length > 0 ? photos : allPhotos.slice(0, 7);

  return (
    <motion.main
      animate={{ opacity: 1 }}
      className="relative isolate min-h-screen overflow-hidden bg-[#f7f7f4] text-black"
      exit={{ opacity: 0 }}
      id="main-content"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <HomeFrameMarks />
      <section className="relative mx-auto min-h-screen max-w-[1600px] px-5 py-5 sm:px-8 lg:px-10">
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 z-20 hidden h-screen w-5 bg-black sm:block lg:w-7"
        />
        <div
          aria-hidden="true"
          className="absolute left-0 top-[clamp(5.5rem,12vw,8.4rem)] z-20 h-px w-full bg-black/28"
        />

        <motion.h1
          animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
          aria-label="All About Photography"
          className="relative z-10 max-w-[min(94vw,75rem)] pt-8 font-sans text-[2.8rem] font-black uppercase leading-[0.84] tracking-normal text-black sm:pt-10 sm:text-[6.5rem] sm:leading-[0.78] lg:text-[8.8rem] xl:text-[9.6rem] 2xl:text-[11rem]"
          initial={prefersReducedMotion ? undefined : { opacity: 0, x: -28 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        >
          <span className="relative block w-fit overflow-hidden pb-[0.09em]">
            ALL
            <span className="absolute left-0 right-[-8vw] top-[0.46em] h-px bg-black/34" />
          </span>
          <span className="relative block w-fit overflow-hidden pb-[0.09em]">
            ABOUT
            <span className="absolute left-0 right-[-8vw] top-[0.46em] h-px bg-black/34" />
          </span>
          <span className="relative block w-fit overflow-hidden pb-[0.09em]">
            PHOTOGRAPHY
            <span className="absolute left-0 right-[-8vw] top-[0.46em] h-px bg-black/34" />
          </span>
        </motion.h1>

        <PhotoStackMotion photos={animationPhotos} prefersReducedMotion={Boolean(prefersReducedMotion)} />

        <motion.div
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="absolute bottom-8 right-5 z-30 flex items-end gap-5 sm:bottom-10 sm:right-8 lg:right-12"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          transition={{ delay: 0.28, duration: 0.6, ease: 'easeOut' }}
        >
          <button
            className="min-h-12 border border-black bg-black px-5 py-3 font-serif text-base text-[#f7f7f4] transition hover:bg-transparent hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-4 focus:ring-offset-[#f7f7f4]"
            onClick={onEnter}
            type="button"
          >
            进入
          </button>
          <p
            aria-label="無摄影集"
            className="font-serif text-[3.4rem] leading-[0.9] text-black [writing-mode:vertical-rl] sm:text-[5.5rem] lg:text-[6.5rem]"
          >
            無摄影集
          </p>
        </motion.div>
      </section>
    </motion.main>
  );
}

type PhotoStackMotionProps = {
  photos: Photo[];
  prefersReducedMotion: boolean;
};

function PhotoStackMotion({ photos, prefersReducedMotion }: PhotoStackMotionProps) {
  const stackPhotos = photos.slice(0, 7);

  return (
    <motion.div
      animate={prefersReducedMotion ? undefined : { opacity: 1, rotate: -5, y: [0, -10, 0] }}
      aria-hidden="true"
      className="absolute right-[-14vw] top-[42vh] z-0 h-[42vh] w-[74vw] max-w-[920px] -translate-y-1/2 sm:right-[-6vw] sm:top-[50vh] sm:h-[48vh] sm:w-[62vw] lg:right-[3vw] lg:top-[55vh] lg:h-[56vh] lg:w-[50vw]"
      initial={prefersReducedMotion ? undefined : { opacity: 0, rotate: -2, y: 28 }}
      transition={
        prefersReducedMotion
          ? undefined
          : {
              opacity: { duration: 0.7, ease: 'easeOut' },
              rotate: { duration: 0.7, ease: 'easeOut' },
              y: { duration: 8, ease: 'easeInOut', repeat: Infinity },
            }
      }
    >
      <div className="absolute inset-0 bg-black shadow-[0_28px_80px_rgba(0,0,0,0.18)]" />
      {stackPhotos.map((photo, index) => {
        const angle = -24 + index * 8;
        const offsetX = -18 + index * 8;
        const offsetY = 26 - index * 9;
        const widthClass = index % 3 === 0 ? 'w-[52%]' : index % 3 === 1 ? 'w-[46%]' : 'w-[58%]';
        const heightClass = index % 2 === 0 ? 'h-[44%]' : 'h-[54%]';

        return (
          <motion.div
            animate={prefersReducedMotion ? undefined : { y: [0, index % 2 === 0 ? 12 : -10, 0] }}
            className={`absolute left-1/2 top-1/2 ${widthClass} ${heightClass} overflow-hidden border border-white/65 bg-zinc-100 mix-blend-luminosity`}
            initial={false}
            key={photo.slug ?? photo.src}
            style={{
              transform: `translate(${offsetX - 50}%, ${offsetY - 50}%) rotate(${angle}deg) skewY(-8deg)`,
              zIndex: index + 1,
            }}
            transition={
              prefersReducedMotion
                ? undefined
                : { delay: index * 0.12, duration: 5.5 + index * 0.45, ease: 'easeInOut', repeat: Infinity }
            }
          >
            <img
              alt=""
              className="h-full w-full scale-125 object-cover grayscale blur-[3px] contrast-125"
              draggable={false}
              height={getPreviewHeight(photo)}
              loading={index < 3 ? 'eager' : 'lazy'}
              src={getPreviewSrc(photo)}
              width={getPreviewWidth(photo)}
            />
            <span className="absolute inset-0 bg-black/28" />
          </motion.div>
        );
      })}
      <div className="absolute bottom-[-8%] left-[13%] h-[3px] w-[62%] rotate-[-18deg] bg-black" />
      <div className="absolute right-[12%] top-[5%] h-[2px] w-[34%] rotate-[-32deg] bg-white/80" />
    </motion.div>
  );
}

type GuideViewProps = {
  themes: ThemeSummary[];
  onBack: () => void;
  onSelectTheme: (themeSlug: string) => void;
};

function GuideView({ themes, onBack, onSelectTheme }: GuideViewProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.main
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen overflow-hidden px-6 py-8 sm:px-10"
      exit={{ opacity: 0, y: -12 }}
      id="main-content"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <TopBar onBack={onBack} title="Guide" />
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col justify-center">
        <p className="font-serif text-2xl text-ink/70">选择一个主题开始观看</p>
        <div className="relative mt-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-porcelain to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-porcelain to-transparent" />
          <div className="scrollbar-thin flex snap-x gap-5 overflow-x-auto pb-8 pr-[42vw]">
            {themes.map((theme, index) => (
              <motion.button
                animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                className="group relative h-[58vh] min-h-[360px] w-[44vw] min-w-[310px] max-w-[560px] shrink-0 snap-start overflow-hidden bg-paper text-left focus:outline-none focus:ring-2 focus:ring-umber focus:ring-offset-4 focus:ring-offset-porcelain sm:w-[42vw]"
                initial={prefersReducedMotion ? undefined : { opacity: 0, x: 36 }}
                key={theme.slug}
                onClick={() => onSelectTheme(theme.slug)}
                transition={{ delay: index * 0.08, duration: 0.55, ease: 'easeOut' }}
                type="button"
              >
                <img
                  alt={theme.cover.alt}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                  height={theme.cover.height}
                  loading={index < 2 ? 'eager' : 'lazy'}
                  src={theme.cover.src}
                  width={theme.cover.width}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/8 to-transparent" />
                <span className="absolute bottom-7 left-7 right-7 flex items-end justify-between gap-5 text-porcelain">
                  <span className="font-serif text-[clamp(5rem,12vw,10rem)] leading-none opacity-86">
                    {theme.name}
                  </span>
                  <span className="pb-3 text-right">
                    <span className="block text-[clamp(2.5rem,6vw,5rem)] leading-none tracking-[0.04em] opacity-36">
                      {theme.subtitle}
                    </span>
                    <span className="mt-3 block max-w-52 font-serif text-base leading-6 opacity-90">
                      {theme.description}
                    </span>
                  </span>
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    </motion.main>
  );
}

type ShowcaseViewProps = {
  themes: ThemeSummary[];
  activeTheme: ThemeSummary;
  activeThemeSlug: string;
  photos: Photo[];
  onBack: () => void;
  onSelectTheme: (themeSlug: string) => void;
  onOpenPhoto: (photo: Photo, trigger: HTMLButtonElement) => void;
};

function ShowcaseView({
  themes,
  activeTheme,
  activeThemeSlug,
  photos,
  onBack,
  onSelectTheme,
  onOpenPhoto,
}: ShowcaseViewProps) {
  const prefersReducedMotion = useReducedMotion();
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
      <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
          <nav className="border-b border-ink/10 pb-5 font-serif text-sm text-ink/64 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8" aria-label="展示页目录">
            <a className="block py-2 text-ink underline underline-offset-4" href="#intro">
              摄影集网站简介
            </a>
            <div className="mt-8">
              <p className="mb-3 font-serif text-base font-semibold text-ink">呈现</p>
              <div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0">
                {themes.map((theme) => (
                  <button
                    aria-pressed={theme.slug === activeThemeSlug}
                    className="block min-h-11 min-w-24 shrink-0 border px-3 py-2 text-left transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-umber lg:w-full"
                    key={theme.slug}
                    onClick={() => onSelectTheme(theme.slug)}
                    style={
                      theme.slug === activeThemeSlug
                        ? {
                            backgroundColor: themeAccents[theme.slug as keyof typeof themeAccents]?.soft,
                            borderColor: themeAccents[theme.slug as keyof typeof themeAccents]?.accent,
                          }
                        : { borderColor: 'transparent' }
                    }
                    type="button"
                  >
                    <span className={theme.slug === activeThemeSlug ? 'text-ink' : undefined}>{theme.name}</span>
                    <span className="ml-3 font-sans text-xs tracking-[0.14em] opacity-45">
                      {theme.subtitle}
                    </span>
                  </button>
                ))}
                <button
                  aria-pressed={isAllPhotos}
                  className="block min-h-11 min-w-28 shrink-0 border border-transparent px-3 py-2 text-left transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-umber lg:mt-3 lg:w-full lg:border-t-ink/10 lg:py-3"
                  onClick={() => onSelectTheme(allCollectionSlug)}
                  type="button"
                >
                  <span className={isAllPhotos ? 'text-ink' : undefined}>全部图片</span>
                  <span className="ml-3 font-sans text-xs tracking-[0.14em] opacity-45">All Photographs</span>
                </button>
              </div>
            </div>
            <a className="mt-8 block py-2 transition hover:text-ink" href="#profile">
              个人简介
            </a>
          </nav>
        </aside>

        <section>
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

          <div className="columns-2 gap-3 lg:columns-3 lg:gap-5">
            {photos.map((photo, index) => (
              <motion.button
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                className="group mb-3 block w-full break-inside-avoid text-left focus:outline-none focus:ring-2 focus:ring-umber focus:ring-offset-4 focus:ring-offset-porcelain lg:mb-5"
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 18 }}
                key={photo.slug ?? photo.src}
                onClick={(event) => onOpenPhoto(photo, event.currentTarget)}
                onFocus={() => preloadImage(getPreviewSrc(photo))}
                onMouseEnter={() => {
                  if (window.matchMedia('(hover: hover)').matches) {
                    preloadImage(photo.src);
                  }
                }}
                transition={{ delay: Math.min(index * 0.025, 0.35), duration: 0.45, ease: 'easeOut' }}
                type="button"
              >
                <ProgressiveImage photo={photo} priority={index < 6} />
              </motion.button>
            ))}
          </div>

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

type ProgressiveImageProps = {
  photo: Photo;
  priority?: boolean;
};

function ProgressiveImage({ photo, priority = false }: ProgressiveImageProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const previewSrc = getPreviewSrc(photo);
  const previewWidth = getPreviewWidth(photo);
  const previewHeight = getPreviewHeight(photo);

  useEffect(() => {
    if (priority || shouldLoad) {
      return;
    }

    const element = containerRef.current;
    if (!element) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px 600px 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [priority, shouldLoad]);

  useEffect(() => {
    if (priority) {
      preloadImage(previewSrc);
    }
  }, [previewSrc, priority]);

  return (
    <span
      className="relative block w-full overflow-hidden bg-paper"
      ref={containerRef}
      style={{ aspectRatio: `${previewWidth} / ${previewHeight}` }}
    >
      {photo.placeholder ? (
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-xl"
          draggable={false}
          src={photo.placeholder}
        />
      ) : null}
      {shouldLoad ? (
        <img
          alt={photo.alt}
          className="absolute inset-0 h-full w-full object-cover transition group-hover:brightness-[0.94]"
          decoding="async"
          height={previewHeight}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setIsLoaded(true)}
          src={previewSrc}
          style={{
            opacity: isLoaded ? 1 : 0,
            transitionDuration: prefersReducedMotion ? '1ms' : '450ms',
          }}
          width={previewWidth}
        />
      ) : null}
    </span>
  );
}

type PhotoDetailOverlayProps = {
  photos: Photo[];
  selectedPhoto: Photo | null;
  onSelectPhoto: (photo: Photo) => void;
  onClose: () => void;
};

function PhotoDetailOverlay({ photos, selectedPhoto, onSelectPhoto, onClose }: PhotoDetailOverlayProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const selectedIndex = selectedPhoto
    ? photos.findIndex((photo) => (selectedPhoto.slug ? photo.slug === selectedPhoto.slug : photo.src === selectedPhoto.src))
    : -1;
  const previousPhoto = selectedIndex > 0 ? photos[selectedIndex - 1] : undefined;
  const nextPhoto = selectedIndex >= 0 && selectedIndex < photos.length - 1 ? photos[selectedIndex + 1] : undefined;
  const isLandscape = selectedPhoto ? selectedPhoto.width >= selectedPhoto.height : false;
  const detailCardClass = isLandscape
    ? 'relative grid max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-y-auto bg-porcelain shadow-2xl md:h-[min(72vh,760px)] md:w-[min(78vw,1240px)] md:max-h-[760px] md:grid-cols-[0.75fr_1.25fr] md:overflow-hidden'
    : 'relative grid max-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-y-auto bg-porcelain shadow-2xl md:max-h-[calc(100vh-4rem)] md:grid-cols-[0.82fr_1.18fr] md:overflow-hidden';
  const infoPanelClass = isLandscape
    ? 'order-2 overflow-y-auto p-7 font-serif text-ink md:order-1 md:p-10 lg:p-12'
    : 'order-2 overflow-y-auto p-7 font-serif text-ink md:order-1 md:p-10';
  const figureClass = isLandscape
    ? 'order-1 flex min-h-[280px] items-center justify-center bg-porcelain p-4 sm:p-6 md:order-2 md:h-full md:min-h-0 md:p-10'
    : 'order-1 flex min-h-0 items-center justify-center bg-porcelain p-4 sm:p-6 md:order-2 md:p-8';
  const imageClass = isLandscape
    ? 'max-h-[48vh] w-full object-contain md:max-h-full'
    : 'max-h-[52vh] w-auto max-w-full object-contain md:max-h-[calc(100vh-8rem)]';

  useEffect(() => {
    if (!selectedPhoto) {
      wasOpenRef.current = false;
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!wasOpenRef.current) {
      closeRef.current?.focus();
    }
    wasOpenRef.current = true;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedPhoto]);

  useEffect(() => {
    if (!selectedPhoto) {
      return;
    }

    if (!shouldSkipIdlePreload()) {
      return requestIdleTask(() => {
        if (previousPhoto) {
          preloadImage(previousPhoto.src);
        }
        if (nextPhoto) {
          preloadImage(nextPhoto.src);
        }
      });
    }
  }, [nextPhoto, previousPhoto, selectedPhoto]);

  useEffect(() => {
    if (!selectedPhoto) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Tab') {
        const focusable = Array.from(
          document.querySelectorAll<HTMLButtonElement>('[data-photo-detail-control="true"]'),
        ).filter((element) => !element.disabled);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!first || !last) {
          return;
        }

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key === 'ArrowLeft' && previousPhoto) {
        event.preventDefault();
        onSelectPhoto(previousPhoto);
      }
      if (event.key === 'ArrowRight' && nextPhoto) {
        event.preventDefault();
        onSelectPhoto(nextPhoto);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextPhoto, onClose, onSelectPhoto, previousPhoto, selectedPhoto]);

  const details = selectedPhoto
    ? [
        ['光圈', selectedPhoto.aperture],
        ['快门', selectedPhoto.shutterSpeed],
        ['感光度', selectedPhoto.iso],
        ['拍摄日期', selectedPhoto.date],
      ]
    : [];
  const hasMissing = details.some(([, value]) => !value);

  return (
    <AnimatePresence>
      {selectedPhoto ? (
        <motion.div
          animate={{ opacity: 1 }}
          aria-labelledby="photo-detail-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4 backdrop-blur-md sm:p-8"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          role="dialog"
        >
          <button
            aria-label="关闭图片详情"
            className="absolute left-4 top-4 z-10 min-h-11 border border-porcelain/60 bg-ink/35 px-4 py-2 font-serif text-porcelain focus:outline-none focus:ring-2 focus:ring-porcelain sm:left-8 sm:top-8"
            data-photo-detail-control="true"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            关闭
          </button>
          {previousPhoto ? (
            <PhotoSwitchButton direction="previous" onClick={() => onSelectPhoto(previousPhoto)} />
          ) : null}
          {nextPhoto ? <PhotoSwitchButton direction="next" onClick={() => onSelectPhoto(nextPhoto)} /> : null}
          <motion.div
            animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            className={detailCardClass}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98, y: 12 }}
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <section className={infoPanelClass}>
              <p className="text-sm tracking-[0.2em] text-moss">{selectedPhoto.category}</p>
              <h2 className="mt-5 text-4xl leading-tight" id="photo-detail-title">
                <span>{selectedPhoto.category}</span>
                <span className="font-numeric-serif ml-4">{selectedPhoto.title.replace(selectedPhoto.category, '').trim()}</span>
              </h2>
              <dl className="mt-10 space-y-5 text-lg leading-8">
                {details.map(([label, value]) => (
                  <div className="border-b border-ink/10 pb-4" key={label}>
                    <dt className="font-sans text-xs uppercase tracking-[0.2em] text-ink/42">{label}</dt>
                    <dd className="font-numeric-serif mt-1">{value || missingText}</dd>
                  </div>
                ))}
              </dl>
              {hasMissing ? <p className="mt-5 text-lg leading-8">不过回忆还在</p> : null}
            </section>
            <figure className={figureClass}>
              <ProgressiveDetailImage className={imageClass} photo={selectedPhoto} />
            </figure>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type PhotoSwitchButtonProps = {
  direction: 'previous' | 'next';
  onClick: () => void;
};

type ProgressiveDetailImageProps = {
  photo: Photo;
  className: string;
};

function ProgressiveDetailImage({ photo, className }: ProgressiveDetailImageProps) {
  const [largeLoaded, setLargeLoaded] = useState(false);
  const [largeFailed, setLargeFailed] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const previewSrc = getPreviewSrc(photo);

  useEffect(() => {
    setLargeLoaded(false);
    setLargeFailed(false);

    const image = new Image();
    image.decoding = 'async';
    image.onload = () => setLargeLoaded(true);
    image.onerror = () => {
      setLargeFailed(true);
      console.warn(`Failed to load full-size photo: ${photo.src}`);
    };
    image.src = photo.src;

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [photo.src]);

  return (
    <span className="relative block">
      <img
        alt={photo.alt}
        className={className}
        decoding="async"
        height={getPreviewHeight(photo)}
        src={previewSrc}
        width={getPreviewWidth(photo)}
      />
      {!largeFailed ? (
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain transition-opacity"
          decoding="async"
          height={photo.height}
          src={photo.src}
          style={{
            opacity: largeLoaded ? 1 : 0,
            transitionDuration: prefersReducedMotion ? '1ms' : '450ms',
          }}
          width={photo.width}
        />
      ) : null}
    </span>
  );
}

function PhotoSwitchButton({ direction, onClick }: PhotoSwitchButtonProps) {
  const isPrevious = direction === 'previous';

  return (
    <button
      aria-label={isPrevious ? '查看上一张照片' : '查看下一张照片'}
      className={`absolute top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center border border-ink/70 bg-porcelain/82 font-numeric-serif text-3xl leading-none text-ink shadow-sm backdrop-blur transition hover:bg-porcelain focus:outline-none focus:ring-2 focus:ring-umber focus:ring-offset-2 focus:ring-offset-transparent sm:h-14 sm:w-14 ${
        isPrevious ? 'left-3 sm:left-8' : 'right-3 sm:right-8'
      }`}
      data-photo-detail-control="true"
      onClick={onClick}
      type="button"
    >
      {isPrevious ? '<' : '>'}
    </button>
  );
}

type TopBarProps = {
  title: string;
  onBack: () => void;
};

function TopBar({ title, onBack }: TopBarProps) {
  return (
    <header className="mx-auto mb-8 flex max-w-[1500px] items-center justify-between font-serif text-sm">
      <button
        className="min-h-11 px-2 underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-umber"
        onClick={onBack}
        type="button"
      >
        返回
      </button>
      <p className="uppercase tracking-[0.24em] text-ink/45">{title}</p>
    </header>
  );
}

function HomeFrameMarks() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
    >
      <div className="absolute left-0 top-0 h-[6px] w-full bg-[#d7e4e2]" />
      <div className="absolute bottom-[18vh] left-[8vw] h-px w-[38vw] bg-black/14" />
      <div className="absolute bottom-[14vh] right-[8vw] h-px w-[26vw] bg-black/14" />
    </div>
  );
}

export default App;
