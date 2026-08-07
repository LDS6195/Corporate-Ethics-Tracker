import { getCompanies } from "@/lib/data/repository";
import HomePageClient from "@/app/HomePageClient";

export default async function Home() {
  const companies = await getCompanies();
  return <HomePageClient companies={companies} />;
}
