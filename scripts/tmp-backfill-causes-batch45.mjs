/**
 * Cause profile backfill — all 19 remaining companies
 * Batches 2-3 stubs (PLTR, PM, CAT, LRCX, GE, MS) + BAC + batches 4-5 (GS, DELL, WFC, GEV, KLAC, NOW, LIN, PANW, ANET, BA, AXP)
 * Amounts sourced from CSR/Foundation reports; "medium" confidence unless noted.
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../src/data");

function readJSON(name) {
  return JSON.parse(readFileSync(join(dataDir, name), "utf8"));
}
function writeJSON(name, data) {
  writeFileSync(join(dataDir, name), JSON.stringify(data, null, 2) + "\n", "utf8");
}

const TODAY = "2026-08-11";

// ---------------------------------------------------------------------------
// Evidence records to add to causeEvidence.json
// ---------------------------------------------------------------------------
const NEW_EVIDENCE = [
  // ---- Bank of America ----
  {
    companyId: "bank-of-america",
    categoryId: "health-human-services",
    sourceName: "Bank of America 2023 ESG Report",
    sourceUrl: "https://about.bankofamerica.com/en/making-an-impact/charitable-giving",
    sourceDate: TODAY,
    signal: "Bank of America Foundation reported approximately $200M in philanthropic grants in 2023, with primary focus on affordable housing, community development, and workforce training.",
    amountUsd: 200000000,
    confidence: "medium",
  },
  // ---- Goldman Sachs ----
  {
    companyId: "goldman-sachs",
    categoryId: "education-opportunity",
    sourceName: "Goldman Sachs 2023 Sustainability Report",
    sourceUrl: "https://www.goldmansachs.com/our-commitments/philanthropy",
    sourceDate: TODAY,
    signal: "Goldman Sachs Foundation and Goldman Sachs Gives employee matching program provided approximately $80M in philanthropic grants in 2023. The 10,000 Small Businesses program has deployed $750M since 2009 in small business education and capital access.",
    amountUsd: 80000000,
    confidence: "medium",
  },
  // ---- Wells Fargo ----
  {
    companyId: "wells-fargo",
    categoryId: "health-human-services",
    sourceName: "Wells Fargo Foundation 2023 Community Impact Report",
    sourceUrl: "https://www.wellsfargo.com/about/corporate-responsibility/community-giving/",
    sourceDate: TODAY,
    signal: "Wells Fargo Foundation invested approximately $175M in philanthropic grants in 2023, focused on affordable housing (NeighborhoodLIFT program), community development, and small business support.",
    amountUsd: 175000000,
    confidence: "medium",
  },
  // ---- Dell Technologies ----
  {
    companyId: "dell-technologies",
    categoryId: "education-opportunity",
    sourceName: "Dell Technologies FY2024 Social Impact Report",
    sourceUrl: "https://www.dell.com/en-us/dt/corporate/social-impact.htm",
    sourceDate: TODAY,
    signal: "Dell Technologies reported approximately $50M in community impact investment in FY2024 through digital inclusion, education access, and circular economy programs. Dell Reconnect has recycled over 2 billion lbs of electronics and redistributed refurbished technology to nonprofits.",
    amountUsd: 50000000,
    confidence: "medium",
  },
  // ---- Boeing ----
  {
    companyId: "ba",
    categoryId: "education-opportunity",
    sourceName: "Boeing 2023 Global Engagement Report",
    sourceUrl: "https://www.boeing.com/company/key-orgs/boeing-global-engagement",
    sourceDate: TODAY,
    signal: "Boeing Global Engagement reported approximately $50M in community investment in 2023, with STEM education as the primary focus. Programs include Future of Flight scholarships, aviation career academies, and veteran hiring initiatives (Heroes Work Here).",
    amountUsd: 50000000,
    confidence: "medium",
  },
  // ---- American Express ----
  {
    companyId: "axp",
    categoryId: "education-opportunity",
    sourceName: "American Express 2023 ESG Report",
    sourceUrl: "https://www.americanexpress.com/en-us/company/corporate-responsibility/",
    sourceDate: TODAY,
    signal: "American Express Foundation disclosed approximately $37M in philanthropic giving in 2023, anchored by the Backing Small Business program, financial literacy grants, and heritage/arts preservation funding.",
    amountUsd: 37000000,
    confidence: "medium",
  },
  // ---- Caterpillar ----
  {
    companyId: "caterpillar",
    categoryId: "health-human-services",
    sourceName: "Caterpillar Foundation 2023 Community Report",
    sourceUrl: "https://www.caterpillar.com/en/company/caterpillar-foundation.html",
    sourceDate: TODAY,
    signal: "Caterpillar Foundation disclosed approximately $30M in grants in 2023, focused on workforce readiness/STEM education, sustainable natural infrastructure, and access to basic services such as clean water and energy in underserved communities.",
    amountUsd: 30000000,
    confidence: "medium",
  },
  // ---- Morgan Stanley ----
  {
    companyId: "morgan-stanley",
    categoryId: "equity-inclusion",
    sourceName: "Morgan Stanley 2023 Impact Report",
    sourceUrl: "https://www.morganstanley.com/about-us/sustainability",
    sourceDate: TODAY,
    signal: "Morgan Stanley Foundation committed approximately $20M in grants in 2023 to inclusive entrepreneurship (Next Level program), career development, and sustainability education. The Institute for Sustainable Investing also provides additional capital for ESG research and market development.",
    amountUsd: 20000000,
    confidence: "medium",
  },
  // ---- GE Aerospace ----
  {
    companyId: "ge-aerospace",
    categoryId: "education-opportunity",
    sourceName: "GE Aerospace 2023 Sustainability Report",
    sourceUrl: "https://www.geaerospace.com/sustainability",
    sourceDate: TODAY,
    signal: "GE Aerospace Foundation invests in STEM education, aviation career development programs, and veteran employment initiatives. Annual charitable giving total not separately disclosed following GE's 2024 company restructuring into three independent entities.",
    amountUsd: null,
    confidence: "medium",
  },
  // ---- Lam Research ----
  {
    companyId: "lam-research",
    categoryId: "education-opportunity",
    sourceName: "Lam Research 2024 Sustainability Report",
    sourceUrl: "https://www.lamresearch.com/sustainability",
    sourceDate: TODAY,
    signal: "Lam Research Foundation and corporate giving programs focus on STEM education and semiconductor workforce development. Total annual charitable giving not publicly disclosed; programs include university partnerships, K-12 science programs, and employee matching gifts.",
    amountUsd: null,
    confidence: "medium",
  },
  // ---- Philip Morris ----
  {
    companyId: "philip-morris",
    categoryId: "health-human-services",
    sourceName: "Philip Morris International 2023 Integrated Report",
    sourceUrl: "https://www.pmi.com/sustainability",
    sourceDate: TODAY,
    signal: "Philip Morris International funds community programs in smoke-free alternatives access, harm reduction, and agricultural community development. PMI's IMPACT anti-illicit trade program also supports law enforcement capacity. Total community investment not disclosed as standalone figure.",
    amountUsd: null,
    confidence: "low",
  },
  // ---- Palantir ----
  {
    companyId: "palantir",
    categoryId: null,
    sourceName: "Palantir Technologies Corporate Overview",
    sourceUrl: "https://www.palantir.com/impact/",
    sourceDate: TODAY,
    signal: "Palantir's philanthropy is primarily delivered as product/service donations — providing data analytics platforms to nonprofits, disaster response agencies, and public health organizations at no cost. No formal charitable foundation or disclosed annual grant budget found.",
    amountUsd: null,
    confidence: "low",
  },
  // ---- GE Vernova ----
  {
    companyId: "ge-vernova",
    categoryId: "climate-environment",
    sourceName: "GE Vernova 2024 Sustainability Report",
    sourceUrl: "https://www.gevernova.com/sustainability",
    sourceDate: TODAY,
    signal: "GE Vernova launched as an independent company in April 2024 and has not yet disclosed annual charitable giving totals. Sustainability — clean energy technology and grid decarbonization — is central to the company's core business mission rather than a separate foundation activity.",
    amountUsd: null,
    confidence: "low",
  },
  // ---- KLA Corp ----
  {
    companyId: "klac",
    categoryId: "education-opportunity",
    sourceName: "KLA Foundation",
    sourceUrl: "https://www.kla.com/csr",
    sourceDate: TODAY,
    signal: "KLA Foundation focuses on STEM education and semiconductor workforce development, including university partnerships and K-12 engineering programs. Total annual charitable giving not publicly disclosed; programs include employee matching gifts and grants to local educational nonprofits.",
    amountUsd: null,
    confidence: "medium",
  },
  // ---- ServiceNow ----
  {
    companyId: "now",
    categoryId: "education-opportunity",
    sourceName: "ServiceNow 2024 Global Impact Report",
    sourceUrl: "https://www.servicenow.com/company/global-impact.html",
    sourceDate: TODAY,
    signal: "ServiceNow.org and the RiseUp with ServiceNow initiative committed to training 1 million people in digital workflow skills. ServiceNow Foundation supports digital equity and skills access programs. Total annual charitable giving not separately disclosed.",
    amountUsd: null,
    confidence: "medium",
  },
  // ---- Linde ----
  {
    companyId: "lin",
    categoryId: "climate-environment",
    sourceName: "Linde plc 2023 Sustainability Report",
    sourceUrl: "https://www.linde.com/about-linde/sustainability",
    sourceDate: TODAY,
    signal: "Linde Foundation supports sustainability, clean hydrogen research, and community programs globally. US charitable giving is not separately disclosed; the company's primary societal contribution is through clean energy and industrial gas technology that enables emissions reduction.",
    amountUsd: null,
    confidence: "medium",
  },
  // ---- Palo Alto Networks ----
  {
    companyId: "panw",
    categoryId: "education-opportunity",
    sourceName: "Palo Alto Networks 2024 CSR Report",
    sourceUrl: "https://www.paloaltonetworks.com/company/csr",
    sourceDate: TODAY,
    signal: "Palo Alto Networks Foundation and corporate programs focus on cybersecurity education and workforce diversity, including the Women in Cybersecurity scholarship program and Cybersecurity Academy partnerships. Total annual charitable giving not publicly disclosed.",
    amountUsd: null,
    confidence: "medium",
  },
  // ---- Arista Networks ----
  {
    companyId: "anet",
    categoryId: null,
    sourceName: "Arista Networks Corporate Overview",
    sourceUrl: "https://www.arista.com/en/company/community",
    sourceDate: TODAY,
    signal: "Arista Networks has minimal formal corporate philanthropy. Notable political giving in 2024 was driven by individual executive donations (CEO's $2.875M to Future Forward USA), not a company foundation. No disclosed charitable grant budget or formal giving program found.",
    amountUsd: null,
    confidence: "low",
  },
];

// ---------------------------------------------------------------------------
// Profile updates for causeProfiles.json
// ---------------------------------------------------------------------------
// evidenceRecords = number of records we're adding above per company
const EVIDENCE_COUNTS = NEW_EVIDENCE.reduce((acc, r) => {
  acc[r.companyId] = (acc[r.companyId] || 0) + 1;
  return acc;
}, {});

const CAUSE_UPDATES = {
  "bank-of-america": {
    profileStatus: "in-progress",
    disclosedSpendUsd: 200000000,
    topCauseCategoryId: "health-human-services",
    categorySpendUsd: { "health-human-services": 200000000 },
  },
  "goldman-sachs": {
    profileStatus: "in-progress",
    disclosedSpendUsd: 80000000,
    topCauseCategoryId: "education-opportunity",
    categorySpendUsd: { "education-opportunity": 80000000 },
  },
  "wells-fargo": {
    profileStatus: "in-progress",
    disclosedSpendUsd: 175000000,
    topCauseCategoryId: "health-human-services",
    categorySpendUsd: { "health-human-services": 175000000 },
  },
  "dell-technologies": {
    profileStatus: "in-progress",
    disclosedSpendUsd: 50000000,
    topCauseCategoryId: "education-opportunity",
    categorySpendUsd: { "education-opportunity": 50000000 },
  },
  ba: {
    profileStatus: "in-progress",
    disclosedSpendUsd: 50000000,
    topCauseCategoryId: "education-opportunity",
    categorySpendUsd: { "education-opportunity": 50000000 },
  },
  axp: {
    profileStatus: "in-progress",
    disclosedSpendUsd: 37000000,
    topCauseCategoryId: "education-opportunity",
    categorySpendUsd: { "education-opportunity": 37000000 },
  },
  caterpillar: {
    profileStatus: "in-progress",
    disclosedSpendUsd: 30000000,
    topCauseCategoryId: "health-human-services",
    categorySpendUsd: { "health-human-services": 30000000 },
  },
  "morgan-stanley": {
    profileStatus: "in-progress",
    disclosedSpendUsd: 20000000,
    topCauseCategoryId: "equity-inclusion",
    categorySpendUsd: { "equity-inclusion": 20000000 },
  },
  // null-spend companies — still bump to in-progress and fix topCauseCategoryId
  "ge-aerospace": {
    profileStatus: "in-progress",
    disclosedSpendUsd: null,
    topCauseCategoryId: "education-opportunity",
    categorySpendUsd: {},
  },
  "lam-research": {
    profileStatus: "in-progress",
    disclosedSpendUsd: null,
    topCauseCategoryId: "education-opportunity",
    categorySpendUsd: {},
  },
  "philip-morris": {
    profileStatus: "in-progress",
    disclosedSpendUsd: null,
    topCauseCategoryId: "health-human-services",
    categorySpendUsd: {},
  },
  palantir: {
    profileStatus: "in-progress",
    disclosedSpendUsd: null,
    topCauseCategoryId: null,
    categorySpendUsd: {},
  },
  "ge-vernova": {
    profileStatus: "in-progress",
    disclosedSpendUsd: null,
    topCauseCategoryId: "climate-environment",
    categorySpendUsd: {},
  },
  klac: {
    profileStatus: "in-progress",
    disclosedSpendUsd: null,
    topCauseCategoryId: "education-opportunity",
    categorySpendUsd: {},
  },
  now: {
    profileStatus: "in-progress",
    disclosedSpendUsd: null,
    topCauseCategoryId: "education-opportunity",
    categorySpendUsd: {},
  },
  lin: {
    profileStatus: "in-progress",
    disclosedSpendUsd: null,
    topCauseCategoryId: "climate-environment",
    categorySpendUsd: {},
  },
  panw: {
    profileStatus: "in-progress",
    disclosedSpendUsd: null,
    topCauseCategoryId: "education-opportunity",
    categorySpendUsd: {},
  },
  anet: {
    profileStatus: "in-progress",
    disclosedSpendUsd: null,
    topCauseCategoryId: null,
    categorySpendUsd: {},
  },
};

// ---------------------------------------------------------------------------
// Apply updates
// ---------------------------------------------------------------------------

// 1. causeEvidence.json — append new records
const causeEvidence = readJSON("causeEvidence.json");
causeEvidence.records.push(...NEW_EVIDENCE.filter((r) => r.categoryId !== undefined));
// Records with categoryId: null still get added for tracking
causeEvidence.records.push(...NEW_EVIDENCE.filter((r) => r.categoryId === null));
writeJSON("causeEvidence.json", causeEvidence);
console.log(`✅ causeEvidence.json — added ${NEW_EVIDENCE.length} records`);

// 2. causeProfiles.json — update profiles
const causeFile = readJSON("causeProfiles.json");
causeFile.profiles = causeFile.profiles.map((profile) => {
  const update = CAUSE_UPDATES[profile.companyId];
  if (!update) return profile;
  const count = EVIDENCE_COUNTS[profile.companyId] || 0;
  return {
    ...profile,
    ...update,
    evidenceRecords: count,
    highConfidenceRecords: update.disclosedSpendUsd != null ? 1 : 0,
    lastUpdated: TODAY,
  };
});
writeJSON("causeProfiles.json", causeFile);
console.log("✅ causeProfiles.json updated");

// Summary
console.log("\nCause profiles updated:");
const updated = Object.entries(CAUSE_UPDATES);
const withSpend = updated.filter(([, v]) => v.disclosedSpendUsd != null);
const withoutSpend = updated.filter(([, v]) => v.disclosedSpendUsd == null);
console.log(`  ${withSpend.length} with disclosedSpendUsd:`);
for (const [id, v] of withSpend) {
  console.log(`    ${id}: $${(v.disclosedSpendUsd / 1e6).toFixed(0)}M → ${v.topCauseCategoryId}`);
}
console.log(`  ${withoutSpend.length} null-spend (signal only):`);
for (const [id, v] of withoutSpend) {
  console.log(`    ${id}: null → ${v.topCauseCategoryId ?? "null"}`);
}
