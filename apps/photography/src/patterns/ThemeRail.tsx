import type { ThemeSummary } from '../types/photography.ts';
import { themeAccents } from '../data/themes.ts';

type ThemeRailProps = {
  themes: ThemeSummary[];
  activeThemeSlug: string;
  onSelectTheme: (themeSlug: string) => void;
};

export function ThemeRail({ themes, activeThemeSlug, onSelectTheme }: ThemeRailProps) {
  return (
    <div className="scrollbar-thin -mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1 pb-1 text-center lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0 lg:text-left">
      {themes.map((theme) => (
        <button
          aria-pressed={theme.slug === activeThemeSlug}
          className="grid min-h-11 min-w-[5.75rem] shrink-0 place-items-center border-2 bg-white px-2.5 py-1.5 font-serif text-sm font-normal leading-none text-ink transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-umber lg:block lg:w-full lg:px-3 lg:py-2 lg:text-left"
          key={theme.slug}
          onClick={() => onSelectTheme(theme.slug)}
          style={
            theme.slug === activeThemeSlug
              ? {
                  backgroundColor: '#fff',
                  borderColor: themeAccents[theme.slug as keyof typeof themeAccents]?.accent,
                }
              : { borderColor: 'transparent' }
          }
          type="button"
        >
          <span className={theme.slug === activeThemeSlug ? 'text-ink' : undefined}>{theme.name}</span>
          <span className="font-serif mt-1 block text-[0.68rem] font-light tracking-[0.12em] opacity-45 lg:ml-3 lg:mt-0 lg:inline lg:text-xs lg:tracking-[0.14em]">
            {theme.subtitle}
          </span>
        </button>
      ))}
    </div>
  );
}
