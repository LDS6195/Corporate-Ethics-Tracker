import Tooltip from "./Tooltip";

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  colorClassName?: string;
  /** Methodology explanation shown in a hover tooltip next to the label. */
  description?: string;
  /** Number of source citations backing this category, surfaced in the tooltip. */
  citationsCount?: number;
}

export default function ProgressBar({
  label,
  value,
  max,
  colorClassName = "bg-sky-500",
  description,
  citationsCount,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const normalizedScore = Math.round(pct);

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-neutral-400">
        {description ? (
          <Tooltip
            content={
              <>
                <p>{description}</p>
                <p className="mt-2 text-neutral-500">
                  {citationsCount
                    ? `Backed by ${citationsCount} source citation${citationsCount === 1 ? "" : "s"} — see below for specifics.`
                    : "No citations sourced yet for this company — score reflects the baseline pending research."}
                </p>
              </>
            }
          >
            <span className="inline-flex items-center gap-1">
              {label}
              <span className="tooltip-indicator" aria-label="More info">
                ?
              </span>
            </span>
          </Tooltip>
        ) : (
          <span>{label}</span>
        )}
        <span className="tabular-nums">{normalizedScore}/100</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
        <div
          className={`h-full rounded-full ${colorClassName} transition-all duration-300`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
    </div>
  );
}
