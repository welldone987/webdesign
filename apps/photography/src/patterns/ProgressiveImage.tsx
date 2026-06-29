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

export function ProgressiveDetailImage({ photo, className }: ProgressiveDetailImageProps) {
  const [largeLoaded, setLargeLoaded] = useState(false);
  const [largeFailed, setLargeFailed] = useState(false);
  const prefersReducedMotion = useReducedMotionPreference();
  const previewSrc = getPreviewSrc(photo);

  useEffect(() => {
    setLargeLoaded(false);
    setLargeFailed(false);

    const image = new Image();
    image.decoding = 'async';
    image.onload = () => setLargeLoaded(true);
    image.onerror = () => {
      setLargeFailed(true);
      console.warn(`Failed to load full-size photo: ${photo.src}`);
    };
    image.src = photo.src;

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [photo.src]);

  return (
    <span className="relative block">
      <img
        alt={photo.alt}
        className={className}
        decoding="async"
        height={getPreviewHeight(photo)}
        src={previewSrc}
        width={getPreviewWidth(photo)}
      />
      {!largeFailed ? (
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain transition-opacity"
          decoding="async"
          height={photo.height}
          src={photo.src}
          style={{
            opacity: largeLoaded ? 1 : 0,
            transitionDuration: prefersReducedMotion ? '1ms' : '450ms',
          }}
          width={photo.width}
        />
      ) : null}
    </span>
  );
}
