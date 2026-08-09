"use client";

import { useState } from "react";
import type { CategoryWeights } from "@/lib/scoring";

interface WeightSlidersProps {
  weights: CategoryWeights;
  onChange: (weights: CategoryWeights) => void;
  onReset: () => void;
}

// Slider range is independent of each category's intrinsic score max so any
// category can be weighted higher or lower than its default importance.
// The four weights share a fixed 100-point budget and can never sum above it.
const SLIDER_MAX = 100;
const TOTAL_WEIGHT_BUDGET = 100;

const SLIDER_CONFIG: { key: keyof CategoryWeights; label: string }[] = [
  { key: "laborDisplacement", label: "Labor" },
  { key: "dataPrivacy", label: "Data Rights" },
  { key: "humanOversight", label: "Human Oversight" },
  { key: "transparency", label: "Transparency" },
];

export default function WeightSliders({
  weights,
  onChange,
  onReset,
}: WeightSlidersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);

  const handleChange = (key: keyof CategoryWeights, value: number) => {
    const othersTotal = total - weights[key];
    const clampedValue = Math.min(
      value,
      Math.max(0, TOTAL_WEIGHT_BUDGET - othersTotal)
    );
    onChange({ ...weights, [key]: clampedValue });
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
          className="flex items-center gap-2 text-left"
        >
          <span
            aria-hidden="true"
            className={`inline-flex text-neutral-500 transition-transform ${
              isExpanded ? "rotate-90" : "rotate-0"
            }`}
          >
            <svg
              viewBox="0 0 12 12"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 2.5 8 6 4 9.5" />
            </svg>
          </span>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-300">
            Weight Customizer
          </h2>
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs tabular-nums text-neutral-500">
            Total: <span className="text-neutral-300">{total}</span> /{" "}
            {TOTAL_WEIGHT_BUDGET}
          </span>
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-sky-400 hover:text-sky-300 hover:underline"
          >
            Reset to default
          </button>
        </div>
      </div>
      {isExpanded ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SLIDER_CONFIG.map(({ key, label }) => (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-400">
                <label htmlFor={`weight-${key}`}>{label}</label>
                <span className="tabular-nums text-neutral-300">
                  {weights[key]}
                </span>
              </div>
              <input
                id={`weight-${key}`}
                type="range"
                min={0}
                max={SLIDER_MAX}
                value={weights[key]}
                onChange={(e) => handleChange(key, Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-500">
          Expand to adjust how strongly labor, data rights, human oversight, and transparency affect the displayed score.
        </p>
      )}
    </div>
  );
}
