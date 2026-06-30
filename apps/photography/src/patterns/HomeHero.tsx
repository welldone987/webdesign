import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
  warm: 'Warm',
  azure: 'Azure',
  bloom: 'Lush',
  umbrage: 'Pall',
};

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
      className="relative min-h-[720px] overflow-visible border-b border-black/14 bg-white sm:min-h-[760px] lg:h-screen lg:min-h-[820px]"
      ref={heroRef}
    >
      <h1 className="sr-only" id="home-title">
        INNOTHING SPACE FOR PHOTOGRAPHY AND MEMORY
      </h1>

      <a
        className="absolute left-4 top-4 z-20 flex min-h-11 items-center text-base underline decoration-black underline-offset-2 sm:left-6 sm:text-lg"
        href="#profile"
      >
        InNothing, About
      </a>
      <a className="absolute right-4 top-4 z-20 flex min-h-11 items-center text-base sm:right-6 sm:text-lg" href="mailto:">
        Contact
      </a>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0_110px,#d4d4d4_110px_111px,transparent_111px_196px,#d4d4d4_196px_197px,transparent_197px_286px,#d4d4d4_286px_287px,transparent_287px_384px,#d4d4d4_384px_385px,transparent_385px_482px,#d4d4d4_482px_483px,transparent_483px_650px,#d4d4d4_650px_651px,transparent_651px),#fff] sm:bg-[linear-gradient(to_bottom,transparent_0_138px,#cfcfcf_138px_139px,transparent_139px_258px,#cfcfcf_258px_259px,transparent_259px_378px,#cfcfcf_378px_379px,transparent_379px_418px,#cfcfcf_418px_419px,transparent_419px_538px,#cfcfcf_538px_539px,transparent_539px_668px,#cfcfcf_668px_669px,transparent_669px_790px,#cfcfcf_790px_791px,transparent_791px),#fff]"
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[102px] z-10 px-4 sm:top-[76px] sm:px-8 lg:px-14">
        <div className="mx-auto grid max-w-[1440px] gap-5 sm:gap-4">
          {[
            ['INNOTHING', 'ml-0 sm:ml-[28%]', 0, 28],
            ['SPACE', 'ml-[24%] sm:ml-[52%]', 0.08, -34],
            ['FOR PHOTOGRAPHY', 'mt-10 ml-0 sm:mt-16 sm:ml-[30%]', 0.16, 24],
            ['AND MEMORY', 'ml-[20%] sm:ml-[62%]', 0.24, -28],
          ].map(([text, className, delay, x]) => (
            <motion.span
              animate={{ opacity: 1, x: 0 }}
              className={`block whitespace-nowrap font-sans text-[clamp(31px,9.8vw,150px)] font-[225] uppercase leading-[0.82] text-black sm:text-[clamp(92px,9.8vw,140px)] ${className}`}
              initial={prefersReducedMotion ? false : { opacity: 0, x: Number(x) }}
              key={String(text)}
              transition={{ delay: Number(delay), duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {text}
            </motion.span>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-8 left-5 z-20 w-[min(18rem,52vw)] sm:bottom-10 sm:left-8 sm:w-[min(18rem,42vw)] lg:bottom-16 lg:left-10"
        onMouseLeave={() => setHoverPreview(null)}
        ref={directoryRef}
      >
        <p className="text-base text-black/34 sm:text-lg">Theme:</p>
        <nav aria-label="首页主题筛选" className="mt-5 space-y-1.5">
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
      className="group flex min-h-11 w-full items-center gap-3 border-b border-transparent text-left text-lg leading-none text-black transition hover:border-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-white sm:text-xl"
      onClick={() => {
        onSelectTheme(theme.slug);
        onOpenThemeGallery?.(theme.slug);
      }}
      onFocus={(event) => onHoverTheme?.(theme, event.currentTarget)}
      onMouseEnter={(event) => onHoverTheme?.(theme, event.currentTarget)}
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
