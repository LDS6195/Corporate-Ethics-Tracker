import type { CategoryScores } from "@/types/company";

/** Maximum possible points for each sub-category, per the data contract. */
export const CATEGORY_MAX: Record<keyof CategoryScores, number> = {
  laborDisplacement: 30,
  dataPrivacy: 25,
  humanOversight: 25,
  transparency: 20,
};

/** Human-readable label + methodology explanation for each sub-category, used in tooltips. */
export const CATEGORY_INFO: Record<
  keyof CategoryScores,
  { label: string; description: string }
> = {
  laborDisplacement: {
    label: "Labor Displacement",
    description:
      "Measures whether AI/automation has driven confirmed workforce reductions. Higher scores mean fewer (or no) AI-attributed layoffs or WARN notices, and stronger reskilling/transition support for affected workers.",
  },
  dataPrivacy: {
    label: "Data Privacy",
    description:
      "Measures how responsibly a company collects, uses, and trains AI on personal data. Higher scores mean fewer confirmed privacy violations (e.g. regulatory fines), clearer opt-outs, and stronger data protection commitments.",
  },
  humanOversight: {
    label: "Human Oversight",
    description:
      "Measures whether high-stakes AI decisions require human review before acting. Higher scores mean documented human-in-the-loop mandates, especially for autonomous/agentic AI systems.",
  },
  transparency: {
    label: "Transparency",
    description:
      "Measures how openly a company discloses its AI policies, risks, and governance to the public and regulators. Higher scores mean more detailed, verifiable public disclosure.",
  },
};

/** Explains how the overall composite score is derived, for tooltips. */
export const OVERALL_SCORE_DESCRIPTION =
  "Composite accountability score out of 100. A higher score means the company has stronger verified evidence of responsible A.I. practices across labor impact, data privacy, human oversight, and transparency. No company currently scores above 86 — the ceiling reflects gaps in public disclosure, not a scoring flaw.";

/** Neutral baseline: a company with no violations and no positive AI commitments scores 50. */
export const BASELINE_OFFSET = 4;

/** User-adjustable importance weights, one per sub-category. */
export type CategoryWeights = Record<keyof CategoryScores, number>;

/** Default weights mirror each category's natural max, reproducing `overallScore` unchanged. */
export const DEFAULT_WEIGHTS: CategoryWeights = {
  laborDisplacement: CATEGORY_MAX.laborDisplacement,
  dataPrivacy: CATEGORY_MAX.dataPrivacy,
  humanOversight: CATEGORY_MAX.humanOversight,
  transparency: CATEGORY_MAX.transparency,
};

/**
 * Recomputes a 0-100 composite score from raw category scores using
 * user-supplied weights. Weights are normalized to sum to 100 so the
 * result always stays on a comparable 0-100 scale.
 */
export function computeWeightedScore(
  scores: CategoryScores,
  weights: CategoryWeights
): number {
  const totalWeight =
    weights.laborDisplacement +
    weights.dataPrivacy +
    weights.humanOversight +
    weights.transparency;

  if (totalWeight <= 0) return 0;

  const categories = Object.keys(CATEGORY_MAX) as (keyof CategoryScores)[];

  const weighted = categories.reduce((sum, key) => {
    const normalizedWeight = (weights[key] / totalWeight) * 100;
    const ratio = scores[key] / CATEGORY_MAX[key];
    return sum + ratio * normalizedWeight;
  }, 0);

  return Math.min(100, Math.round(weighted) + BASELINE_OFFSET);
}

export type ScoreTier = "high" | "medium" | "low";

export function getScoreTier(score: number): ScoreTier {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}
