import { motion } from 'framer-motion';
import type { Photo } from '../types/photography.ts';
import { HomeCoverComposition } from '../patterns/HomeCoverComposition.tsx';
import { useReducedMotionPreference } from '../motion/useReducedMotionPreference.ts';

type HomeViewProps = {
  photos: Photo[];
  fallbackPhotos: Photo[];
  onEnter: () => void;
};

export function HomeView({ photos, fallbackPhotos, onEnter }: HomeViewProps) {
  const prefersReducedMotion = useReducedMotionPreference();
  const animationPhotos = photos.length > 0 ? photos : fallbackPhotos.slice(0, 7);

  return (
    <motion.main
      animate={{ opacity: 1 }}
      className="relative isolate min-h-screen overflow-hidden bg-[#f7f7f4] text-black"
      exit={{ opacity: 0 }}
      id="main-content"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <HomeCoverComposition photos={animationPhotos} prefersReducedMotion={prefersReducedMotion} />
      <section className="relative mx-auto min-h-screen max-w-[1600px] px-5 py-5 sm:px-8 lg:px-10">
        <div aria-hidden="true" className="absolute left-0 top-0 z-20 hidden h-screen w-5 bg-black sm:block lg:w-7" />
        <div aria-hidden="true" className="absolute left-0 top-[clamp(5.5rem,12vw,8.4rem)] z-20 h-px w-full bg-black/28" />

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

        <motion.div
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="absolute bottom-6 left-5 right-5 z-30 flex items-end justify-between gap-4 sm:bottom-10 sm:left-auto sm:right-8 sm:justify-start sm:gap-5 lg:right-12"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          transition={{ delay: 0.28, duration: 0.6, ease: 'easeOut' }}
        >
          <button
            className="min-h-12 border border-black bg-black px-5 py-3 font-serif text-base text-[#f7f7f4] transition hover:bg-transparent hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-4 focus:ring-offset-[#f7f7f4]"
            onClick={onEnter}
            type="button"
          >
            开始观看
          </button>
          <p
            aria-label="無摄影集"
            className="font-serif text-[2.8rem] leading-[0.9] text-black [writing-mode:vertical-rl] sm:text-[5.5rem] lg:text-[6.5rem]"
          >
            無摄影集
          </p>
        </motion.div>
      </section>
    </motion.main>
  );
}
