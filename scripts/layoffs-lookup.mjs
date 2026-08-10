/**
 * Correct layoffs.fyi lookup helpers.
 * Import this in any migration script before computing aiLayoffCount.
 *
 * Usage:
 *   import { lookupLayoffs } from "./layoffs-lookup.mjs";
 *   const { coTotal, coLatest, aiEmp, aiEvents, isInAiTracker } = lookupLayoffs("Dell");
 */
import { readFileSync } from "node:fs";

let _co = null;
let _ai = null;

function load() {
  if (!_co) {
    // layoffs_companies_list.json is an object with numeric keys — use Object.values()
    const raw = JSON.parse(readFileSync("./layoffs_companies_list.json", "utf8"));
    _co = {};
    Object.values(raw).forEach(e => { if (e?.name) _co[e.name.toLowerCase()] = e; });
  }
  if (!_ai) {
    // ai.companies is the top-N array — NOT Object.keys(ai)
    const raw = JSON.parse(readFileSync("./layoffs_ai_stats.json", "utf8"));
    _ai = {};
    (raw.companies || []).forEach(e => { if (e?.company) _ai[e.company.toLowerCase()] = e; });
  }
}

/**
 * Look up a company by any of the names it might appear under.
 * Pass multiple aliases to handle inconsistent naming.
 * Example: lookupLayoffs("Dell Technologies", "Dell")
 */
export function lookupLayoffs(...names) {
  load();
  for (const name of names) {
    const key = name.toLowerCase();
    const coEntry = _co[key];
    const aiEntry = _ai[key];
    if (coEntry || aiEntry) {
      return {
        coTotal:       coEntry?.total  ?? null,
        coLatest:      coEntry?.latest ?? null,
        coIndustry:    coEntry?.industry ?? null,
        coSlug:        coEntry?.slug   ?? null,
        aiEmp:         aiEntry?.ai_emp ?? 0,
        aiEvents:      aiEntry?.events ?? 0,
        isInAiTracker: !!aiEntry,
        matchedName:   coEntry?.name ?? null,
      };
    }
  }
  return { coTotal: null, coLatest: null, coIndustry: null, coSlug: null,
           aiEmp: 0, aiEvents: 0, isInAiTracker: false, matchedName: null };
}

/** Quick console dump for verifying before writing a migration script. */
export function printLookup(companyId, ...names) {
  const r = lookupLayoffs(...names);
  console.log(`[${companyId}] co_total=${r.coTotal}, ai_emp=${r.aiEmp}, ai_events=${r.aiEvents}, in_tracker=${r.isInAiTracker}`);
  return r;
}
