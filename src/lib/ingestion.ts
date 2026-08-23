import { supabaseAdmin } from "./supabase";
import {
  NormalizedHackathon,
  PlatformType,
  HackathonMode,
  RawMLHWrapper,
  RawWeMakeDevsWrapper,
} from "@/types/hackathon";
import {
  cleanDescription,
  extractPrizePool,
  extractTagsFromText,
  formatEventDates,
} from "./utils";

function normalizeMode(rawMode?: string): HackathonMode {
  if (!rawMode) return "Online";
  const m = rawMode.toLowerCase().trim();
  if (m.includes("hybrid")) return "Hybrid";
  if (
    m.includes("offline") ||
    m.includes("in-person") ||
    m.includes("in person") ||
    m.includes("onsite") ||
    m.includes("san francisco") ||
    m.includes("bengaluru") ||
    m.includes("delhi")
  ) {
    return "In-Person";
  }
  return "Online";
}

function extractLocationAndOrg(
  title: string,
  desc: string,
  mode: HackathonMode,
  rawMode?: string
): { location?: string; organizer?: string } {
  let location: string | undefined = undefined;
  let organizer: string | undefined = undefined;

  const combined = `${title} ${desc} ${rawMode || ""}`;

  const locRegex =
    /(San Francisco, CA|San Francisco|IIT Bhubaneswar|VIT Chennai|VIT Vellore|UEM Kolkata|FIEM Kolkata|Bangalore|Bengaluru|Kolkata|Hyderabad|Chennai|Delhi|Mumbai|New York|Toronto|Montreal|Boston|Austin|Atlanta)/i;
  const locMatch = combined.match(locRegex);
  if (locMatch) {
    location = locMatch[1];
  } else if (mode === "In-Person") {
    location = rawMode && !rawMode.toLowerCase().includes("in-person") ? rawMode : "In-Person Venue";
  } else if (mode === "Online") {
    location = "Virtual / Global";
  }

  const orgRegex =
    /(WeMakeDevs|ACM Student Chapter|IEEE Robotics and Automation Society|Microsoft Innovations Club|Coding Club|TechZap|Frontend Arena|Quality Thought|Freshworks|DigitalOcean|NVIDIA|SigNoz|FalkorDB|Zerops|Cognee)/i;
  const orgMatch = combined.match(orgRegex);
  if (orgMatch) {
    organizer = orgMatch[1];
  }

  return { location, organizer };
}

/**
 * Normalizes raw payload from any of the 5 Bright Data collectors
 */
export function normalizeScrapedData(
  platform: PlatformType,
  rawData: any[]
): NormalizedHackathon[] {
  const normalized: NormalizedHackathon[] = [];

  if (!Array.isArray(rawData) || rawData.length === 0) {
    return normalized;
  }

  // Handle nested MLH or WeMakeDevs format wrappers
  let items = rawData;
  if (
    (platform === "mlh" || platform === "wemakedevs") &&
    rawData[0]?.hackathons &&
    Array.isArray(rawData[0].hackathons)
  ) {
    items = rawData.flatMap(
      (d: RawMLHWrapper | RawWeMakeDevsWrapper) => d.hackathons || []
    );
  }

  items.forEach((item: any, idx: number) => {
    if (!item || !item.title) return;

    const mode = normalizeMode(item.mode);
    const { short, full } = cleanDescription(item.description);
    const tags = extractTagsFromText(full || item.title, item.title);
    const prizePool = extractPrizePool(full);
    const { location, organizer } = extractLocationAndOrg(item.title, full, mode, item.mode);

    let startDisplay = item.start_date;
    let endDisplay = item.end_date;

    // ISO dates format (DoraHacks / Unstop)
    if (item.start_date && item.start_date.includes("T")) {
      try {
        const d = new Date(item.start_date);
        startDisplay = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } catch {}
    }
    if (item.end_date && item.end_date.includes("T")) {
      try {
        const d = new Date(item.end_date);
        endDisplay = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } catch {}
    }

    const displayDates = formatEventDates(startDisplay, endDisplay);
    const uniqueId = `${platform}-${item.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const url =
      item.hackathon_url ||
      item.product_page_url ||
      (platform === "wemakedevs" ? "https://www.wemakedevs.org" : `https://${platform}.com`);

    normalized.push({
      id: uniqueId,
      title: item.title,
      platform,
      mode,
      startDate: item.start_date || null,
      endDate: item.end_date || null,
      displayDates,
      imageUrl:
        item.image_url ||
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
      url,
      description: full || item.description || "",
      shortDescription: short || item.description || "",
      tags,
      prizePool:
        prizePool ||
        (platform === "mlh"
          ? "MLH Category Prizes & Swag"
          : platform === "wemakedevs"
          ? "WeMakeDevs Community Bounties"
          : undefined),
      location: location || (mode === "In-Person" ? "University Campus" : "Virtual / Global"),
      organizer: organizer || (platform === "wemakedevs" ? "WeMakeDevs Community" : `${platform.toUpperCase()} Community`),
      status: "upcoming",
      featured: idx === 0,
    });
  });

  return normalized;
}

/**
 * Ingests and upserts normalized hackathons into Supabase PostgreSQL
 */
export async function ingestHackathonsToSupabase(
  platform: PlatformType,
  hackathons: NormalizedHackathon[],
  rawPayload?: any
): Promise<{ success: boolean; upsertedCount: number; error?: string }> {
  if (!supabaseAdmin) {
    console.warn("[Ingestion] Supabase Admin client not configured. Skipping database upsert.");
    return {
      success: false,
      upsertedCount: 0,
      error: "Supabase Admin client not configured (SUPABASE_SERVICE_ROLE_KEY required).",
    };
  }

  if (hackathons.length === 0) {
    return { success: true, upsertedCount: 0 };
  }

  const rows = hackathons.map((h) => ({
    id: h.id,
    title: h.title,
    platform: h.platform,
    mode: h.mode,
    start_date: h.startDate,
    end_date: h.endDate,
    display_dates: h.displayDates,
    image_url: h.imageUrl,
    url: h.url,
    description: h.description,
    short_description: h.shortDescription,
    tags: h.tags,
    prize_pool: h.prizePool || null,
    location: h.location || null,
    organizer: h.organizer || null,
    status: h.status,
    featured: h.featured || false,
    raw_data: rawPayload ? rawPayload : null,
    updated_at: new Date().toISOString(),
  }));

  try {
    const { data, error } = await supabaseAdmin
      .from("hackathons")
      .upsert(rows, { onConflict: "url" })
      .select();

    if (error) {
      console.error(`[Ingestion] Supabase upsert error for ${platform}:`, error);
      return { success: false, upsertedCount: 0, error: error.message };
    }

    const count = data?.length || rows.length;
    console.log(`[Ingestion] Successfully upserted ${count} hackathons for ${platform}`);

    // Log the sync
    await supabaseAdmin.from("sync_logs").insert({
      platform,
      collector_id: `brightdata-${platform}`,
      status: "completed",
      items_count: count,
      completed_at: new Date().toISOString(),
    });

    return { success: true, upsertedCount: count };
  } catch (err: any) {
    console.error(`[Ingestion] Exception during Supabase upsert for ${platform}:`, err);
    return { success: false, upsertedCount: 0, error: err.message };
  }
}
