import { motion } from 'framer-motion';
import { TopBar } from '../components/TopBar.tsx';
import { useReducedMotionPreference } from '../motion/useReducedMotionPreference.ts';
import type { ThemeSummary } from '../types/photography.ts';

type GuideViewProps = {
  themes: ThemeSummary[];
  onBack: () => void;
  onSelectTheme: (themeSlug: string) => void;
};

export function GuideView({ themes, onBack, onSelectTheme }: GuideViewProps) {
  const prefersReducedMotion = useReducedMotionPreference();

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
        <p className="font-serif text-2xl text-ink/70">从一种光线进入这组照片</p>
        <div className="relative mt-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-porcelain to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-porcelain to-transparent" />
          <div className="scrollbar-thin flex snap-x gap-5 overflow-x-auto pb-8 pr-[42vw]">
            {themes.map((theme, index) => (
              <motion.button
                animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                className="group relative h-[62vh] min-h-[330px] w-[82vw] max-w-[560px] shrink-0 snap-start overflow-hidden bg-paper text-left focus:outline-none focus:ring-2 focus:ring-umber focus:ring-offset-4 focus:ring-offset-porcelain sm:h-[58vh] sm:min-h-[360px] sm:w-[42vw] sm:min-w-[310px]"
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
                  <span className="font-serif text-[clamp(4.4rem,22vw,10rem)] leading-none opacity-86 sm:text-[clamp(5rem,12vw,10rem)]">{theme.name}</span>
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
