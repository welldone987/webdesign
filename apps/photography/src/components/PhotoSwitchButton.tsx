type PhotoSwitchButtonProps = {
  direction: 'previous' | 'next';
  onClick: () => void;
};

export function PhotoSwitchButton({ direction, onClick }: PhotoSwitchButtonProps) {
  const isPrevious = direction === 'previous';

  return (
    <button
      aria-label={isPrevious ? '查看上一张照片' : '查看下一张照片'}
      className={`absolute bottom-5 z-20 grid h-11 w-11 place-items-center border border-ink/70 bg-porcelain/90 font-numeric-serif text-3xl leading-none text-ink shadow-sm backdrop-blur transition hover:bg-porcelain focus:outline-none focus:ring-2 focus:ring-umber focus:ring-offset-2 focus:ring-offset-transparent md:top-1/2 md:bottom-auto md:h-14 md:w-14 md:-translate-y-1/2 ${
        isPrevious ? 'left-3 sm:left-8' : 'right-3 sm:right-8'
      }`}
      data-photo-detail-control="true"
      onClick={onClick}
      type="button"
    >
      {isPrevious ? '<' : '>'}
    </button>
  );
}
