import { useEffect, useRef, useState } from 'react';
import type { Photo } from '../types/photography.ts';
import { getPreviewHeight, getPreviewSrc, getPreviewWidth } from '../lib/photos.ts';
import { preloadImage } from '../lib/imagePreload.ts';
import { useReducedMotionPreference } from '../motion/useReducedMotionPreference.ts';

type ProgressiveImageProps = {
  photo: Photo;
  priority?: boolean;
};

export function ProgressiveImage({ photo, priority = false }: ProgressiveImageProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [isLoaded, setIsLoaded] = useState(false);
  const prefersReducedMotion = useReducedMotionPreference();
  const previewSrc = getPreviewSrc(photo);
  const previewWidth = getPreviewWidth(photo);
  const previewHeight = getPreviewHeight(photo);

  useEffect(() => {
    if (priority || shouldLoad) {
      return;
    }

    const element = containerRef.current;
    if (!element) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px 600px 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [priority, shouldLoad]);

  useEffect(() => {
    if (priority) {
      preloadImage(previewSrc);
    }
  }, [previewSrc, priority]);

  return (
    <span
      className="relative block w-full overflow-hidden bg-paper"
      data-testid="photo-preview-frame"
      ref={containerRef}
      style={{ aspectRatio: `${previewWidth} / ${previewHeight}` }}
    >
      {photo.placeholder ? (
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-xl"
          draggable={false}
          src={photo.placeholder}
        />
      ) : null}
      {shouldLoad ? (
        <img
          alt={photo.alt}
          className="absolute inset-0 h-full w-full object-cover transition group-hover:brightness-[0.94]"
          data-testid="photo-preview-image"
          decoding="async"
          height={previewHeight}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setIsLoaded(true)}
          src={previewSrc}
          style={{
            opacity: isLoaded ? 1 : 0,
            transitionDuration: prefersReducedMotion ? '1ms' : '450ms',
          }}
          width={previewWidth}
        />
      ) : null}
    </span>
  );
}

type ProgressiveDetailImageProps = {
  photo: Photo;
  className: string;
};

type VisibleDetailImage = {
  src: string;
  width: number;
  height: number;
  fullLoaded: boolean;
  photoSrc: string;
};

function createPreviewDetailImage(photo: Photo): VisibleDetailImage {
  return {
    src: getPreviewSrc(photo),
    width: getPreviewWidth(photo),
    height: getPreviewHeight(photo),
    fullLoaded: false,
    photoSrc: photo.src,
  };
}

async function decodeImage(src: string): Promise<void> {
  const image = new Image();
  image.decoding = 'async';
  image.src = src;

  if (image.decode) {
    await image.decode();
    return;
  }

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  });
}

export function ProgressiveDetailImage({ photo, className }: ProgressiveDetailImageProps) {
  const [visibleImage, setVisibleImage] = useState<VisibleDetailImage>(() => createPreviewDetailImage(photo));
  const previewSrc = getPreviewSrc(photo);

  useEffect(() => {
    let cancelled = false;
    const previewImage = createPreviewDetailImage(photo);

    void decodeImage(previewSrc)
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) {
          setVisibleImage((current) => (current.photoSrc === photo.src ? current : previewImage));
        }
      });

    void decodeImage(photo.src)
      .then(() => {
        if (!cancelled) {
          setVisibleImage({
            src: photo.src,
            width: photo.width,
            height: photo.height,
            fullLoaded: true,
            photoSrc: photo.src,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVisibleImage(previewImage);
        }
        console.warn(`Failed to load full-size photo: ${photo.src}`);
      });

    return () => {
      cancelled = true;
    };
  }, [photo, photo.src, previewSrc]);

  return (
    <img
      alt={photo.alt}
      className={className}
      data-full-loaded={visibleImage.fullLoaded ? 'true' : 'false'}
      data-testid="photo-detail-image"
      decoding="async"
      height={visibleImage.height}
      src={visibleImage.src}
      width={visibleImage.width}
    />
  );
}
