import { getAllHackathonsAsync, getHubStats } from "@/lib/dataLoader";
import { HackathonHubClient } from "@/components/HackathonHubClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const hackathons = await getAllHackathonsAsync();
  const stats = getHubStats(hackathons);

  return (
    <HackathonHubClient
      initialHackathons={hackathons}
      initialStats={stats}
    />
  );
}
