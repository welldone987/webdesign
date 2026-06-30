import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type HomePreloaderProps = {
  prefersReducedMotion: boolean;
};

const preloadDurationMs = 1000;

export function HomePreloader({ prefersReducedMotion }: HomePreloaderProps) {
  const [isVisible, setIsVisible] = useState(() => sessionStorage.getItem('photography-home-preloaded') !== 'true');

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const handle = window.setTimeout(
      () => {
        sessionStorage.setItem('photography-home-preloaded', 'true');
        setIsVisible(false);
      },
      prefersReducedMotion ? 250 : preloadDurationMs,
    );

    return () => window.clearTimeout(handle);
  }, [isVisible, prefersReducedMotion]);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          aria-label="Loading"
          aria-live="polite"
          className="fixed inset-0 z-[120] grid place-items-center bg-black px-5 text-white"
          exit={{ opacity: 0 }}
          initial={false}
          role="status"
          transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: 'easeOut' }}
        >
          <div className="grid w-full max-w-[720px] grid-cols-1 gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-6">
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">Loading</span>
            <div className="h-3 border border-white p-0.5">
              <motion.div
                animate={prefersReducedMotion ? { width: '100%' } : { width: '100%' }}
                className="h-full bg-white"
                initial={{ width: '0%' }}
                transition={{ duration: prefersReducedMotion ? 0 : 1, ease: [0.65, 0, 0.35, 1] }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
