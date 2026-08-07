import { getCompanies, getPoliticalProfiles } from "@/lib/data/repository";
import PoliticsPageClient from "@/app/politics/PoliticsPageClient";

export default async function PoliticsPage() {
  const [companies, seededProfiles] = await Promise.all([
    getCompanies(),
    getPoliticalProfiles(),
  ]);

  return (
    <PoliticsPageClient companies={companies} seededProfiles={seededProfiles} />
  );
}
