"use client";

import Tooltip from "./Tooltip";

interface SortableHeaderProps<T extends string> {
  label: string;
  sortKey: T;
  activeKey: T;
  direction: "asc" | "desc";
  onSort: (key: T) => void;
  align?: "left" | "right";
  className?: string;
  description?: string;
}

export default function SortableHeader<T extends string>({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = "left",
  className = "",
  description,
}: SortableHeaderProps<T>) {
  const isActive = sortKey === activeKey;
  return (
    <th
      scope="col"
      className={`px-4 py-3 font-medium ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => onSort(sortKey)}
          className={`inline-flex items-center gap-1 hover:text-neutral-200 ${
            isActive ? "text-neutral-200" : ""
          }`}
        >
          {label}
          <span className="text-[10px] leading-none">
            {isActive ? (direction === "asc" ? "▲" : "▼") : ""}
          </span>
        </button>
        {description && (
          <Tooltip content={<p>{description}</p>}>
            <span className="tooltip-indicator" aria-label="More info">
              ?
            </span>
          </Tooltip>
        )}
      </span>
    </th>
  );
}
