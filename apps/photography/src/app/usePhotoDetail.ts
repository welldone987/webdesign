import { useRef, useState } from 'react';
import { preloadImage } from '../lib/imagePreload.ts';
import type { Photo } from '../types/photography.ts';

export function usePhotoDetail() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const photoTriggerRef = useRef<HTMLButtonElement | null>(null);

  const openPhoto = (photo: Photo, trigger: HTMLButtonElement) => {
    photoTriggerRef.current = trigger;
    preloadImage(photo.src);
    setSelectedPhoto(photo);
  };

  const selectPhoto = (photo: Photo) => {
    preloadImage(photo.src);
    setSelectedPhoto(photo);
  };

  const closePhoto = () => {
    setSelectedPhoto(null);
    window.requestAnimationFrame(() => photoTriggerRef.current?.focus());
  };

  return {
    selectedPhoto,
    openPhoto,
    selectPhoto,
    closePhoto,
  };
}
