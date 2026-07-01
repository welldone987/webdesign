import { useEffect, useRef, type MouseEvent, type PointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CloseButton } from '../components/CloseButton.tsx';
import { ExifRow } from '../components/ExifRow.tsx';
import { PhotoSwitchButton } from '../components/PhotoSwitchButton.tsx';
import { findPhotoIndex } from '../lib/photos.ts';
import { preloadImage, requestIdleTask, shouldSkipIdlePreload } from '../lib/imagePreload.ts';
import { useReducedMotionPreference } from '../motion/useReducedMotionPreference.ts';
import type { Photo } from '../types/photography.ts';
import { ProgressiveDetailImage } from './ProgressiveImage.tsx';

const missingText = '已消失';
type DetailRow = [label: string, value: string | undefined];

type DetailOverlayProps = {
  photos: Photo[];
  selectedPhoto: Photo | null;
  onSelectPhoto: (photo: Photo) => void;
  onClose: () => void;
};

export function DetailOverlay({ photos, selectedPhoto, onSelectPhoto, onClose }: DetailOverlayProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);
  const swipeStartRef = useRef<{ x: number; y: number; pointerId: number; ignore: boolean } | null>(null);
  const prefersReducedMotion = useReducedMotionPreference();
  const selectedIndex = selectedPhoto ? findPhotoIndex(photos, selectedPhoto) : -1;
  const previousPhoto = selectedIndex > 0 ? photos[selectedIndex - 1] : undefined;
  const nextPhoto = selectedIndex >= 0 && selectedIndex < photos.length - 1 ? photos[selectedIndex + 1] : undefined;
  const isLandscape = selectedPhoto ? selectedPhoto.width >= selectedPhoto.height : false;
  const detailCardClass = isLandscape
    ? 'relative grid max-h-[calc(100vh-9rem)] w-full overflow-y-auto bg-porcelain shadow-2xl md:h-[min(86vh,860px)] md:w-[min(84vw,1480px)] md:max-h-[860px] md:grid-cols-[0.68fr_1.32fr] md:overflow-hidden xl:w-[min(80vw,1560px)]'
    : 'relative grid max-h-[calc(100vh-9rem)] w-full max-w-6xl overflow-y-auto bg-porcelain shadow-2xl md:max-h-[calc(100vh-4rem)] md:grid-cols-[0.82fr_1.18fr] md:overflow-hidden';
  const infoPanelClass = isLandscape
    ? 'order-2 overflow-y-auto p-5 font-serif text-ink sm:p-7 md:order-1 md:p-9 lg:p-11'
    : 'order-2 overflow-y-auto p-5 font-serif text-ink sm:p-7 md:order-1 md:p-10';
  const figureClass = isLandscape
    ? 'order-1 flex min-h-[240px] items-center justify-center bg-porcelain p-3 sm:min-h-[280px] sm:p-6 md:order-2 md:h-full md:min-h-0 md:p-8 lg:p-10'
    : 'order-1 flex min-h-0 items-center justify-center bg-porcelain p-4 sm:p-6 md:order-2 md:p-8';
  const imageClass = isLandscape
    ? 'max-h-[48vh] w-full object-contain md:max-h-full'
    : 'max-h-[52vh] w-auto max-w-full object-contain md:max-h-[calc(100vh-8rem)]';

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && window.matchMedia('(min-width: 768px)').matches) {
      onClose();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia('(max-width: 767px)').matches || event.pointerType === 'mouse') {
      swipeStartRef.current = null;
      return;
    }

    const target = event.target as HTMLElement;
    swipeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
      ignore: Boolean(target.closest('[data-photo-detail-control="true"]')),
    };
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;

    if (!start || start.ignore || start.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const horizontalDistance = Math.abs(deltaX);
    const verticalDistance = Math.abs(deltaY);

    if (horizontalDistance >= 90 && horizontalDistance > verticalDistance * 1.8 && verticalDistance <= 70) {
      onClose();
    }
  };

  useEffect(() => {
    if (!selectedPhoto) {
      wasOpenRef.current = false;
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!wasOpenRef.current) {
      closeRef.current?.focus();
    }
    wasOpenRef.current = true;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedPhoto]);

  useEffect(() => {
    if (!selectedPhoto || shouldSkipIdlePreload()) {
      return;
    }

    return requestIdleTask(() => {
      if (previousPhoto) {
        preloadImage(previousPhoto.src);
      }
      if (nextPhoto) {
        preloadImage(nextPhoto.src);
      }
    });
  }, [nextPhoto, previousPhoto, selectedPhoto]);

  useEffect(() => {
    if (!selectedPhoto) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Tab') {
        const focusable = Array.from(
          document.querySelectorAll<HTMLButtonElement>('[data-photo-detail-control="true"]'),
        ).filter((element) => !element.disabled);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!first || !last) {
          return;
        }

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key === 'ArrowLeft' && previousPhoto) {
        event.preventDefault();
        onSelectPhoto(previousPhoto);
      }
      if (event.key === 'ArrowRight' && nextPhoto) {
        event.preventDefault();
        onSelectPhoto(nextPhoto);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextPhoto, onClose, onSelectPhoto, previousPhoto, selectedPhoto]);

  const details: DetailRow[] = selectedPhoto
    ? [
        ['光圈', selectedPhoto.aperture],
        ['快门', selectedPhoto.shutterSpeed],
        ['拍摄日期', selectedPhoto.date],
        ['地点', selectedPhoto.location],
      ]
    : [];
  const hasMissing = details.some(([, value]) => !value);

  return (
    <AnimatePresence>
      {selectedPhoto ? (
        <motion.div
          animate={{ opacity: 1 }}
          aria-labelledby="photo-detail-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-3 pb-20 pt-16 backdrop-blur-md sm:p-8"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={handleBackdropClick}
          onPointerCancel={() => {
            swipeStartRef.current = null;
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          role="dialog"
        >
          <CloseButton buttonRef={closeRef} onClose={onClose} />
          {previousPhoto ? (
            <PhotoSwitchButton direction="previous" onClick={() => onSelectPhoto(previousPhoto)} />
          ) : null}
          {nextPhoto ? <PhotoSwitchButton direction="next" onClick={() => onSelectPhoto(nextPhoto)} /> : null}
          <motion.div
            animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
            className={detailCardClass}
            data-testid="photo-detail-card"
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98, y: 12 }}
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <section className={infoPanelClass}>
              <p className="text-sm tracking-[0.2em] text-moss">{selectedPhoto.category}</p>
              <h2 className="mt-5 min-h-[2.75rem] text-4xl leading-tight" id="photo-detail-title">
                {selectedPhoto.title ? (
                  selectedPhoto.title
                ) : (
                  <>
                    <span aria-hidden="true">&nbsp;</span>
                    <span className="sr-only">无名照片</span>
                  </>
                )}
              </h2>
              <dl className="mt-10 space-y-5 text-lg leading-8">
                {details.map(([label, value]) => (
                  <ExifRow key={label} label={label} missingText={missingText} value={value} />
                ))}
              </dl>
              {hasMissing ? <p className="mt-5 text-lg leading-8">不过回忆还在</p> : null}
            </section>
            <figure className={figureClass}>
              <ProgressiveDetailImage className={imageClass} photo={selectedPhoto} />
            </figure>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
