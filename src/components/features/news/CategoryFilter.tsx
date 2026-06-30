interface CategoryFilterProps {
  categories: readonly string[];
  active: string;
  onChange: (cat: string) => void;
  resultCount: number;
}

export default function CategoryFilter({
  categories,
  active,
  onChange,
  resultCount,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar"
        role="group"
        aria-label="카테고리 필터"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            aria-pressed={active === cat}
            className={[
              "shrink-0 px-3 py-1.5 rounded-btn text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand",
              active === cat
                ? "bg-brand text-white"
                : "bg-white border border-ink-200 text-ink-600 hover:border-brand/40 hover:text-brand",
            ].join(" ")}
          >
            {cat}
          </button>
        ))}
      </div>
      <span className="shrink-0 text-[13px] text-ink-400 tnum">
        {resultCount.toLocaleString()}건
      </span>
    </div>
  );
}
