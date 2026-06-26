import { motion, useReducedMotion } from 'framer-motion';
import type { Photo } from '../types/photography.ts';

type HeroProps = {
  featuredPhotos: Photo[];
};

export function Hero({ featuredPhotos }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const cover = featuredPhotos[0];
  const secondary = featuredPhotos[1] ?? featuredPhotos[0];

  return (
    <header className="relative overflow-hidden border-b border-stone-800 bg-[#111111]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 text-sm text-stone-300 sm:px-8">
        <a className="font-serif text-xl tracking-normal text-stone-50" href="/">
          Photography
        </a>
        <a
          className="min-h-11 px-3 py-3 text-stone-300 underline-offset-4 hover:text-stone-50 hover:underline focus:outline-none focus:ring-2 focus:ring-amber-400"
          href="mailto:hello@example.com"
        >
          联系
        </a>
      </nav>
      <section className="mx-auto grid min-h-[78vh] max-w-7xl gap-10 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:items-end">
        <motion.div
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="max-w-3xl"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <p className="mb-5 text-sm uppercase tracking-[0.24em] text-amber-300">
            Personal Photography Archive
          </p>
          <h1 className="font-serif text-5xl leading-[0.95] text-stone-50 sm:text-7xl lg:text-8xl">
            摄影集
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-stone-300">
            以人像、街拍和风景为主的个人影像整理。第一版先建立可维护的数据结构和浏览体验，后续直接替换真实作品。
          </p>
        </motion.div>

        <div className="grid grid-cols-[1fr_0.72fr] items-end gap-4">
          <img
            alt={cover.alt}
            className="aspect-[3/4] w-full object-cover"
            height={cover.height}
            loading="eager"
            src={cover.src}
            width={cover.width}
          />
          <img
            alt={secondary.alt}
            className="mb-12 aspect-[4/5] w-full object-cover"
            height={secondary.height}
            loading="eager"
            src={secondary.src}
            width={secondary.width}
          />
        </div>
      </section>
    </header>
  );
}
