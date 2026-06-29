import { motion } from 'framer-motion';
import type { Photo } from '../types/photography.ts';
import { getPreviewHeight, getPreviewSrc, getPreviewWidth } from '../lib/photos.ts';

type HomeCoverCompositionProps = {
  photos: Photo[];
  prefersReducedMotion: boolean;
};

export function HomeCoverComposition({ photos, prefersReducedMotion }: HomeCoverCompositionProps) {
  const stackPhotos = photos.slice(0, 7);

  return (
    <>
      <HomeFrameMarks />
      <motion.div
        animate={prefersReducedMotion ? undefined : { opacity: 1, rotate: -5, y: [0, -10, 0] }}
        aria-hidden="true"
        className="absolute right-[-14vw] top-[42vh] z-0 h-[42vh] w-[74vw] max-w-[920px] -translate-y-1/2 sm:right-[-6vw] sm:top-[50vh] sm:h-[48vh] sm:w-[62vw] lg:right-[3vw] lg:top-[55vh] lg:h-[56vh] lg:w-[50vw]"
        initial={prefersReducedMotion ? undefined : { opacity: 0, rotate: -2, y: 28 }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                opacity: { duration: 0.7, ease: 'easeOut' },
                rotate: { duration: 0.7, ease: 'easeOut' },
                y: { duration: 8, ease: 'easeInOut', repeat: Infinity },
              }
        }
      >
        <div className="absolute inset-0 bg-black shadow-[0_28px_80px_rgba(0,0,0,0.18)]" />
        {stackPhotos.map((photo, index) => {
          const angle = -24 + index * 8;
          const offsetX = -18 + index * 8;
          const offsetY = 26 - index * 9;
          const widthClass = index % 3 === 0 ? 'w-[52%]' : index % 3 === 1 ? 'w-[46%]' : 'w-[58%]';
          const heightClass = index % 2 === 0 ? 'h-[44%]' : 'h-[54%]';

          return (
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, index % 2 === 0 ? 12 : -10, 0] }}
              className={`absolute left-1/2 top-1/2 ${widthClass} ${heightClass} overflow-hidden border border-white/65 bg-zinc-100 mix-blend-luminosity`}
              initial={false}
              key={photo.slug ?? photo.src}
              style={{
                transform: `translate(${offsetX - 50}%, ${offsetY - 50}%) rotate(${angle}deg) skewY(-8deg)`,
                zIndex: index + 1,
              }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { delay: index * 0.12, duration: 5.5 + index * 0.45, ease: 'easeInOut', repeat: Infinity }
              }
            >
              <img
                alt=""
                className="h-full w-full scale-125 object-cover grayscale blur-[3px] contrast-125"
                draggable={false}
                height={getPreviewHeight(photo)}
                loading={index < 3 ? 'eager' : 'lazy'}
                src={getPreviewSrc(photo)}
                width={getPreviewWidth(photo)}
              />
              <span className="absolute inset-0 bg-black/28" />
            </motion.div>
          );
        })}
        <div className="absolute bottom-[-8%] left-[13%] h-[3px] w-[62%] rotate-[-18deg] bg-black" />
        <div className="absolute right-[12%] top-[5%] h-[2px] w-[34%] rotate-[-32deg] bg-white/80" />
      </motion.div>
    </>
  );
}

function HomeFrameMarks() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute left-0 top-0 h-[6px] w-full bg-[#d7e4e2]" />
      <div className="absolute bottom-[18vh] left-[8vw] h-px w-[38vw] bg-black/14" />
      <div className="absolute bottom-[14vh] right-[8vw] h-px w-[26vw] bg-black/14" />
    </div>
  );
}
