import { useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { themeAccents } from '../data/themes.ts';
import { getPreviewSrc } from '../lib/photos.ts';
import { preloadImage } from '../lib/imagePreload.ts';
import type { ThemeSummary } from '../types/photography.ts';

type HomeHeroProps = {
  themes: ThemeSummary[];
  activeThemeSlug: string;
  prefersReducedMotion: boolean;
  onSelectTheme: (themeSlug: string) => void;
  onOpenThemeGallery: (themeSlug: string) => void;
};

type HoverPreview = {
  theme: ThemeSummary;
  centerY: number;
};

const themeLabels: Record<string, string> = {
  warm: '暖',
  azure: '湛',
  bloom: '盛',
  umbrage: '郁',
};

const themeEnglishLabels: Record<string, string> = {
  warm: 'Apricity',
  azure: 'Azure',
  bloom: 'Lush',
  umbrage: 'Pall',
};

const heroTitleRows = [
  { text: 'INNOTHING', className: 'left-[45%] max-sm:left-[20%]', from: -54, to: 120 },
  { text: 'SPACE FOR', className: 'left-[47%] max-sm:left-[22%]', from: 34, to: -210 },
  { text: 'PHOTOGRAPHY', className: 'left-[40%] max-sm:left-[12%]', from: -72, to: 142 },
  { text: 'AND MEMORY', className: 'left-[49%] max-sm:left-[20%]', from: 48, to: -240 },
] as const;

export function HomeHero({
  themes,
  activeThemeSlug,
  prefersReducedMotion,
  onSelectTheme,
  onOpenThemeGallery,
}: HomeHeroProps) {
  const [hoverPreview, setHoverPreview] = useState<HoverPreview | null>(null);
  const directoryRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.22,
  });

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
    <section
      aria-labelledby="home-title"
      className="relative min-h-[720px] overflow-visible border-b border-black/14 bg-[linear-gradient(135deg,rgba(246,181,149,0.18)_0%,rgba(224,229,222,0.28)_42%,rgba(194,214,227,0.24)_100%),#fff] sm:min-h-[760px] lg:h-screen lg:min-h-[820px]"
      ref={heroRef}
    >
      <h1 className="sr-only" id="home-title">
        INNOTHING SPACE FOR PHOTOGRAPHY AND MEMORY
      </h1>

      <a
        className="absolute left-4 top-4 z-30 flex min-h-11 items-center text-base font-medium underline decoration-black underline-offset-4 sm:left-[2vw] sm:text-[13px]"
        href="#profile"
      >
        InNothing, About
      </a>
      <a
        className="absolute right-4 top-4 z-30 flex min-h-11 items-center text-base font-medium underline decoration-black underline-offset-4 sm:right-[2vw] sm:text-[13px]"
        href="https://www.xiaohongshu.com/user/profile/64e37b32000000000200f65a"
        rel="noreferrer"
        target="_blank"
      >
        小红书
      </a>

      <div aria-hidden="true" className="pointer-events-none absolute left-0 top-[15%] z-10 flex w-full flex-col sm:top-[10%]">
        {heroTitleRows.map((row) => (
          <HeroTitleRow
            key={row.text}
            prefersReducedMotion={prefersReducedMotion}
            progress={smoothScrollProgress}
            row={row}
          />
        ))}
        <div className="relative h-[12vh] min-h-[86px] border-t border-black/20 sm:h-[14vh] sm:min-h-[104px]" />
        <div className="relative h-[12vh] min-h-[86px] border-y border-black/20 sm:h-[14vh] sm:min-h-[104px]" />
      </div>

      <PhotographyObjectPile />

      <div
        className="absolute bottom-12 left-4 z-20 w-fit sm:bottom-[6vh] sm:left-[2vw] sm:w-[min(22rem,38vw)] lg:bottom-[8vh]"
        onMouseLeave={() => setHoverPreview(null)}
        ref={directoryRef}
      >
        <p className="font-serif text-2xl leading-none text-black underline decoration-black underline-offset-8 sm:text-[1.9rem]">呈现</p>
        <nav aria-label="首页主题筛选" className="mt-5 space-y-4 sm:mt-8 sm:space-y-6">
          {themes.map((theme, index) => (
            <ThemeButton
              activeThemeSlug={activeThemeSlug}
              index={index}
              key={theme.slug}
              onHoverTheme={updateHoverPreview}
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

type HeroTitleRowProps = {
  row: (typeof heroTitleRows)[number];
  progress: ReturnType<typeof useSpring>;
  prefersReducedMotion: boolean;
};

function HeroTitleRow({ row, progress, prefersReducedMotion }: HeroTitleRowProps) {
  const x = useTransform(progress, [0, 1], [`${row.from}px`, `${row.to}px`]);

  return (
    <div className="relative h-[12vh] min-h-[86px] overflow-hidden border-t border-black/20 sm:h-[14vh] sm:min-h-[104px]">
      <motion.span
        className={`absolute top-[-4vw] block whitespace-nowrap font-sans text-[18vw] font-[300] uppercase leading-[0.8] tracking-[-0.025em] text-black will-change-transform sm:top-[-2vw] sm:text-[12vw] sm:tracking-[-0.02em] ${row.className}`}
        style={{ x: prefersReducedMotion ? 0 : x }}
      >
        {row.text}
      </motion.span>
    </div>
  );
}

function PhotographyObjectPile() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 right-[-18vw] z-[12] h-[180px] w-[82vw] max-w-none overflow-visible sm:bottom-[1.8vh] sm:right-[1.3vw] sm:h-[min(30vh,250px)] sm:w-[min(57vw,850px)]"
    >
      <svg
        aria-hidden="true"
        className="h-full w-full overflow-visible drop-shadow-[0_24px_38px_rgba(0,0,0,0.14)]"
        focusable="false"
        viewBox="0 0 900 300"
      >
        <g transform="translate(16 28)">
          <rect fill="#E0DDD7" height="144" stroke="#111" strokeWidth="2" transform="rotate(-18 231 128)" width="226" x="118" y="56" />
          <path d="M132 78h62v62h-62z" fill="#D7E4E9" transform="rotate(-18 163 109)" />
          <path d="M228 76h82v102h-82z" fill="#DEE7D2" transform="rotate(-18 269 127)" />
        </g>
        <g transform="translate(248 26) rotate(8 130 120)">
          <rect fill="#F8F5EF" height="176" stroke="#111" strokeWidth="2" width="250" x="0" y="0" />
          <rect fill="#D7E4E9" height="102" width="170" x="28" y="30" />
          <path d="M20 148h202" stroke="#C99567" strokeWidth="10" />
          <path d="M188 20l34 0 0 34" fill="none" stroke="#8F8B84" strokeWidth="2" />
        </g>
        <g transform="translate(448 70) rotate(-5 155 82)">
          <rect fill="#262626" height="164" width="310" x="0" y="0" />
          <rect fill="#E0DDD7" height="116" width="104" x="42" y="24" />
          <rect fill="#EBD7BF" height="116" width="104" x="166" y="24" />
          <g fill="#F8F5EF">
            <rect height="14" width="12" x="12" y="20" />
            <rect height="14" width="12" x="12" y="58" />
            <rect height="14" width="12" x="12" y="96" />
            <rect height="14" width="12" x="286" y="20" />
            <rect height="14" width="12" x="286" y="58" />
            <rect height="14" width="12" x="286" y="96" />
          </g>
          <path d="M155 0v164" opacity=".45" stroke="#111" strokeWidth="2" />
        </g>
        <g transform="translate(688 72) rotate(14 86 92)">
          <rect fill="#F8F5EF" height="188" stroke="#111" strokeWidth="2" width="154" x="0" y="0" />
          <rect fill="#D7E4E9" height="96" width="114" x="20" y="24" />
          <circle cx="124" cy="152" fill="#262626" r="9" />
          <path d="M28 140h56" stroke="#8F8B84" strokeWidth="2" />
        </g>
        <g transform="translate(4 108) rotate(2 72 78)">
          <rect fill="#F8F5EF" height="172" width="120" x="0" y="0" />
          <rect fill="#111" height="104" width="84" x="18" y="20" />
          <path d="M30 80c20-30 42 14 58-18" fill="none" stroke="#8F8B84" strokeWidth="4" />
          <path d="M0 142h120l-12 30H12z" fill="#111" />
          <rect fill="#D7E4E9" height="100" opacity=".35" width="38" x="32" y="22" />
        </g>
        <g transform="translate(154 104)">
          <rect fill="#D94F34" height="152" width="152" x="0" y="0" />
          <rect fill="#F8F5EF" height="128" width="128" x="12" y="12" />
          <rect fill="#292929" height="92" width="96" x="28" y="30" />
          <rect fill="#8F9F76" height="52" opacity=".52" width="50" x="52" y="50" />
          <g fill="#F8F5EF">
            <rect height="12" width="10" x="34" y="40" />
            <rect height="12" width="10" x="34" y="70" />
            <rect height="12" width="10" x="34" y="100" />
            <rect height="12" width="10" x="110" y="40" />
            <rect height="12" width="10" x="110" y="70" />
            <rect height="12" width="10" x="110" y="100" />
          </g>
        </g>
        <path d="M318 230c112-42 242-42 392-8" fill="none" opacity=".42" stroke="#C99567" strokeWidth="8" />
      </svg>
    </div>
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
      className="group flex min-h-11 w-fit items-center gap-3 text-left font-serif text-[1.18rem] leading-none text-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-white sm:gap-4 sm:text-[1.6rem]"
      onClick={() => {
        onSelectTheme(theme.slug);
        onOpenThemeGallery?.(theme.slug);
      }}
      onFocus={(event) => onHoverTheme?.(theme, event.currentTarget)}
      onMouseEnter={(event) => onHoverTheme?.(theme, event.currentTarget)}
      type="button"
    >
      <span>{themeLabels[theme.slug] ?? theme.subtitle}</span>
      <span className="text-[0.82em] tracking-[0.14em] text-black/42 sm:text-[0.9em]">{themeEnglishLabels[theme.slug] ?? theme.subtitle}</span>
      {isActive ? (
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-black sm:h-2.5 sm:w-2.5"
          style={{ backgroundColor: accent === '#C99567' ? '#111' : accent }}
        />
      ) : null}
    </button>
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
