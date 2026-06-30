import { ThemeRail } from '../patterns/ThemeRail.tsx';
import type { ThemeSummary } from '../types/photography.ts';

export type ShowcaseSection = 'presentation' | 'profile';

type ShowcaseNavigationProps = {
  themes: ThemeSummary[];
  activeThemeSlug: string;
  activeSection: ShowcaseSection;
  onHome: () => void;
  onSelectSection: (section: ShowcaseSection) => void;
  onSelectTheme: (themeSlug: string) => void;
};

const topLevelItemClass =
  'min-h-11 px-1 font-serif text-base font-semibold leading-none transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-umber';
const mobilePrimaryItemClass = `${topLevelItemClass} border-b-2`;
const desktopTopLevelItemClass = `${topLevelItemClass} block w-full text-left`;

export function ShowcaseNavigation({
  themes,
  activeThemeSlug,
  activeSection,
  onHome,
  onSelectSection,
  onSelectTheme,
}: ShowcaseNavigationProps) {
  return (
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
                activeSection === 'presentation' ? 'border-ink text-ink' : 'border-transparent text-ink/66'
              }`}
              onClick={() => onSelectSection('presentation')}
              type="button"
            >
              呈现
            </button>
            <button
              className={`${mobilePrimaryItemClass} grid place-items-center ${
                activeSection === 'profile' ? 'border-ink text-ink' : 'border-transparent text-ink/66'
              }`}
              onClick={() => onSelectSection('profile')}
              type="button"
            >
              个人简介
            </button>
          </div>
          {activeSection === 'presentation' ? (
            <div className="mt-3" id="mobile-theme-menu">
              <ThemeRail activeThemeSlug={activeThemeSlug} onSelectTheme={onSelectTheme} themes={themes} />
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
              onClick={() => onSelectSection('presentation')}
              type="button"
            >
              呈现
            </button>
            <ThemeRail activeThemeSlug={activeThemeSlug} onSelectTheme={onSelectTheme} themes={themes} />
          </div>
          <button
            className={`${desktopTopLevelItemClass} mt-8 ${
              activeSection === 'profile' ? 'text-ink underline underline-offset-4' : 'text-ink/64'
            }`}
            onClick={() => onSelectSection('profile')}
            type="button"
          >
            个人简介
          </button>
        </div>
      </nav>
    </aside>
  );
}
