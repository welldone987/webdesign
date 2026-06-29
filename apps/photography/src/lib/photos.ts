import type { Photo } from '../types/photography.ts';

export function getPreviewSrc(photo: Photo) {
  return photo.previewSrc ?? photo.src;
}

export function getPreviewWidth(photo: Photo) {
  return photo.previewWidth ?? photo.width;
}

export function getPreviewHeight(photo: Photo) {
  return photo.previewHeight ?? photo.height;
}

export function findPhotoIndex(photos: Photo[], selectedPhoto: Photo) {
  return photos.findIndex((photo) => (selectedPhoto.slug ? photo.slug === selectedPhoto.slug : photo.src === selectedPhoto.src));
}
