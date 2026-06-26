export function Footer() {
  return (
    <footer className="bg-[#f3eee5] px-5 py-10 text-stone-700 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm sm:flex-row">
        <p>© 2026 Personal Photography</p>
        <a
          className="min-h-11 py-3 underline-offset-4 hover:text-stone-950 hover:underline focus:outline-none focus:ring-2 focus:ring-stone-950"
          href="mailto:hello@example.com"
        >
          hello@example.com
        </a>
      </div>
    </footer>
  );
}
