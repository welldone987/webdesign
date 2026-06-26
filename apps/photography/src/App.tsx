import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import photos from './data/photos.json';
import type { Photo, ThemeSummary } from './types/photography.ts';

const allPhotos = photos as Photo[];
const missingText = ':信息已消失';

type View = 'home' | 'guide' | 'showcase';

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
  const themes = useMemo(() => buildThemes(allPhotos), []);
  const activeTheme = themes.find((theme) => theme.slug === activeThemeSlug) ?? themes[0];
  const activePhotos = allPhotos.filter((photo) => photo.themeSlug === activeTheme?.slug);

  const openGuide = () => {
    setView('guide');
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const openShowcase = (themeSlug: string) => {
    setActiveThemeSlug(themeSlug);
    setView('showcase');
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
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
          <HomeView key="home" onEnter={openGuide} themes={themes} />
        ) : null}
        {view === 'guide' ? (
          <GuideView key="guide" onBack={() => setView('home')} onSelectTheme={openShowcase} themes={themes} />
        ) : null}
        {view === 'showcase' && activeTheme ? (
          <ShowcaseView
            activeTheme={activeTheme}
            key="showcase"
            onBack={() => setView('guide')}
            onOpenPhoto={setSelectedPhoto}
            onSelectTheme={openShowcase}
            photos={activePhotos}
            themes={themes}
          />
        ) : null}
      </AnimatePresence>
      <PhotoDetailOverlay photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </div>
  );
}

type HomeViewProps = {
  themes: ThemeSummary[];
  onEnter: () => void;
};

function HomeView({ themes, onEnter }: HomeViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const cover = themes[0]?.cover;

  return (
    <motion.main
      animate={{ opacity: 1 }}
      className="relative isolate min-h-screen overflow-hidden"
      exit={{ opacity: 0 }}
      id="main-content"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <DecorativeMarks />
      {cover ? (
        <img
          alt=""
          className="absolute inset-y-0 right-0 z-[-2] hidden h-full w-[54vw] object-cover opacity-20 lg:block"
          height={cover.height}
          src={cover.src}
          width={cover.width}
        />
      ) : null}
      <section className="mx-auto grid min-h-screen max-w-7xl content-center px-6 py-14 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <motion.div
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 18 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <p className="font-sans text-xs uppercase tracking-[0.28em] text-umber">Personal Photography Archive</p>
          <h1 className="mt-7 max-w-3xl font-serif text-[clamp(4.5rem,16vw,12rem)] leading-[0.82] text-ink">
            摄影集
          </h1>
          <p className="mt-8 max-w-xl font-serif text-xl leading-9 text-ink/72">
            四组影像从温度、清澈、盛放与阴翳出发，整理成一个安静、克制、以照片为中心的观看入口。
          </p>
          <button
            className="mt-12 min-h-12 border border-ink bg-ink px-8 py-4 font-serif text-base text-porcelain transition hover:bg-transparent hover:text-ink focus:outline-none focus:ring-2 focus:ring-umber focus:ring-offset-4 focus:ring-offset-porcelain"
            onClick={onEnter}
            type="button"
          >
            进入引导
          </button>
        </motion.div>

        <div className="mt-14 grid grid-cols-2 gap-4 lg:mt-0 lg:self-end">
          {themes.slice(0, 4).map((theme, index) => (
            <motion.figure
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-paper"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 22 }}
              key={theme.slug}
              transition={{ delay: 0.12 + index * 0.08, duration: 0.55, ease: 'easeOut' }}
            >
              <img
                alt={theme.cover.alt}
                className="aspect-[4/5] w-full object-cover"
                height={theme.cover.height}
                loading={index < 2 ? 'eager' : 'lazy'}
                src={theme.cover.src}
                width={theme.cover.width}
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-ink/55 to-transparent p-4 text-porcelain">
                <span className="font-serif text-5xl opacity-75">{theme.name}</span>
                <span className="max-w-[7rem] text-right text-xs uppercase tracking-[0.2em] opacity-80">
                  {theme.subtitle}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>
    </motion.main>
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
                  <span className="font-serif text-[clamp(5rem,12vw,10rem)] leading-none opacity-65">
                    {theme.name}
                  </span>
                  <span className="pb-3 text-right">
                    <span className="block text-sm uppercase tracking-[0.24em] opacity-80">{theme.subtitle}</span>
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
  photos: Photo[];
  onBack: () => void;
  onSelectTheme: (themeSlug: string) => void;
  onOpenPhoto: (photo: Photo) => void;
};

function ShowcaseView({
  themes,
  activeTheme,
  photos,
  onBack,
  onSelectTheme,
  onOpenPhoto,
}: ShowcaseViewProps) {
  const prefersReducedMotion = useReducedMotion();

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
      <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
          <nav className="border-r border-ink/10 pr-6 font-serif text-sm text-ink/64" aria-label="展示页目录">
            <a className="block py-2 text-ink underline underline-offset-4" href="#intro">
              摄影集网站简介
            </a>
            <div className="mt-8">
              <p className="mb-3 font-sans text-xs uppercase tracking-[0.18em] text-ink/36">四个主题的展示</p>
              {themes.map((theme) => (
                <button
                  aria-pressed={theme.slug === activeTheme.slug}
                  className="block min-h-10 w-full py-2 text-left transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-umber"
                  key={theme.slug}
                  onClick={() => onSelectTheme(theme.slug)}
                  type="button"
                >
                  <span className={theme.slug === activeTheme.slug ? 'text-ink' : undefined}>{theme.name}</span>
                  <span className="ml-3 font-sans text-xs uppercase tracking-[0.14em] opacity-60">
                    {theme.subtitle}
                  </span>
                </button>
              ))}
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
                {activeTheme.name}
                <span className="ml-5 align-middle font-sans text-xs uppercase tracking-[0.24em] text-ink/45">
                  {activeTheme.subtitle}
                </span>
              </h1>
            </div>
            <p className="max-w-2xl font-serif text-lg leading-8 text-ink/68">
              这是一组以个人观看经验整理的摄影集。界面保持留白，让目录、瀑布流和大图详情服务于照片本身。
              当前主题包含 {activeTheme.count} 张作品。
            </p>
          </header>

          <div className="columns-1 gap-5 sm:columns-2 xl:columns-3 2xl:columns-4">
            {photos.map((photo, index) => (
              <motion.button
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                className="group mb-5 block w-full break-inside-avoid text-left focus:outline-none focus:ring-2 focus:ring-umber focus:ring-offset-4 focus:ring-offset-porcelain"
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 18 }}
                key={photo.slug ?? photo.src}
                onClick={() => onOpenPhoto(photo)}
                transition={{ delay: Math.min(index * 0.025, 0.35), duration: 0.45, ease: 'easeOut' }}
                type="button"
              >
                <img
                  alt={photo.alt}
                  className="w-full bg-paper object-cover transition duration-500 group-hover:brightness-[0.94]"
                  height={photo.height}
                  loading={index < 6 ? 'eager' : 'lazy'}
                  src={photo.src}
                  width={photo.width}
                />
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

type PhotoDetailOverlayProps = {
  photo: Photo | null;
  onClose: () => void;
};

function PhotoDetailOverlay({ photo, onClose }: PhotoDetailOverlayProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!photo) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, photo]);

  const details = photo
    ? [
        ['光圈', photo.aperture],
        ['快门', photo.shutterSpeed],
        ['感光度', photo.iso],
        ['拍摄日期', photo.date],
      ]
    : [];
  const hasMissing = details.some(([, value]) => !value);

  return (
    <AnimatePresence>
      {photo ? (
        <motion.div
          animate={{ opacity: 1 }}
          aria-labelledby="photo-detail-title"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-ink/45 p-4 backdrop-blur-md sm:p-8"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          role="dialog"
        >
          <button
            aria-label="关闭图片详情"
            className="absolute left-4 top-4 z-10 min-h-11 border border-porcelain/60 bg-ink/35 px-4 py-2 font-serif text-porcelain focus:outline-none focus:ring-2 focus:ring-porcelain sm:left-8 sm:top-8"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            关闭
          </button>
          <motion.div
            animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            className="mx-auto grid h-full max-w-6xl overflow-hidden bg-porcelain shadow-2xl md:grid-cols-[0.82fr_1.18fr]"
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98, y: 12 }}
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <section className="order-2 overflow-y-auto p-7 font-serif text-ink md:order-1 md:p-10">
              <p className="text-sm uppercase tracking-[0.2em] text-moss">{photo.category}</p>
              <h2 className="mt-5 text-4xl leading-tight" id="photo-detail-title">
                {photo.title}
              </h2>
              <dl className="mt-10 space-y-5 text-lg leading-8">
                {details.map(([label, value]) => (
                  <div className="border-b border-ink/10 pb-4" key={label}>
                    <dt className="font-sans text-xs uppercase tracking-[0.2em] text-ink/42">{label}</dt>
                    <dd className="mt-1">{value || missingText}</dd>
                  </div>
                ))}
              </dl>
              {hasMissing ? <p className="mt-5 text-lg leading-8">不过回忆还在</p> : null}
              <p className="mt-10 font-sans text-xs uppercase tracking-[0.16em] text-ink/36">
                {photo.originalFile}
              </p>
            </section>
            <figure className="order-1 grid min-h-0 bg-ink md:order-2">
              <img
                alt={photo.alt}
                className="h-full max-h-[54vh] w-full object-contain md:max-h-none"
                height={photo.height}
                src={photo.src}
                width={photo.width}
              />
            </figure>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
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

function DecorativeMarks() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-8 top-8 z-[-1] h-40 w-40 text-moss/35"
      fill="none"
      viewBox="0 0 160 160"
    >
      <path d="M20 96C44 28 96 18 132 52C96 54 72 76 64 126C48 118 34 108 20 96Z" fill="currentColor" />
      <path d="M38 111C70 88 99 76 139 82" stroke="#1c1b18" strokeOpacity="0.22" strokeWidth="2" />
    </svg>
  );
}

export default App;
