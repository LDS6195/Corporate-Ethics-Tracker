import { getScoreTier } from "@/lib/scoring";

const TIER_STYLES: Record<string, string> = {
  high: "text-emerald-400 bg-emerald-950/60 ring-1 ring-emerald-500/40",
  medium: "text-amber-400 bg-amber-950/60 ring-1 ring-amber-500/40",
  low: "text-rose-400 bg-rose-950/60 ring-1 ring-rose-500/40",
};

interface ScoreBadgeProps {
  score: number;
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  const tier = getScoreTier(score);

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg px-4 py-2 ${TIER_STYLES[tier]}`}
      aria-label={`Overall accountability score: ${score} out of 100`}
    >
      <span className="text-2xl font-semibold leading-none tabular-nums">
        {score}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wider opacity-80">
        / 100
      </span>
    </div>
  );
}
