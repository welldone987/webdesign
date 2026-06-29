import { motion } from 'framer-motion';
import type { Photo } from '../types/photography.ts';
import { getPreviewSrc } from '../lib/photos.ts';
import { preloadImage } from '../lib/imagePreload.ts';
import { useReducedMotionPreference } from '../motion/useReducedMotionPreference.ts';
import { ProgressiveImage } from './ProgressiveImage.tsx';

type MasonryGalleryProps = {
  photos: Photo[];
  onOpenPhoto: (photo: Photo, trigger: HTMLButtonElement) => void;
};

export function MasonryGallery({ photos, onOpenPhoto }: MasonryGalleryProps) {
  const prefersReducedMotion = useReducedMotionPreference();

  return (
    <div className="columns-2 gap-3 lg:columns-3 lg:gap-5">
      {photos.map((photo, index) => (
        <motion.button
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="group mb-3 block w-full break-inside-avoid text-left focus:outline-none focus:ring-2 focus:ring-umber focus:ring-offset-4 focus:ring-offset-porcelain lg:mb-5"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 18 }}
          key={photo.slug ?? photo.src}
          onClick={(event) => onOpenPhoto(photo, event.currentTarget)}
          onFocus={() => preloadImage(getPreviewSrc(photo))}
          onMouseEnter={() => {
            if (window.matchMedia('(hover: hover)').matches) {
              preloadImage(photo.src);
            }
          }}
          transition={{ delay: Math.min(index * 0.025, 0.35), duration: 0.45, ease: 'easeOut' }}
          type="button"
        >
          <ProgressiveImage photo={photo} priority={index < 6} />
        </motion.button>
      ))}
    </div>
  );
}
