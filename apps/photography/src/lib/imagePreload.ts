const preloadedImages = new Set<string>();

export function shouldSkipIdlePreload() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(connection?.saveData);
}

export function preloadImage(src: string) {
  if (!src || preloadedImages.has(src)) {
    return;
  }

  preloadedImages.add(src);
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
}

export function requestIdleTask(callback: () => void) {
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(callback, { timeout: 1800 });
    return () => window.cancelIdleCallback(handle);
  }

  const handle = globalThis.setTimeout(callback, 300);
  return () => globalThis.clearTimeout(handle);
}
