import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Photo } from '../types/photography.ts';

type PhotoViewerProps = {
  photo: Photo | null;
  onClose: () => void;
};

export function PhotoViewer({ photo, onClose }: PhotoViewerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!photo) {
      return;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, photo]);

  return (
    <AnimatePresence>
      {photo ? (
        <motion.div
          animate={{ opacity: 1 }}
          aria-labelledby="photo-viewer-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-stone-950/94 p-4"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          role="dialog"
        >
          <button
            aria-label="关闭图片查看器"
            className="absolute right-4 top-4 min-h-11 border border-stone-600 px-4 py-2 text-stone-100 hover:border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            关闭
          </button>
          <motion.figure
            animate={prefersReducedMotion ? undefined : { scale: 1, y: 0 }}
            className="w-full max-w-5xl"
            exit={prefersReducedMotion ? undefined : { scale: 0.98, y: 12 }}
            initial={prefersReducedMotion ? undefined : { scale: 0.98, y: 12 }}
          >
            <img
              alt={photo.alt}
              className="max-h-[78vh] w-full object-contain"
              height={photo.height}
              src={photo.src}
              width={photo.width}
            />
            <figcaption className="mt-4 text-stone-200">
              <h2 className="font-serif text-3xl" id="photo-viewer-title">
                {photo.title}
              </h2>
              <p className="mt-1 text-sm text-stone-400">
                {[photo.category, photo.location, photo.year].filter(Boolean).join(' · ')}
              </p>
            </figcaption>
          </motion.figure>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
