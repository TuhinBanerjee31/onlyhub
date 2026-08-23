import { getAllHackathonsFromFiles } from "../src/lib/dataLoader";
import { ingestHackathonsToSupabase } from "../src/lib/ingestion";
import { PlatformType } from "../src/types/hackathon";

// Load environment variables if running directly
require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

async function main() {
  console.log("🌱 Starting initial Supabase database seeding...");

  const allHackathons = getAllHackathonsFromFiles();
  console.log(`📦 Loaded ${allHackathons.length} hackathons from local files.`);

  const platforms: PlatformType[] = [
    "devfolio",
    "dorahacks",
    "mlh",
    "unstop",
    "wemakedevs",
  ];

  for (const platform of platforms) {
    const platformItems = allHackathons.filter((h) => h.platform === platform);
    console.log(`⏳ Seeding ${platformItems.length} items for ${platform}...`);
    const res = await ingestHackathonsToSupabase(platform, platformItems);

    if (res.success) {
      console.log(`✅ ${platform}: ${res.upsertedCount} items upserted into Supabase.`);
    } else {
      console.error(`❌ ${platform} failed:`, res.error);
    }
  }

  console.log("🎉 Seeding complete!");
}

main().catch(console.error);
