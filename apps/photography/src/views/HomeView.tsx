import { useEffect, useId, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { themeAccents } from '../data/themes.ts';
import { getPreviewSrc } from '../lib/photos.ts';
import { preloadImage, requestIdleTask, shouldSkipIdlePreload } from '../lib/imagePreload.ts';
import { useReducedMotionPreference } from '../motion/useReducedMotionPreference.ts';
import type { ThemeSummary } from '../types/photography.ts';

type HomeViewProps = {
  themes: ThemeSummary[];
  activeThemeSlug: string;
  onSelectTheme: (themeSlug: string) => void;
  onOpenThemeGallery: (themeSlug: string) => void;
};

type HoverPreview = {
  theme: ThemeSummary;
  centerY: number;
};

const themeLabels: Record<string, string> = {
  warm: 'Warm',
  azure: 'Azure',
  bloom: 'Lush',
  umbrage: 'Pall',
};

export function HomeView({ themes, activeThemeSlug, onSelectTheme, onOpenThemeGallery }: HomeViewProps) {
  const prefersReducedMotion = useReducedMotionPreference();
  const [hoverPreview, setHoverPreview] = useState<HoverPreview | null>(null);
  const directoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldSkipIdlePreload()) {
      return;
    }

    return requestIdleTask(() => {
      themes.forEach((theme) => preloadImage(getPreviewSrc(theme.cover)));
    });
  }, [themes]);

  const updateHoverPreview = (theme: ThemeSummary, element: HTMLElement) => {
    const directoryRect = directoryRef.current?.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();

    if (!directoryRect) {
      return;
    }

    setHoverPreview({
      theme,
      centerY: itemRect.top - directoryRect.top + itemRect.height / 2,
    });
    preloadImage(getPreviewSrc(theme.cover));
  };

  return (
    <motion.main
      animate={{ opacity: 1 }}
      className="min-h-screen overflow-hidden bg-white text-black"
      id="main-content"
      initial={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.35 }}
    >
      <HomeHero
        activeThemeSlug={activeThemeSlug}
        directoryRef={directoryRef}
        hoverPreview={hoverPreview}
        onHoverTheme={updateHoverPreview}
        onLeaveThemes={() => setHoverPreview(null)}
        onOpenThemeGallery={onOpenThemeGallery}
        onSelectTheme={onSelectTheme}
        prefersReducedMotion={prefersReducedMotion}
        themes={themes}
      />

      <HomeStorySection themes={themes} onOpenThemeGallery={onOpenThemeGallery} />
      <ProfileFooter />
    </motion.main>
  );
}

type HomeHeroProps = {
  themes: ThemeSummary[];
  activeThemeSlug: string;
  hoverPreview: HoverPreview | null;
  directoryRef: RefObject<HTMLDivElement | null>;
  prefersReducedMotion: boolean;
  onSelectTheme: (themeSlug: string) => void;
  onOpenThemeGallery: (themeSlug: string) => void;
  onHoverTheme: (theme: ThemeSummary, element: HTMLElement) => void;
  onLeaveThemes: () => void;
};

function HomeHero({
  themes,
  activeThemeSlug,
  hoverPreview,
  directoryRef,
  prefersReducedMotion,
  onSelectTheme,
  onOpenThemeGallery,
  onHoverTheme,
  onLeaveThemes,
}: HomeHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const clipId = useId().replace(/:/g, '');

  const inNothingX = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -80]);
  const spaceX = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -150]);
  const photographyX = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 60]);
  const memoryX = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 120]);

  return (
    <section
      aria-labelledby="home-title"
      className="relative min-h-[720px] overflow-hidden border-b border-black/14 bg-white sm:min-h-[760px] lg:h-screen lg:min-h-[820px]"
      ref={heroRef}
    >
      <h1 className="sr-only" id="home-title">
        INNOTHING SPACE FOR PHOTOGRAPHY AND MEMORY
      </h1>

      <a
        className="absolute left-4 top-4 z-20 text-base underline decoration-black underline-offset-2 sm:left-6 sm:text-lg"
        href="#profile"
      >
        InNothing, About
      </a>
      <a className="absolute right-4 top-4 z-20 text-base sm:right-6 sm:text-lg" href="mailto:">
        Contact
      </a>

      <MobileHeroSvg clipId={clipId} prefersReducedMotion={prefersReducedMotion} />

      <motion.svg
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full sm:block"
        preserveAspectRatio="xMidYMin slice"
        viewBox="0 0 1440 900"
      >
        <rect fill="#fff" height="900" width="1440" />
        <g stroke="#cfcfcf" strokeWidth="1">
          <line x1="0" x2="1440" y1="138" y2="138" />
          <line x1="0" x2="1440" y1="258" y2="258" />
          <line x1="0" x2="1440" y1="378" y2="378" />
          <line x1="0" x2="1440" y1="418" y2="418" />
          <line x1="0" x2="1440" y1="538" y2="538" />
          <line x1="0" x2="1440" y1="668" y2="668" />
          <line x1="0" x2="1440" y1="790" y2="790" />
        </g>

        <defs>
          <clipPath id={`${clipId}-innothing`}>
            <rect height="120" width="1440" x="0" y="138" />
          </clipPath>
          <clipPath id={`${clipId}-space`}>
            <rect height="112" width="1440" x="0" y="258" />
          </clipPath>
          <clipPath id={`${clipId}-photo`}>
            <rect height="108" width="1440" x="0" y="418" />
          </clipPath>
          <clipPath id={`${clipId}-memory`}>
            <rect height="108" width="1440" x="0" y="538" />
          </clipPath>
          <filter height="360" id={`${clipId}-stack-shadow`} width="560" x="-80" y="-80">
            <feDropShadow dx="0" dy="22" floodColor="#000" floodOpacity=".1" stdDeviation="26" />
          </filter>
        </defs>

        <g fill="#000" fontFamily="Arial, Helvetica Neue, Helvetica, sans-serif" fontWeight="300" letterSpacing="0">
          <motion.g clipPath={`url(#${clipId}-innothing)`} style={{ x: inNothingX }}>
            <motion.text
              animate={{ opacity: 1, x: 0 }}
              dominantBaseline="hanging"
              fontSize="150"
              initial={prefersReducedMotion ? false : { opacity: 0, x: 44 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              x="275"
              y="124"
            >
              INNOTHING
            </motion.text>
          </motion.g>
          <motion.g clipPath={`url(#${clipId}-space)`} style={{ x: spaceX }}>
            <motion.text
              animate={{ opacity: 1, x: 0 }}
              dominantBaseline="hanging"
              fontSize="150"
              initial={prefersReducedMotion ? false : { opacity: 0, x: -56 }}
              transition={{ delay: 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              x="585"
              y="244"
            >
              SPACE
            </motion.text>
          </motion.g>
          <motion.g clipPath={`url(#${clipId}-photo)`} style={{ x: photographyX }}>
            <motion.text
              animate={{ opacity: 1, x: 0 }}
              dominantBaseline="hanging"
              fontSize="136"
              initial={prefersReducedMotion ? false : { opacity: 0, x: -38 }}
              transition={{ delay: 0.16, duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
              x="320"
              y="406"
            >
              FOR PHOTOGRAPHY
            </motion.text>
          </motion.g>
          <motion.g clipPath={`url(#${clipId}-memory)`} style={{ x: memoryX }}>
            <motion.text
              animate={{ opacity: 1, x: 0 }}
              dominantBaseline="hanging"
              fontSize="136"
              initial={prefersReducedMotion ? false : { opacity: 0, x: 50 }}
              transition={{ delay: 0.24, duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
              x="745"
              y="526"
            >
              AND MEMORY
            </motion.text>
          </motion.g>
        </g>

        <motion.g
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          filter={`url(#${clipId}-stack-shadow)`}
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
          transition={{ delay: 0.42, duration: 0.7, ease: 'easeOut' }}
        >
          <g transform="translate(730 645) rotate(-17 135 90)">
            <rect fill="#d3c8bd" height="170" width="260" x="0" y="0" />
            <rect fill="#fff" height="92" width="190" x="32" y="36" />
            <path d="M62 92 L106 66 L145 98 L178 74 L208 126 L52 126 Z" fill="#111" opacity=".82" />
          </g>
          <g transform="translate(850 642) rotate(8 122 92)">
            <rect fill="#f8f5ef" height="175" width="230" x="0" y="0" />
            <rect fill="#aeb7b5" height="108" width="182" x="24" y="24" />
            <path d="M25 149 L205 142 L188 167 L41 171 Z" fill="#111" />
          </g>
          <g transform="translate(975 690) rotate(-4 132 78)">
            <rect fill="#111" height="150" width="255" x="0" y="0" />
            <rect fill="#d2c8bd" height="100" width="198" x="28" y="24" />
            <g fill="#fff">
              {[16, 43, 70, 97].map((y) => (
                <rect height="9" key={`film-left-${y}`} width="10" x="10" y={y} />
              ))}
              {[16, 43, 70, 97].map((y) => (
                <rect height="9" key={`film-right-${y}`} width="10" x="235" y={y} />
              ))}
            </g>
          </g>
          <g fill="none" stroke="#111" strokeWidth="2" transform="translate(1085 642)">
            <path d="M0 0 H86 M0 0 V86" />
            <path d="M230 0 H144 M230 0 V86" />
            <path d="M0 185 H86 M0 185 V99" />
            <path d="M230 185 H144 M230 185 V99" />
          </g>
          <g transform="translate(1210 708) rotate(13 80 70)">
            <rect fill="#fff" height="130" stroke="#111" strokeWidth="2" width="160" x="0" y="0" />
            <rect fill="#858d89" height="75" width="120" x="20" y="18" />
            <circle cx="126" cy="108" fill="#111" r="8" />
          </g>
        </motion.g>
      </motion.svg>

      <div
        className="absolute bottom-8 left-5 z-20 w-[min(18rem,52vw)] sm:bottom-10 sm:left-8 sm:w-[min(18rem,42vw)] lg:bottom-16 lg:left-10"
        onMouseLeave={onLeaveThemes}
        ref={directoryRef}
      >
        <p className="text-base text-black/34 sm:text-lg">Theme:</p>
        <nav aria-label="首页主题筛选" className="mt-5 space-y-1.5">
          {themes.map((theme, index) => (
            <ThemeButton
              activeThemeSlug={activeThemeSlug}
              index={index}
              key={theme.slug}
              onHoverTheme={onHoverTheme}
              onOpenThemeGallery={onOpenThemeGallery}
              onSelectTheme={onSelectTheme}
              theme={theme}
            />
          ))}
        </nav>
        <HoverCoverPreview hoverPreview={hoverPreview} />
      </div>
    </section>
  );
}

function MobileHeroSvg({ clipId, prefersReducedMotion }: { clipId: string; prefersReducedMotion: boolean }) {
  return (
    <motion.svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full sm:hidden"
      preserveAspectRatio="none"
      viewBox="0 0 390 760"
    >
      <rect fill="#fff" height="760" width="390" />
      <g stroke="#d4d4d4" strokeWidth="1">
        <line x1="0" x2="390" y1="110" y2="110" />
        <line x1="0" x2="390" y1="196" y2="196" />
        <line x1="0" x2="390" y1="286" y2="286" />
        <line x1="0" x2="390" y1="384" y2="384" />
        <line x1="0" x2="390" y1="482" y2="482" />
        <line x1="0" x2="390" y1="650" y2="650" />
      </g>

      <defs>
        <clipPath id={`${clipId}-mobile-innothing`}>
          <rect height="70" width="390" x="0" y="110" />
        </clipPath>
        <clipPath id={`${clipId}-mobile-space`}>
          <rect height="68" width="390" x="0" y="196" />
        </clipPath>
        <clipPath id={`${clipId}-mobile-photo`}>
          <rect height="62" width="390" x="0" y="384" />
        </clipPath>
        <clipPath id={`${clipId}-mobile-memory`}>
          <rect height="62" width="390" x="0" y="482" />
        </clipPath>
      </defs>

      <g fill="#000" fontFamily="Arial, Helvetica Neue, Helvetica, sans-serif" fontWeight="300" letterSpacing="0">
        <g clipPath={`url(#${clipId}-mobile-innothing)`}>
          <motion.text
            animate={{ opacity: 1, x: 0 }}
            dominantBaseline="hanging"
            fontSize="72"
            initial={prefersReducedMotion ? false : { opacity: 0, x: 22 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            x="-18"
            y="103"
          >
            INNOTHING
          </motion.text>
        </g>
        <g clipPath={`url(#${clipId}-mobile-space)`}>
          <motion.text
            animate={{ opacity: 1, x: 0 }}
            dominantBaseline="hanging"
            fontSize="72"
            initial={prefersReducedMotion ? false : { opacity: 0, x: -24 }}
            transition={{ delay: 0.08, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            x="74"
            y="189"
          >
            SPACE
          </motion.text>
        </g>
        <g clipPath={`url(#${clipId}-mobile-photo)`}>
          <motion.text
            animate={{ opacity: 1, x: 0 }}
            dominantBaseline="hanging"
            fontSize="56"
            initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
            transition={{ delay: 0.16, duration: 0.76, ease: [0.22, 1, 0.36, 1] }}
            x="-28"
            y="379"
          >
            FOR PHOTOGRAPHY
          </motion.text>
        </g>
        <g clipPath={`url(#${clipId}-mobile-memory)`}>
          <motion.text
            animate={{ opacity: 1, x: 0 }}
            dominantBaseline="hanging"
            fontSize="56"
            initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
            transition={{ delay: 0.24, duration: 0.76, ease: [0.22, 1, 0.36, 1] }}
            x="74"
            y="477"
          >
            AND MEMORY
          </motion.text>
        </g>
      </g>

      <motion.g
        animate={prefersReducedMotion ? undefined : { opacity: 0.8, y: 0 }}
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
        transition={{ delay: 0.42, duration: 0.6, ease: 'easeOut' }}
      >
        <g transform="translate(238 610) rotate(-8 74 48)">
          <rect fill="#f8f5ef" height="105" width="126" x="0" y="0" />
          <rect fill="#aeb7b5" height="62" width="94" x="16" y="14" />
          <path d="M16 89 L110 84 L100 101 L25 103 Z" fill="#111" />
        </g>
      </motion.g>
    </motion.svg>
  );
}

type ThemeButtonProps = {
  theme: ThemeSummary;
  index: number;
  activeThemeSlug: string;
  onSelectTheme: (themeSlug: string) => void;
  onOpenThemeGallery?: (themeSlug: string) => void;
  onHoverTheme?: (theme: ThemeSummary, element: HTMLElement) => void;
};

function ThemeButton({ theme, index, activeThemeSlug, onSelectTheme, onOpenThemeGallery, onHoverTheme }: ThemeButtonProps) {
  const isActive = theme.slug === activeThemeSlug;
  const accent = themeAccents[theme.slug as keyof typeof themeAccents]?.accent ?? '#111';

  return (
    <button
      aria-pressed={isActive}
      className="group flex min-h-8 w-full items-center gap-3 border-b border-transparent text-left text-lg leading-none text-black transition hover:border-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-white sm:text-xl"
      onClick={() => {
        onSelectTheme(theme.slug);
        onOpenThemeGallery?.(theme.slug);
      }}
      onMouseEnter={(event) => onHoverTheme?.(theme, event.currentTarget)}
      onFocus={(event) => onHoverTheme?.(theme, event.currentTarget)}
      style={{ borderBottomColor: isActive ? '#111' : undefined }}
      type="button"
    >
      <span>{String(index + 1).padStart(2, '0')}</span>
      <span>{themeLabels[theme.slug] ?? theme.subtitle}</span>
      {isActive ? (
        <span
          aria-hidden="true"
          className="ml-2 h-2.5 w-2.5 rounded-full bg-black"
          style={{ backgroundColor: accent === '#C99567' ? '#111' : accent }}
        />
      ) : null}
    </button>
  );
}

function HomeStorySection({
  themes,
  onOpenThemeGallery,
}: {
  themes: ThemeSummary[];
  onOpenThemeGallery: (themeSlug: string) => void;
}) {
  return (
    <>
      <section className="relative overflow-hidden border-t border-black/14 bg-white px-5 py-20 text-black sm:px-8 lg:min-h-screen lg:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 grid h-full grid-rows-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <span className="border-b border-black/10" key={`memory-line-${index}`} />
          ))}
        </div>
        <div className="relative mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[340px_minmax(0,1fr)]">
          <motion.div
            className="text-sm text-black/36"
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ amount: 0.4, once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            Scroll / 01
          </motion.div>
          <div className="max-w-5xl">
            <motion.p
              className="text-4xl font-normal uppercase leading-[0.92] sm:text-6xl lg:text-8xl"
              initial={{ opacity: 0, y: 42 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ amount: 0.35, once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              LIGHT / TRACE / DELAY
            </motion.p>
            <motion.div
              className="mt-14 grid gap-px bg-black/14 sm:grid-cols-[1fr_1.25fr_.85fr]"
              initial={{ opacity: 0, y: 30 }}
              transition={{ delay: 0.12, duration: 0.65, ease: 'easeOut' }}
              viewport={{ amount: 0.35, once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="min-h-44 bg-black p-5 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">Frame 01</p>
                <p className="mt-16 text-5xl leading-none">01</p>
              </div>
              <div className="min-h-44 bg-[#aeb7b5] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-black/45">Frame 02</p>
                <div className="mt-16 h-px w-full bg-black/60" />
                <div className="mt-4 h-px w-2/3 bg-black/35" />
              </div>
              <div className="min-h-44 bg-[#d2c8bd] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-black/45">Frame 03</p>
                <p className="mt-16 text-5xl leading-none">Z</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/14 bg-white px-5 py-20 text-black sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[340px_minmax(0,1fr)]">
          <motion.div
            className="text-sm text-black/36"
            initial={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            viewport={{ amount: 0.45, once: true }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            Theme / 02
          </motion.div>
          <div className="grid gap-px bg-black/14 sm:grid-cols-2 xl:grid-cols-4">
            {themes.map((theme, index) => {
              const accent = themeAccents[theme.slug as keyof typeof themeAccents]?.accent ?? '#111';

              return (
                <motion.button
                  className="group min-h-56 bg-white p-5 text-left transition hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-white sm:min-h-64"
                  initial={{ opacity: 0, y: 34 }}
                  key={theme.slug}
                  onClick={() => onOpenThemeGallery(theme.slug)}
                  transition={{ delay: index * 0.06, duration: 0.55, ease: 'easeOut' }}
                  type="button"
                  viewport={{ amount: 0.35, once: true }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <span className="block text-sm text-black/34 group-hover:text-white/48">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="mt-10 block text-4xl uppercase leading-none">{themeLabels[theme.slug] ?? theme.subtitle}</span>
                  <span className="mt-14 block h-px w-full bg-black/18 group-hover:bg-white/30" />
                  <span className="mt-4 block h-2 w-20" style={{ backgroundColor: accent }} />
                  <span className="mt-12 block text-xs uppercase tracking-[0.2em] text-black/38 group-hover:text-white/52">
                    Open Theme
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-black/14 bg-white px-5 py-20 text-black sm:px-8 lg:min-h-[82vh] lg:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[340px_minmax(0,1fr)]">
          <motion.p
            className="text-sm text-black/36"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            viewport={{ amount: 0.4, once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            Zine / 03
          </motion.p>
          <div className="relative min-h-[420px]">
            <motion.p
              className="max-w-4xl text-5xl font-normal uppercase leading-[0.92] sm:text-7xl lg:text-9xl"
              initial={{ opacity: 0, y: 46 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ amount: 0.35, once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              ZINE INDEX / SOON
            </motion.p>
            <motion.div
              aria-hidden="true"
              className="pointer-events-none mt-12 grid max-w-xl grid-cols-4 gap-2 sm:absolute sm:bottom-0 sm:right-0 sm:mt-0 sm:w-[34rem]"
              initial={{ opacity: 0, rotate: -2, y: 40 }}
              transition={{ delay: 0.12, duration: 0.75, ease: 'easeOut' }}
              viewport={{ amount: 0.25, once: true }}
              whileInView={{ opacity: 1, rotate: 0, y: 0 }}
            >
              {['#111', '#fff', '#aeb7b5', '#d2c8bd', '#fff', '#111', '#fff', '#858d89'].map((color, index) => (
                <span
                  className="aspect-[3/4] border border-black/16"
                  key={`${color}-${index}`}
                  style={{ backgroundColor: color, transform: `translateY(${(index % 3) * 14}px)` }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

function HoverCoverPreview({ hoverPreview }: { hoverPreview: HoverPreview | null }) {
  if (!hoverPreview) {
    return null;
  }

  const previewSrc = getPreviewSrc(hoverPreview.theme.cover);

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, x: 0 }}
      className="pointer-events-none absolute left-[calc(100%+1.75rem)] hidden w-36 bg-[#f8f5ef] p-3 shadow-[0_20px_48px_rgba(0,0,0,0.12)] lg:block"
      initial={{ opacity: 0, scale: 0.96, x: -10 }}
      key={hoverPreview.theme.slug}
      style={{ top: hoverPreview.centerY, y: '-50%' }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <img
        alt=""
        aria-hidden="true"
        className="aspect-[4/5] w-full object-cover grayscale"
        decoding="async"
        height={hoverPreview.theme.cover.previewHeight ?? hoverPreview.theme.cover.height}
        src={previewSrc}
        width={hoverPreview.theme.cover.previewWidth ?? hoverPreview.theme.cover.width}
      />
      <span className="mt-3 block h-7 bg-black [clip-path:polygon(0_0,100%_14%,82%_100%,8%_78%)]" />
    </motion.div>
  );
}

function ProfileFooter() {
  return (
    <footer className="border-t border-black/12 bg-white px-5 py-14 sm:px-8">
      <section className="mx-auto max-w-[1500px]" id="profile">
        <p className="text-sm text-black/36">Profile:</p>
        <p className="mt-3 max-w-3xl text-xl leading-8 text-black/70">
          拍摄是整理记忆的方式。偏好安静的光、可停留的细节，以及画面里没有被立即说完的部分。
        </p>
      </section>
      <p className="mt-14 text-center text-[0.68rem] tracking-[0.12em] text-black/38">
        ©2026 InNothing. All Rights Reserved.
      </p>
    </footer>
  );
}
