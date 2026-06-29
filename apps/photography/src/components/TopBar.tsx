type TopBarProps = {
  title: string;
  onBack: () => void;
};

export function TopBar({ title, onBack }: TopBarProps) {
  return (
    <header className="mx-auto mb-8 flex max-w-[1500px] items-center justify-between font-serif text-sm">
      <button
        className="min-h-11 px-2 underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-umber"
        onClick={onBack}
        type="button"
      >
        返回
      </button>
      <p className="uppercase tracking-[0.24em] text-ink/45">{title}</p>
    </header>
  );
}
