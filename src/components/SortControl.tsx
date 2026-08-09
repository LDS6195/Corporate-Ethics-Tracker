"use client";

export interface SortOption<T extends string> {
  value: T;
  label: string;
}

interface SortControlProps<T extends string> {
  options: SortOption<T>[];
  sortKey: T;
  sortDir: "asc" | "desc";
  onSortKeyChange: (key: T) => void;
  onToggleDirection: () => void;
}

export default function SortControl<T extends string>({
  options,
  sortKey,
  sortDir,
  onSortKeyChange,
  onToggleDirection,
}: SortControlProps<T>) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-by-select" className="text-xs font-medium text-neutral-500">
        Sort by
      </label>
      <select
        id="sort-by-select"
        value={sortKey}
        onChange={(e) => onSortKeyChange(e.target.value as T)}
        className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-100 focus:border-sky-500 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onToggleDirection}
        aria-label={`Toggle sort direction, currently ${sortDir === "asc" ? "ascending" : "descending"}`}
        className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:text-neutral-100"
      >
        {sortDir === "asc" ? "▲ Asc" : "▼ Desc"}
      </button>
    </div>
  );
}
