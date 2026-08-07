import {
  getCauseEvidence,
  getCauseProfiles,
  getCompanies,
} from "@/lib/data/repository";
import CausesPageClient from "@/app/causes/CausesPageClient";

export default async function CausesPage() {
  const [companies, seededProfiles, evidenceRows] = await Promise.all([
    getCompanies(),
    getCauseProfiles(),
    getCauseEvidence(),
  ]);

  return (
    <CausesPageClient
      companies={companies}
      seededProfiles={seededProfiles}
      evidenceRows={evidenceRows}
    />
  );
}
