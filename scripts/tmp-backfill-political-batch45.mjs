/**
 * Political backfill — batches 4 & 5
 * GS, DELL, WFC, GEV, KLAC, NOW, LIN, PANW, ANET, BA, AXP
 * Data sourced from OpenSecrets.org (2024 election cycle), verified 2026-08-11.
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

// ---------------------------------------------------------------------------
// Source data
// ---------------------------------------------------------------------------

const POLITICAL_DATA = {
  "goldman-sachs": {
    companyId: "goldman-sachs",
    profileStatus: "published",
    electionCycle: "2024",
    evidenceRecords: 3,
    highConfidenceRecords: 2,
    lastUpdated: "2026-08-11",
    pacContributionsUsd: 3531408,
    democraticPct: 45,
    republicanPct: 55,
    thirdPartyPct: 0,
    lobbyingSpendUsd: 2740000,
    lobbyingFocusSummary:
      "Lobbies on financial services regulation, banking capital requirements, investment management rules, tax policy, and executive compensation standards.",
    lobbyingPolicyArea: "Finance/Credit Companies",
    lobbyingSourceUrl:
      "https://www.opensecrets.org/orgs/goldman-sachs/summary?id=d000000085",
    tradeAssociationRiskFlag: true,
  },
  "dell-technologies": {
    companyId: "dell-technologies",
    profileStatus: "published",
    electionCycle: "2024",
    evidenceRecords: 3,
    highConfidenceRecords: 2,
    lastUpdated: "2026-08-11",
    pacContributionsUsd: 2593063,
    democraticPct: 52,
    republicanPct: 48,
    thirdPartyPct: 0,
    lobbyingSpendUsd: 6340000,
    lobbyingFocusSummary:
      "Lobbies on technology procurement policy, cybersecurity standards, semiconductor supply chain, cloud computing regulation, and data privacy legislation.",
    lobbyingPolicyArea: "Computers/Internet",
    lobbyingSourceUrl:
      "https://www.opensecrets.org/orgs/dell-technologies/summary?id=D000000585",
    tradeAssociationRiskFlag: true,
  },
  "wells-fargo": {
    companyId: "wells-fargo",
    profileStatus: "published",
    electionCycle: "2024",
    evidenceRecords: 3,
    highConfidenceRecords: 2,
    lastUpdated: "2026-08-11",
    pacContributionsUsd: 4692633,
    democraticPct: 58,
    republicanPct: 42,
    thirdPartyPct: 0,
    lobbyingSpendUsd: 4550000,
    lobbyingFocusSummary:
      "Lobbies on banking capital requirements, consumer financial protection regulations, housing finance reform, and anti-money laundering compliance.",
    lobbyingPolicyArea: "Commercial Banks",
    lobbyingSourceUrl:
      "https://www.opensecrets.org/orgs/wells-fargo/summary?id=D000019743",
    tradeAssociationRiskFlag: true,
  },
  "ge-vernova": {
    companyId: "ge-vernova",
    profileStatus: "published",
    electionCycle: "2024",
    evidenceRecords: 3,
    highConfidenceRecords: 2,
    lastUpdated: "2026-08-11",
    pacContributionsUsd: 101621,
    democraticPct: 40,
    republicanPct: 58,
    thirdPartyPct: 2,
    lobbyingSpendUsd: 590000,
    lobbyingFocusSummary:
      "Lobbies on federal clean energy policy, grid modernization incentives, offshore wind permitting, and industrial emissions standards.",
    lobbyingPolicyArea: "Electric Utilities",
    lobbyingSourceUrl:
      "https://www.opensecrets.org/orgs/ge-vernova/summary?id=D000110360",
    tradeAssociationRiskFlag: true,
  },
  klac: {
    companyId: "klac",
    profileStatus: "published",
    electionCycle: "2024",
    evidenceRecords: 3,
    highConfidenceRecords: 2,
    lastUpdated: "2026-08-11",
    pacContributionsUsd: null,
    democraticPct: 85,
    republicanPct: 15,
    thirdPartyPct: 0,
    lobbyingSpendUsd: 1380000,
    lobbyingFocusSummary:
      "Lobbies on semiconductor manufacturing incentives under the CHIPS Act, export control policy for advanced equipment, and R&D tax credits.",
    lobbyingPolicyArea: "Electronics Manufacturing/Equipment",
    lobbyingSourceUrl:
      "https://www.opensecrets.org/orgs/kla-corp/summary?id=D000035133",
    tradeAssociationRiskFlag: false,
  },
  now: {
    companyId: "now",
    profileStatus: "published",
    electionCycle: "2024",
    evidenceRecords: 3,
    highConfidenceRecords: 2,
    lastUpdated: "2026-08-11",
    pacContributionsUsd: null,
    democraticPct: 75,
    republicanPct: 25,
    thirdPartyPct: 0,
    lobbyingSpendUsd: 1600000,
    lobbyingFocusSummary:
      "Lobbies on cloud computing procurement policy, AI governance frameworks, federal IT modernization, and cybersecurity standards.",
    lobbyingPolicyArea: "Computers/Internet",
    lobbyingSourceUrl:
      "https://www.opensecrets.org/orgs/servicenow/summary?id=D000073991",
    tradeAssociationRiskFlag: true,
  },
  lin: {
    companyId: "lin",
    profileStatus: "published",
    electionCycle: "2024",
    evidenceRecords: 3,
    highConfidenceRecords: 2,
    lastUpdated: "2026-08-11",
    pacContributionsUsd: 68156,
    democraticPct: 42,
    republicanPct: 55,
    thirdPartyPct: 3,
    lobbyingSpendUsd: 610000,
    lobbyingFocusSummary:
      "Lobbies on industrial gas regulations, chemical safety standards, clean hydrogen incentives, and carbon capture policy.",
    lobbyingPolicyArea: "Chemicals/Chemical Waste Management",
    lobbyingSourceUrl:
      "https://www.opensecrets.org/orgs/linde-plc/summary?id=D000071865",
    tradeAssociationRiskFlag: true,
  },
  panw: {
    companyId: "panw",
    profileStatus: "published",
    electionCycle: "2024",
    evidenceRecords: 3,
    highConfidenceRecords: 2,
    lastUpdated: "2026-08-11",
    pacContributionsUsd: null,
    democraticPct: 58,
    republicanPct: 42,
    thirdPartyPct: 0,
    lobbyingSpendUsd: 1820000,
    lobbyingFocusSummary:
      "Lobbies on federal cybersecurity standards, defense IT procurement, network security policy, and AI in national security.",
    lobbyingPolicyArea: "Computers/Internet",
    lobbyingSourceUrl:
      "https://www.opensecrets.org/orgs/palo-alto-networks/summary?id=D000070976",
    tradeAssociationRiskFlag: false,
  },
  anet: {
    companyId: "anet",
    profileStatus: "published",
    electionCycle: "2024",
    evidenceRecords: 3,
    highConfidenceRecords: 2,
    lastUpdated: "2026-08-11",
    // Individual contributions only — $4M driven by exec donations to liberal PACs; no org PAC
    pacContributionsUsd: null,
    democraticPct: 99,
    republicanPct: 1,
    thirdPartyPct: 0,
    lobbyingSpendUsd: null,
    lobbyingFocusSummary:
      "Minimal federal lobbying — primarily focused on networking technology standards and federal cloud and data center procurement when active.",
    lobbyingPolicyArea: "Computers/Internet",
    lobbyingSourceUrl:
      "https://www.opensecrets.org/orgs/arista-networks/summary?id=D000070423",
    tradeAssociationRiskFlag: false,
  },
  ba: {
    companyId: "ba",
    profileStatus: "published",
    electionCycle: "2024",
    evidenceRecords: 3,
    highConfidenceRecords: 2,
    lastUpdated: "2026-08-11",
    pacContributionsUsd: 5818876,
    democraticPct: 55,
    republicanPct: 45,
    thirdPartyPct: 0,
    lobbyingSpendUsd: 11930000,
    lobbyingFocusSummary:
      "Lobbies on defense procurement, commercial aviation safety regulations, FAA reauthorization, export controls, and research funding for sustainable aviation.",
    lobbyingPolicyArea: "Air Transport",
    lobbyingSourceUrl:
      "https://www.opensecrets.org/orgs/boeing-co/summary?id=D000000100",
    tradeAssociationRiskFlag: true,
  },
  axp: {
    companyId: "axp",
    profileStatus: "published",
    electionCycle: "2024",
    evidenceRecords: 3,
    highConfidenceRecords: 2,
    lastUpdated: "2026-08-11",
    pacContributionsUsd: 1743331,
    democraticPct: 68,
    republicanPct: 32,
    thirdPartyPct: 0,
    lobbyingSpendUsd: 1370000,
    lobbyingFocusSummary:
      "Lobbies on financial services regulatory reform, credit card interchange fees, digital payments regulation, and consumer financial protection rules.",
    lobbyingPolicyArea: "Finance/Credit Companies",
    lobbyingSourceUrl:
      "https://www.opensecrets.org/orgs/american-express/summary?id=D000000217",
    tradeAssociationRiskFlag: true,
  },
};

const ORG_MAP_ENTRIES = [
  {
    companyId: "goldman-sachs",
    companyName: "Goldman Sachs Group, Inc.",
    orgId: "d000000085",
    orgSlug: "goldman-sachs",
    summaryUrl: "https://www.opensecrets.org/orgs/goldman-sachs/summary?id=d000000085",
    recipientsUrl: "https://www.opensecrets.org/orgs/goldman-sachs/recipients?id=d000000085",
    status: "verified",
  },
  {
    companyId: "dell-technologies",
    companyName: "Dell Technologies Inc.",
    orgId: "D000000585",
    orgSlug: "dell-technologies",
    summaryUrl: "https://www.opensecrets.org/orgs/dell-technologies/summary?id=D000000585",
    recipientsUrl: "https://www.opensecrets.org/orgs/dell-technologies/recipients?id=D000000585",
    status: "verified",
  },
  {
    companyId: "wells-fargo",
    companyName: "Wells Fargo & Co.",
    orgId: "D000019743",
    orgSlug: "wells-fargo",
    summaryUrl: "https://www.opensecrets.org/orgs/wells-fargo/summary?id=D000019743",
    recipientsUrl: "https://www.opensecrets.org/orgs/wells-fargo/recipients?id=D000019743",
    status: "verified",
  },
  {
    companyId: "ge-vernova",
    companyName: "GE Vernova Inc.",
    orgId: "D000110360",
    orgSlug: "ge-vernova",
    summaryUrl: "https://www.opensecrets.org/orgs/ge-vernova/summary?id=D000110360",
    recipientsUrl: "https://www.opensecrets.org/orgs/ge-vernova/recipients?id=D000110360",
    status: "verified",
  },
  {
    companyId: "klac",
    companyName: "KLA Corporation",
    orgId: "D000035133",
    orgSlug: "kla-corp",
    summaryUrl: "https://www.opensecrets.org/orgs/kla-corp/summary?id=D000035133",
    recipientsUrl: "https://www.opensecrets.org/orgs/kla-corp/recipients?id=D000035133",
    status: "verified",
  },
  {
    companyId: "now",
    companyName: "ServiceNow, Inc.",
    orgId: "D000073991",
    orgSlug: "servicenow",
    summaryUrl: "https://www.opensecrets.org/orgs/servicenow/summary?id=D000073991",
    recipientsUrl: "https://www.opensecrets.org/orgs/servicenow/recipients?id=D000073991",
    status: "verified",
  },
  {
    companyId: "lin",
    companyName: "Linde plc",
    orgId: "D000071865",
    orgSlug: "linde-plc",
    summaryUrl: "https://www.opensecrets.org/orgs/linde-plc/summary?id=D000071865",
    recipientsUrl: "https://www.opensecrets.org/orgs/linde-plc/recipients?id=D000071865",
    status: "verified",
  },
  {
    companyId: "panw",
    companyName: "Palo Alto Networks, Inc.",
    orgId: "D000070976",
    orgSlug: "palo-alto-networks",
    summaryUrl: "https://www.opensecrets.org/orgs/palo-alto-networks/summary?id=D000070976",
    recipientsUrl: "https://www.opensecrets.org/orgs/palo-alto-networks/recipients?id=D000070976",
    status: "verified",
  },
  {
    companyId: "anet",
    companyName: "Arista Networks, Inc.",
    orgId: "D000070423",
    orgSlug: "arista-networks",
    summaryUrl: "https://www.opensecrets.org/orgs/arista-networks/summary?id=D000070423",
    recipientsUrl: "https://www.opensecrets.org/orgs/arista-networks/recipients?id=D000070423",
    status: "verified",
  },
  {
    companyId: "ba",
    companyName: "Boeing Company",
    orgId: "D000000100",
    orgSlug: "boeing-co",
    summaryUrl: "https://www.opensecrets.org/orgs/boeing-co/summary?id=D000000100",
    recipientsUrl: "https://www.opensecrets.org/orgs/boeing-co/recipients?id=D000000100",
    status: "verified",
  },
  {
    companyId: "axp",
    companyName: "American Express Company",
    orgId: "D000000217",
    orgSlug: "american-express",
    summaryUrl: "https://www.opensecrets.org/orgs/american-express/summary?id=D000000217",
    recipientsUrl: "https://www.opensecrets.org/orgs/american-express/recipients?id=D000000217",
    status: "verified",
  },
];

// causeProfiles topCauseCategoryId updates for stubs that still have null
const CAUSE_TOPIC_UPDATES = {
  klac: "education-opportunity",
  now: "education-opportunity",
  lin: "climate-environment",
  panw: "education-opportunity",
  anet: null, // minimal philanthropy — leave null
  ba: "education-opportunity",
  axp: "education-opportunity",
  // wells-fargo stub already has "education-opportunity" but housing is the real focus
  "wells-fargo": "health-human-services",
};

// ---------------------------------------------------------------------------
// Build evidence records
// ---------------------------------------------------------------------------
function makeEvidenceRecords(companyId, data) {
  const records = [];
  const sourceUrl = data.lobbyingSourceUrl;
  const today = "2026-08-11";

  if (data.pacContributionsUsd != null) {
    records.push({
      companyId,
      metric: "pacContributionsUsd",
      electionCycle: "2024",
      value: data.pacContributionsUsd,
      sourceName: `OpenSecrets - ${data.companyId}`,
      sourceUrl,
      sourceDate: today,
      confidence: "high",
    });
  }
  if (data.lobbyingSpendUsd != null) {
    records.push({
      companyId,
      metric: "lobbyingSpendUsd",
      electionCycle: "2024",
      value: data.lobbyingSpendUsd,
      sourceName: `OpenSecrets - ${data.companyId}`,
      sourceUrl,
      sourceDate: today,
      confidence: "high",
    });
  }
  records.push({
    companyId,
    metric: "partySplitPct",
    electionCycle: "2024",
    value: {
      dem: data.democraticPct,
      rep: data.republicanPct,
      third: data.thirdPartyPct,
    },
    sourceName: "OpenSecrets",
    sourceUrl,
    sourceDate: today,
    confidence: "medium",
  });
  return records;
}

// ---------------------------------------------------------------------------
// Apply updates
// ---------------------------------------------------------------------------

// 1. politicalProfiles.json
const polFile = readJSON("politicalProfiles.json");
const targetIds = new Set(Object.keys(POLITICAL_DATA));

polFile.profiles = polFile.profiles.map((profile) => {
  if (targetIds.has(profile.companyId)) {
    const update = POLITICAL_DATA[profile.companyId];
    return { ...profile, ...update };
  }
  return profile;
});
writeJSON("politicalProfiles.json", polFile);
console.log("✅ politicalProfiles.json updated");

// 2. openSecretsOrgMap.json
const orgMap = readJSON("openSecretsOrgMap.json");
const existingOrgIds = new Set(orgMap.records.map((o) => o.companyId));
for (const entry of ORG_MAP_ENTRIES) {
  if (!existingOrgIds.has(entry.companyId)) {
    orgMap.records.push(entry);
  } else {
    console.warn(`  ⚠ org entry already exists for ${entry.companyId}, skipping`);
  }
}
writeJSON("openSecretsOrgMap.json", orgMap);
console.log("✅ openSecretsOrgMap.json updated");

// 3. politicalEvidence.json
const polEvidence = readJSON("politicalEvidence.json");
for (const [companyId, data] of Object.entries(POLITICAL_DATA)) {
  const newRecords = makeEvidenceRecords(companyId, data);
  polEvidence.records.push(...newRecords);
}
writeJSON("politicalEvidence.json", polEvidence);
console.log("✅ politicalEvidence.json updated");

// 4. causeProfiles.json — update topCauseCategoryId for stubs with null
const causeFile = readJSON("causeProfiles.json");
causeFile.profiles = causeFile.profiles.map((profile) => {
  if (profile.companyId in CAUSE_TOPIC_UPDATES) {
    return { ...profile, topCauseCategoryId: CAUSE_TOPIC_UPDATES[profile.companyId] };
  }
  return profile;
});
writeJSON("causeProfiles.json", causeFile);
console.log("✅ causeProfiles.json updated (topCauseCategoryId)");

// Summary
console.log(`\nProcessed ${Object.keys(POLITICAL_DATA).length} companies:`);
for (const [id, d] of Object.entries(POLITICAL_DATA)) {
  const pac = d.pacContributionsUsd != null ? `PAC $${(d.pacContributionsUsd / 1e6).toFixed(2)}M` : "PAC null";
  const lob = d.lobbyingSpendUsd != null ? `Lobby $${(d.lobbyingSpendUsd / 1e6).toFixed(2)}M` : "Lobby null";
  console.log(`  ${id}: ${pac} | ${lob} | D${d.democraticPct}/R${d.republicanPct}`);
}
