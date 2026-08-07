export type PoliticalProfileStatus = "not-started" | "in-progress" | "published";

export interface RevolvingDoorSnapshot {
  cycle: string;
  formerGovtLobbyists: number;
  totalLobbyists: number;
}

export interface CompanyPoliticalProfile {
  companyId: string;
  profileStatus: PoliticalProfileStatus;
  electionCycle?: string;
  pacContributionsUsd?: number;
  democraticPct?: number;
  republicanPct?: number;
  thirdPartyPct?: number;
  lobbyingSpendUsd?: number;
  lobbyingSpendPriorYearUsd?: number;
  lobbyingFocusSummary?: string;
  lobbyingPolicyArea?: string;
  lobbyingBillSummary?: string;
  lobbyingFocusAreas?: string[];
  topLobbiedBillId?: string;
  topLobbiedBillTitle?: string;
  topLobbiedBillUrl?: string;
  lobbyingSourceUrl?: string;
  revolvingDoorCurrent?: RevolvingDoorSnapshot;
  revolvingDoorPrior?: RevolvingDoorSnapshot;
  tradeAssociationRiskFlag?: boolean;
  evidenceRecords: number;
  highConfidenceRecords: number;
  lastUpdated: string;
}
