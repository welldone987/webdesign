type CategoryNavProps = {
  categories: string[];
  activeCategory: string;
  onChange: (category: string) => void;
};

export function CategoryNav({ categories, activeCategory, onChange }: CategoryNavProps) {
  return (
    <nav
      aria-label="摄影作品分类"
      className="sticky top-0 z-20 border-b border-stone-800 bg-stone-950/92 px-5 py-3 backdrop-blur sm:px-8"
    >
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
        {categories.map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              aria-pressed={isActive}
              className={[
                'min-h-11 whitespace-nowrap border px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-400',
                isActive
                  ? 'border-amber-300 bg-amber-300 text-stone-950'
                  : 'border-stone-700 text-stone-300 hover:border-stone-400 hover:text-stone-50',
              ].join(' ')}
              key={category}
              onClick={() => onChange(category)}
              type="button"
            >
              {category}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
