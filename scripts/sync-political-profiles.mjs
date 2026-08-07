import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const evidencePath = path.join(root, "src/data/politicalEvidence.json");
const profilesPath = path.join(root, "src/data/politicalProfiles.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function parseDate(dateStr) {
  const t = Date.parse(dateStr);
  return Number.isNaN(t) ? 0 : t;
}

function pickLatestRecord(records, metric) {
  const candidates = records.filter((r) => r.metric === metric);
  if (candidates.length === 0) return null;

  return candidates.sort((a, b) => {
    const dateDiff = parseDate(b.sourceDate) - parseDate(a.sourceDate);
    if (dateDiff !== 0) return dateDiff;
    return (b.confidence === "high" ? 1 : 0) - (a.confidence === "high" ? 1 : 0);
  })[0];
}

function maxDate(records, fallback) {
  if (records.length === 0) return fallback;
  const sorted = [...records].sort((a, b) => parseDate(b.sourceDate) - parseDate(a.sourceDate));
  return sorted[0]?.sourceDate ?? fallback;
}

const evidence = readJson(evidencePath);
const profiles = readJson(profilesPath);

const recordsByCompany = new Map();
for (const record of evidence.records ?? []) {
  const bucket = recordsByCompany.get(record.companyId) ?? [];
  bucket.push(record);
  recordsByCompany.set(record.companyId, bucket);
}

profiles.profiles = (profiles.profiles ?? []).map((profile) => {
  const companyRecords = recordsByCompany.get(profile.companyId) ?? [];
  if (companyRecords.length === 0) {
    return profile;
  }

  const pacRecord = pickLatestRecord(companyRecords, "pacContributionsUsd");
  const partyRecord = pickLatestRecord(companyRecords, "partySplitPct");
  const lobbyingRecord = pickLatestRecord(companyRecords, "lobbyingSpendUsd");

  const next = {
    ...profile,
    evidenceRecords: companyRecords.length,
    highConfidenceRecords: companyRecords.filter((r) => r.confidence === "high").length,
    lastUpdated: maxDate(companyRecords, profile.lastUpdated),
  };

  if (pacRecord && typeof pacRecord.value === "number") {
    next.pacContributionsUsd = pacRecord.value;
    next.electionCycle = pacRecord.electionCycle ?? next.electionCycle;
  }

  if (partyRecord && typeof partyRecord.value === "object" && partyRecord.value) {
    const split = partyRecord.value;
    next.democraticPct = split.democraticPct;
    next.republicanPct = split.republicanPct;
    next.thirdPartyPct = split.thirdPartyPct;
    next.electionCycle = partyRecord.electionCycle ?? next.electionCycle;
  }

  if (lobbyingRecord && typeof lobbyingRecord.value === "number") {
    next.lobbyingSpendUsd = lobbyingRecord.value;
    next.electionCycle = lobbyingRecord.electionCycle ?? next.electionCycle;
  }

  const hasCorePoliticalMetrics =
    typeof next.pacContributionsUsd === "number" &&
    typeof next.democraticPct === "number" &&
    typeof next.republicanPct === "number" &&
    typeof next.thirdPartyPct === "number" &&
    typeof next.lobbyingSpendUsd === "number";

  if (hasCorePoliticalMetrics) {
    next.profileStatus = "published";
  }

  return next;
});

writeJson(profilesPath, profiles);
console.log("Synchronized political profiles from political evidence records.");
