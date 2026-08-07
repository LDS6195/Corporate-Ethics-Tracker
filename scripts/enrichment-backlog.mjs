import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath) {
  const filePath = path.join(root, relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const companies = readJson("src/data/companies.json").companies;
const causeProfiles = new Map(
  readJson("src/data/causeProfiles.json").profiles.map((p) => [p.companyId, p])
);
const politicalProfiles = new Map(
  readJson("src/data/politicalProfiles.json").profiles.map((p) => [p.companyId, p])
);
const openSecretsMap = new Map(
  readJson("src/data/openSecretsOrgMap.json").records.map((r) => [r.companyId, r])
);

function scoreCauseGap(profile) {
  let score = 0;
  const reasons = [];

  if (!profile) {
    return { score: 10, reasons: ["missing-cause-profile"] };
  }

  if ((profile.highConfidenceRecords ?? 0) < 1) {
    score += 4;
    reasons.push("no-high-confidence-cause-record");
  }

  if ((profile.disclosedSpendUsd ?? 0) <= 0) {
    score += 4;
    reasons.push("no-disclosed-cause-spend");
  }

  if ((profile.evidenceRecords ?? 0) < 3) {
    score += 2;
    reasons.push("thin-cause-evidence");
  }

  return { score, reasons };
}

function scorePoliticalGap(profile) {
  let score = 0;
  const reasons = [];

  if (!profile) {
    return { score: 12, reasons: ["missing-political-profile"] };
  }

  if (profile.profileStatus !== "published") {
    score += 3;
    reasons.push("political-profile-not-published");
  }

  if (profile.pacContributionsUsd == null) {
    score += 3;
    reasons.push("missing-pac-amount");
  }

  if (profile.lobbyingSpendUsd == null) {
    score += 3;
    reasons.push("missing-lobbying-amount");
  }

  if ((profile.highConfidenceRecords ?? 0) < 3) {
    score += 3;
    reasons.push("insufficient-high-confidence-political-records");
  }

  return { score, reasons };
}

function scorePoliticalSourceReadiness(orgRecord) {
  if (!orgRecord) {
    return { score: 3, reasons: ["missing-opensecrets-map-record"] };
  }

  if (orgRecord.status !== "verified") {
    return { score: 3, reasons: ["opensecrets-id-not-verified"] };
  }

  return { score: 0, reasons: [] };
}

const backlog = companies
  .map((company) => {
    const cause = causeProfiles.get(company.id);
    const politics = politicalProfiles.get(company.id);
    const orgRecord = openSecretsMap.get(company.id);

    const causeGap = scoreCauseGap(cause);
    const politicalGap = scorePoliticalGap(politics);
    const sourceReadinessGap = scorePoliticalSourceReadiness(orgRecord);

    return {
      companyId: company.id,
      companyName: company.name,
      causeGapScore: causeGap.score,
      politicalGapScore: politicalGap.score + sourceReadinessGap.score,
      totalGapScore: causeGap.score + politicalGap.score + sourceReadinessGap.score,
      causeReasons: causeGap.reasons,
      politicalReasons: [...politicalGap.reasons, ...sourceReadinessGap.reasons],
      causeSummary: {
        evidenceRecords: cause?.evidenceRecords ?? 0,
        highConfidenceRecords: cause?.highConfidenceRecords ?? 0,
        disclosedSpendUsd: cause?.disclosedSpendUsd ?? 0
      },
      politicalSummary: {
        profileStatus: politics?.profileStatus ?? "missing",
        evidenceRecords: politics?.evidenceRecords ?? 0,
        highConfidenceRecords: politics?.highConfidenceRecords ?? 0,
        pacContributionsUsd: politics?.pacContributionsUsd ?? null,
        lobbyingSpendUsd: politics?.lobbyingSpendUsd ?? null
      }
    };
  })
  .sort((a, b) => b.totalGapScore - a.totalGapScore || a.companyName.localeCompare(b.companyName));

console.log("=== Enrichment Backlog (highest gap first) ===");
for (const row of backlog) {
  console.log(
    [
      row.companyName,
      `total=${row.totalGapScore}`,
      `causes=${row.causeGapScore}`,
      `politics=${row.politicalGapScore}`
    ].join(" | ")
  );
}

console.log("\n=== Top 8 With Reasons ===");
for (const row of backlog.slice(0, 8)) {
  console.log(`\n${row.companyName} (${row.companyId})`);
  console.log(`  gap score: ${row.totalGapScore} (causes ${row.causeGapScore}, politics ${row.politicalGapScore})`);
  console.log(`  causes: ${row.causeReasons.join(", ") || "none"}`);
  console.log(`  politics: ${row.politicalReasons.join(", ") || "none"}`);
}

console.log("\n=== OpenSecrets ID Gaps ===");
for (const row of backlog.filter((r) => r.politicalReasons.includes("opensecrets-id-not-verified"))) {
  console.log(`${row.companyName} (${row.companyId})`);
}
