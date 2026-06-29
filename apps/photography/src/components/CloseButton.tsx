import type { RefObject } from 'react';

type CloseButtonProps = {
  buttonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
};

export function CloseButton({ buttonRef, onClose }: CloseButtonProps) {
  return (
    <button
      aria-label="关闭图片详情"
      className="absolute left-4 top-4 z-10 min-h-11 border border-porcelain/60 bg-ink/35 px-4 py-2 font-serif text-porcelain focus:outline-none focus:ring-2 focus:ring-porcelain sm:left-8 sm:top-8"
      data-photo-detail-control="true"
      onClick={onClose}
      ref={buttonRef}
      type="button"
    >
      关闭
    </button>
  );
}
