import { motion, useReducedMotion } from 'framer-motion';
import type { Photo } from '../types/photography.ts';

type GalleryGridProps = {
  photos: Photo[];
  onOpenPhoto: (photo: Photo) => void;
};

export function GalleryGrid({ photos, onOpenPhoto }: GalleryGridProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <main className="bg-[#f3eee5] text-stone-950" id="gallery">
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-stone-500">Selected Works</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">作品</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-stone-600">
            点击图片查看大图。真实作品上线前，这里使用轻量 SVG 占位图验证布局、数据和交互流程。
          </p>
        </div>

        {photos.length === 0 ? (
          <p className="border border-stone-300 p-8 text-stone-600">当前分类暂无作品。</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => (
              <motion.button
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                className="group min-h-11 text-left focus:outline-none focus:ring-2 focus:ring-stone-950 focus:ring-offset-4 focus:ring-offset-[#f3eee5]"
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
                key={photo.slug ?? photo.src}
                onClick={() => onOpenPhoto(photo)}
                transition={{ delay: index * 0.05, duration: 0.45, ease: 'easeOut' }}
                type="button"
              >
                <span className="block overflow-hidden bg-stone-300">
                  <img
                    alt={photo.alt}
                    className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    height={photo.height}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    src={photo.src}
                    width={photo.width}
                  />
                </span>
                <span className="mt-3 flex items-start justify-between gap-4">
                  <span>
                    <span className="block font-serif text-2xl">{photo.title}</span>
                    <span className="mt-1 block text-sm text-stone-600">
                      {[photo.location, photo.year].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span className="text-sm text-stone-500">{photo.category}</span>
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
