import type { ThemeSummary } from '../types/photography.ts';
import { allCollectionSlug, themeAccents } from '../data/themes.ts';

type ThemeRailProps = {
  themes: ThemeSummary[];
  activeThemeSlug: string;
  isAllPhotos: boolean;
  onSelectTheme: (themeSlug: string) => void;
};

export function ThemeRail({ themes, activeThemeSlug, isAllPhotos, onSelectTheme }: ThemeRailProps) {
  return (
    <div className="scrollbar-thin -mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0">
      {themes.map((theme) => (
        <button
          aria-pressed={theme.slug === activeThemeSlug}
          className="block min-h-11 min-w-[5.75rem] shrink-0 border px-2.5 py-1.5 text-left font-serif text-sm font-normal leading-none transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-umber lg:w-full lg:px-3 lg:py-2"
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
          <span className="ml-2 font-sans text-[0.68rem] tracking-[0.12em] opacity-45 lg:ml-3 lg:text-xs lg:tracking-[0.14em]">
            {theme.subtitle}
          </span>
        </button>
      ))}
      <button
        aria-pressed={isAllPhotos}
        className="block min-h-11 min-w-[6.25rem] shrink-0 border border-transparent px-2.5 py-1.5 text-left font-serif text-sm font-normal leading-none transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-umber lg:mt-3 lg:w-full lg:px-3 lg:py-3"
        onClick={() => onSelectTheme(allCollectionSlug)}
        type="button"
      >
        <span className={isAllPhotos ? 'text-ink' : undefined}>全部图片</span>
        <span className="ml-2 font-sans text-[0.68rem] tracking-[0.12em] opacity-45 lg:ml-3 lg:text-xs lg:tracking-[0.14em]">
          All Photographs
        </span>
      </button>
    </div>
  );
}
