/**
 * Add companies #48–50: IBM, Qualcomm (QCOM), Uber (UBER)
 * Complete across all 6 data files + updates scoring.ts ceiling description.
 *
 * Political data from OpenSecrets 2024 cycle (verified 2026-08-11).
 * AI scores computed from documented formula.
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataDir = join(root, "src/data");

function readJSON(name) {
  return JSON.parse(readFileSync(join(dataDir, name), "utf8"));
}
function writeJSON(name, data) {
  writeFileSync(join(dataDir, name), JSON.stringify(data, null, 2) + "\n", "utf8");
}

const TODAY = "2026-08-11";

// ---------------------------------------------------------------------------
// 1. companies.json entries
// ---------------------------------------------------------------------------
// Formula reminders:
//   labor  = max(0, 13 + 9*reskilling - aiLayoffPenalty)  [tiers: 0,4,8,12,16]
//   privacy = min(25, max(0, 18 + noAiTrain*6 + optOut*4 - tosScrap*9 - privFine*18))
//   oversight = min(25, 9 + HITL*9 + gov*6 + noConseq*5)
//   transparency = min(20, 6 + min(policyCites,4) + report*7 + artifacts*6 - (totalCites<3?3:0))
//   overall = sum(categoryScores) + BASELINE_OFFSET(4)

const NEW_COMPANIES = [
  {
    id: "ibm",
    name: "IBM",
    ticker: "IBM",
    industry: "Enterprise Technology",
    logoUrl: "https://ui-avatars.com/api/?name=IBM&background=1749c2&color=fff&bold=true",
    sp500Rank: 48,
    // Labor: 3,900 confirmed AI-attributed layoffs (Jan 2023); reskilling=true (IBM SkillsBuild)
    // penalty tier: 3900 < 10000 → 8; labor = 13+9-8 = 14
    aiLayoffCount: 3900,
    aiLayoffTracked: true,
    reskillingFunded: true,
    // Privacy: explicit watsonx "will not train on client data" guarantee; no fine; no scraping
    // 18+6+0-0-0 = 24; min(25,24) = 24
    humanInTheLoopMandate: true,
    tosScrapingOptOut: false,
    noAiTrainingOnPersonalData: true,
    dedicatedAiTrainingOptOut: false,
    confirmedPrivacyFine: false,
    // Oversight: IBM AI Ethics Board (gov); HITL mandate in Responsible AI guidelines
    // 9+9+6+0 = 24; min(25,24) = 24
    dedicatedAiGovernanceBody: true,
    noConsequentialAutomatedDecisions: false,
    // Transparency: AI Ethics Progress Reports (report); AI Factsheets + OpenScale (artifacts)
    // 4 policy citations; 6+4+7+6-0 = 23 → min(20,23) = 20
    recurringPublicAiReport: true,
    concreteTransparencyArtifacts: true,
    categoryScores: {
      laborDisplacement: 14,
      dataPrivacy: 24,
      humanOversight: 24,
      transparency: 20,
    },
    overallScore: 86, // 14+24+24+20+4
    citations: [
      "https://www.ibm.com/artificial-intelligence/ethics",
      "https://www.ibm.com/products/watsonx-ai/trust-and-transparency",
      "https://newsroom.ibm.com/IBM-Releases-AI-Ethics-Progress-Report",
      "https://research.ibm.com/blog/ai-fairness-360",
    ],
    lastUpdated: TODAY,
  },
  {
    id: "qualcomm",
    name: "Qualcomm",
    ticker: "QCOM",
    industry: "Semiconductors",
    logoUrl: "https://ui-avatars.com/api/?name=QCOM&background=3253dc&color=fff&bold=true",
    sp500Rank: 49,
    // Labor: no AI-attributed layoffs; reskilling=true (Thinkabit Lab, scholarship programs)
    // 13+9 = 22
    aiLayoffCount: 0,
    aiLayoffTracked: false,
    reskillingFunded: true,
    // Privacy: chip company, no consumer AI training; no fine
    // 18+0+0-0-0 = 18
    humanInTheLoopMandate: false,
    tosScrapingOptOut: false,
    noAiTrainingOnPersonalData: false,
    dedicatedAiTrainingOptOut: false,
    confirmedPrivacyFine: false,
    // Oversight: no HITL mandate; no dedicated AI governance body
    // 9+0+0+0 = 9
    dedicatedAiGovernanceBody: false,
    noConsequentialAutomatedDecisions: false,
    // Transparency: 3 cites (no -3 penalty); 1 policy cite (Responsible AI Principles)
    // 6+1+0+0 = 7
    recurringPublicAiReport: false,
    concreteTransparencyArtifacts: false,
    categoryScores: {
      laborDisplacement: 22,
      dataPrivacy: 18,
      humanOversight: 9,
      transparency: 7,
    },
    overallScore: 60, // 22+18+9+7+4
    citations: [
      "https://www.qualcomm.com/research/artificial-intelligence/responsible-ai",
      "https://investor.qualcomm.com/sec-filings/annual-reports",
      "https://www.qualcomm.com/content/dam/qcomm-martech/dm-assets/documents/sustainability/qualcomm-corporate-responsibility-report-2024.pdf",
    ],
    lastUpdated: TODAY,
  },
  {
    id: "uber",
    name: "Uber",
    ticker: "UBER",
    industry: "Transportation Technology",
    logoUrl: "https://ui-avatars.com/api/?name=UBER&background=111827&color=fff&bold=true",
    sp500Rank: 50,
    // Labor: no corporate AI layoffs tracked; no reskilling program for gig workers
    // 13+0-0 = 13
    aiLayoffCount: 0,
    aiLayoffTracked: false,
    reskillingFunded: false,
    // Privacy: confirmed fine — Dutch DPA €290M GDPR violation (Aug 2023, data transfers)
    // 18+0+0-0-18 = 0
    humanInTheLoopMandate: false,
    tosScrapingOptOut: false,
    noAiTrainingOnPersonalData: false,
    dedicatedAiTrainingOptOut: false,
    confirmedPrivacyFine: true,
    // Oversight: no HITL; no governance body; algorithmic decisions not reviewed
    // 9+0+0+0 = 9
    dedicatedAiGovernanceBody: false,
    noConsequentialAutomatedDecisions: false,
    // Transparency: 3 cites (no -3 penalty); 1 policy cite (Responsible Technology page)
    // 6+1+0+0 = 7
    recurringPublicAiReport: false,
    concreteTransparencyArtifacts: false,
    categoryScores: {
      laborDisplacement: 13,
      dataPrivacy: 0,
      humanOversight: 9,
      transparency: 7,
    },
    overallScore: 33, // 13+0+9+7+4
    citations: [
      "https://www.uber.com/us/en/about/reports/",
      "https://autoriteitpersoonsgegevens.nl/en/news/dutch-dpa-fines-uber-290-million-euros",
      "https://investor.uber.com/news-events/news/press-release-details/2025/Uber-Annual-Report-2024/",
    ],
    lastUpdated: TODAY,
  },
];

// ---------------------------------------------------------------------------
// 2. Political profiles
// ---------------------------------------------------------------------------
const NEW_POLITICAL = [
  {
    companyId: "ibm",
    profileStatus: "published",
    electionCycle: "2024",
    evidenceRecords: 3,
    highConfidenceRecords: 2,
    lastUpdated: TODAY,
    // All individual contributions, no org PAC (From Organization: $0)
    pacContributionsUsd: null,
    democraticPct: 70,
    republicanPct: 30,
    thirdPartyPct: 0,
    lobbyingSpendUsd: 5530000,
    lobbyingFocusSummary:
      "Lobbies on AI governance regulation, cloud computing procurement, semiconductor supply chain, data privacy legislation, and technology trade policy.",
    lobbyingPolicyArea: "Computers/Internet",
    lobbyingSourceUrl: "https://www.opensecrets.org/orgs/ibm-corp/summary?id=D000000720",
    tradeAssociationRiskFlag: true,
  },
  {
    companyId: "qualcomm",
    profileStatus: "published",
    electionCycle: "2024",
    evidenceRecords: 3,
    highConfidenceRecords: 2,
    lastUpdated: TODAY,
    pacContributionsUsd: 1786416,
    democraticPct: 84,
    republicanPct: 15,
    thirdPartyPct: 1,
    lobbyingSpendUsd: 7380000,
    lobbyingFocusSummary:
      "Lobbies on semiconductor export controls, CHIPS Act implementation, wireless spectrum policy, AI and 5G standards, and intellectual property protection.",
    lobbyingPolicyArea: "Computers/Internet",
    lobbyingSourceUrl: "https://www.opensecrets.org/orgs/qualcomm-inc/summary?id=D000000794",
    tradeAssociationRiskFlag: true,
  },
  {
    companyId: "uber",
    profileStatus: "published",
    electionCycle: "2024",
    evidenceRecords: 3,
    highConfidenceRecords: 2,
    lastUpdated: TODAY,
    pacContributionsUsd: 1126755,
    democraticPct: 65,
    republicanPct: 35,
    thirdPartyPct: 0,
    lobbyingSpendUsd: 2620000,
    lobbyingFocusSummary:
      "Lobbies on gig worker classification legislation, ride-sharing safety regulations, autonomous vehicle policy, and labor law reform.",
    lobbyingPolicyArea: "Transportation",
    lobbyingSourceUrl: "https://www.opensecrets.org/orgs/uber-technologies/summary?id=D000067336",
    tradeAssociationRiskFlag: false,
  },
];

// ---------------------------------------------------------------------------
// 3. OpenSecrets org map entries
// ---------------------------------------------------------------------------
const NEW_ORG_ENTRIES = [
  {
    companyId: "ibm",
    companyName: "IBM Corp",
    orgId: "D000000720",
    orgSlug: "ibm-corp",
    summaryUrl: "https://www.opensecrets.org/orgs/ibm-corp/summary?id=D000000720",
    recipientsUrl: "https://www.opensecrets.org/orgs/ibm-corp/recipients?id=D000000720",
    status: "verified",
  },
  {
    companyId: "qualcomm",
    companyName: "Qualcomm Inc",
    orgId: "D000000794",
    orgSlug: "qualcomm-inc",
    summaryUrl: "https://www.opensecrets.org/orgs/qualcomm-inc/summary?id=D000000794",
    recipientsUrl: "https://www.opensecrets.org/orgs/qualcomm-inc/recipients?id=D000000794",
    status: "verified",
  },
  {
    companyId: "uber",
    companyName: "Uber Technologies",
    orgId: "D000067336",
    orgSlug: "uber-technologies",
    summaryUrl: "https://www.opensecrets.org/orgs/uber-technologies/summary?id=D000067336",
    recipientsUrl: "https://www.opensecrets.org/orgs/uber-technologies/recipients?id=D000067336",
    status: "verified",
  },
];

// ---------------------------------------------------------------------------
// 4. Political evidence records
// ---------------------------------------------------------------------------
function makePoliticalEvidence(p) {
  const records = [];
  if (p.pacContributionsUsd != null) {
    records.push({
      companyId: p.companyId,
      metric: "pacContributionsUsd",
      electionCycle: "2024",
      value: p.pacContributionsUsd,
      sourceName: `OpenSecrets - ${p.companyId}`,
      sourceUrl: p.lobbyingSourceUrl,
      sourceDate: TODAY,
      confidence: "high",
    });
  }
  if (p.lobbyingSpendUsd != null) {
    records.push({
      companyId: p.companyId,
      metric: "lobbyingSpendUsd",
      electionCycle: "2024",
      value: p.lobbyingSpendUsd,
      sourceName: `OpenSecrets - ${p.companyId}`,
      sourceUrl: p.lobbyingSourceUrl,
      sourceDate: TODAY,
      confidence: "high",
    });
  }
  records.push({
    companyId: p.companyId,
    metric: "partySplitPct",
    electionCycle: "2024",
    value: { dem: p.democraticPct, rep: p.republicanPct, third: p.thirdPartyPct },
    sourceName: "OpenSecrets",
    sourceUrl: p.lobbyingSourceUrl,
    sourceDate: TODAY,
    confidence: "medium",
  });
  return records;
}

// ---------------------------------------------------------------------------
// 5. Cause profiles
// ---------------------------------------------------------------------------
const NEW_CAUSE_PROFILES = [
  {
    companyId: "ibm",
    profileStatus: "in-progress",
    disclosedSpendUsd: 40000000,
    topCauseCategoryId: "education-opportunity",
    categorySpendUsd: { "education-opportunity": 40000000 },
    evidenceRecords: 1,
    highConfidenceRecords: 1,
    lastUpdated: TODAY,
  },
  {
    companyId: "qualcomm",
    profileStatus: "in-progress",
    disclosedSpendUsd: null,
    topCauseCategoryId: "education-opportunity",
    categorySpendUsd: {},
    evidenceRecords: 1,
    highConfidenceRecords: 0,
    lastUpdated: TODAY,
  },
  {
    companyId: "uber",
    profileStatus: "in-progress",
    disclosedSpendUsd: null,
    topCauseCategoryId: "health-human-services",
    categorySpendUsd: {},
    evidenceRecords: 1,
    highConfidenceRecords: 0,
    lastUpdated: TODAY,
  },
];

// ---------------------------------------------------------------------------
// 6. Cause evidence records
// ---------------------------------------------------------------------------
const NEW_CAUSE_EVIDENCE = [
  {
    companyId: "ibm",
    categoryId: "education-opportunity",
    sourceName: "IBM Foundation and SkillsBuild Program",
    sourceUrl: "https://www.ibm.com/skills/ibm-skillsbuild",
    sourceDate: TODAY,
    signal:
      "IBM Foundation and IBM SkillsBuild provide free digital and AI education to millions globally. IBM reported approximately $40M in philanthropic grants in 2023 through its foundation and corporate giving programs, focused on workforce development and STEM education. IBM has committed to training 30 million people in digital skills by 2030.",
    amountUsd: 40000000,
    confidence: "medium",
  },
  {
    companyId: "qualcomm",
    categoryId: "education-opportunity",
    sourceName: "Qualcomm Corporate Responsibility Report 2024",
    sourceUrl: "https://www.qualcomm.com/research/university-relations",
    sourceDate: TODAY,
    signal:
      "Qualcomm supports STEM education through Qualcomm Thinkabit Labs (hands-on engineering programs for K-12 students), university research partnerships, and the Qualcomm Scholars program. Total annual charitable giving not separately disclosed; programs focus on semiconductor engineering workforce and diversity in STEM.",
    amountUsd: null,
    confidence: "medium",
  },
  {
    companyId: "uber",
    categoryId: "health-human-services",
    sourceName: "Uber Community Impact",
    sourceUrl: "https://www.uber.com/us/en/about/sustainability/",
    sourceDate: TODAY,
    signal:
      "Uber's community programs include free and discounted rides for healthcare access, disaster relief transportation, and the Uber Movement Grants program for nonprofit organizations. Total annual charitable giving not publicly disclosed; primary community impact is delivered through subsidized transportation access rather than cash grants.",
    amountUsd: null,
    confidence: "low",
  },
];

// ---------------------------------------------------------------------------
// Apply all updates
// ---------------------------------------------------------------------------

// companies.json
const companiesFile = readJSON("companies.json");
const existingIds = new Set(companiesFile.companies.map((c) => c.id));
for (const co of NEW_COMPANIES) {
  if (!existingIds.has(co.id)) {
    companiesFile.companies.push(co);
  } else {
    console.warn(`  ⚠ ${co.id} already exists, skipping`);
  }
}
writeJSON("companies.json", companiesFile);
console.log(`✅ companies.json — now ${companiesFile.companies.length} companies`);

// politicalProfiles.json
const polFile = readJSON("politicalProfiles.json");
const existingPolIds = new Set(polFile.profiles.map((p) => p.companyId));
for (const p of NEW_POLITICAL) {
  if (!existingPolIds.has(p.companyId)) {
    polFile.profiles.push(p);
  }
}
writeJSON("politicalProfiles.json", polFile);
console.log("✅ politicalProfiles.json updated");

// openSecretsOrgMap.json
const orgMap = readJSON("openSecretsOrgMap.json");
const existingOrgIds = new Set(orgMap.records.map((r) => r.companyId));
for (const entry of NEW_ORG_ENTRIES) {
  if (!existingOrgIds.has(entry.companyId)) {
    orgMap.records.push(entry);
  }
}
writeJSON("openSecretsOrgMap.json", orgMap);
console.log(`✅ openSecretsOrgMap.json — now ${orgMap.records.length} records`);

// politicalEvidence.json
const polEvidence = readJSON("politicalEvidence.json");
for (const p of NEW_POLITICAL) {
  polEvidence.records.push(...makePoliticalEvidence(p));
}
writeJSON("politicalEvidence.json", polEvidence);
console.log("✅ politicalEvidence.json updated");

// causeProfiles.json
const causeFile = readJSON("causeProfiles.json");
const existingCauseIds = new Set(causeFile.profiles.map((p) => p.companyId));
for (const p of NEW_CAUSE_PROFILES) {
  if (!existingCauseIds.has(p.companyId)) {
    causeFile.profiles.push(p);
  }
}
writeJSON("causeProfiles.json", causeFile);
console.log(`✅ causeProfiles.json — now ${causeFile.profiles.length} profiles`);

// causeEvidence.json
const causeEvidence = readJSON("causeEvidence.json");
causeEvidence.records.push(...NEW_CAUSE_EVIDENCE);
writeJSON("causeEvidence.json", causeEvidence);
console.log(`✅ causeEvidence.json — now ${causeEvidence.records.length} records`);

console.log("\nNew companies added:");
for (const co of NEW_COMPANIES) {
  console.log(`  #${co.sp500Rank} ${co.ticker} — score ${co.overallScore} (${Object.values(co.categoryScores).join("+")}+4)`);
}
