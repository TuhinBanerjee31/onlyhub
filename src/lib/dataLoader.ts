import fs from "fs";
import path from "path";
import { supabase } from "./supabase";
import {
  NormalizedHackathon,
  PlatformType,
  HackathonMode,
  HubStats,
  RawDevfolioHackathon,
  RawDoraHacksHackathon,
  RawMLHWrapper,
  RawUnstopHackathon,
  RawWeMakeDevsWrapper,
} from "@/types/hackathon";
import {
  cleanDescription,
  extractPrizePool,
  extractTagsFromText,
  formatEventDates,
  getHackathonStatus,
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

let cachedHackathons: NormalizedHackathon[] | null = null;

/**
 * Loads hackathons from local JSON sample files (fallback mode)
 */
export function getAllHackathonsFromFiles(): NormalizedHackathon[] {
  const samplesDir = path.join(process.cwd(), "Samples");
  const allItems: NormalizedHackathon[] = [];

  // 1. Devfolio
  try {
    const devfolioPath = path.join(samplesDir, "devfolio.json");
    if (fs.existsSync(devfolioPath)) {
      const rawData = JSON.parse(fs.readFileSync(devfolioPath, "utf-8"));
      if (Array.isArray(rawData)) {
        rawData.forEach((item: RawDevfolioHackathon, idx: number) => {
          if (!item.title) return;
          const mode = normalizeMode(item.mode);
          const { short, full } = cleanDescription(item.description);
          const tags = extractTagsFromText(full, item.title);
          const prizePool = extractPrizePool(full);
          const { location, organizer } = extractLocationAndOrg(item.title, full, mode, item.mode);
          const displayDates = formatEventDates(item.start_date, item.end_date);
          const status = getHackathonStatus(item.start_date, item.end_date).status;

          allItems.push({
            id: `devfolio-${idx}-${item.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
            title: item.title,
            platform: "devfolio",
            mode,
            startDate: item.start_date || null,
            endDate: item.end_date || null,
            displayDates,
            imageUrl:
              item.image_url ||
              "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
            url: item.hackathon_url || item.product_page_url || "https://devfolio.co",
            description: full,
            shortDescription: short,
            tags,
            prizePool,
            location,
            organizer: organizer || "Devfolio Community",
            status,
            featured: idx < 3,
          });
        });
      }
    }
  } catch (err) {
    console.error("Error loading devfolio.json:", err);
  }

  // 2. DoraHacks
  try {
    const dorahacksPath = path.join(samplesDir, "dorahacks.json");
    if (fs.existsSync(dorahacksPath)) {
      const rawData = JSON.parse(fs.readFileSync(dorahacksPath, "utf-8"));
      if (Array.isArray(rawData)) {
        rawData.forEach((item: RawDoraHacksHackathon, idx: number) => {
          if (!item.title) return;
          const mode = normalizeMode(item.mode);
          const { short, full } = cleanDescription(item.description);
          const tags = extractTagsFromText(full, item.title);
          const prizePool = extractPrizePool(full);
          const { location, organizer } = extractLocationAndOrg(item.title, full, mode, item.mode);

          let startDisplay = item.start_date;
          let endDisplay = item.end_date;
          try {
            if (item.start_date) {
              const d = new Date(item.start_date);
              startDisplay = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            }
            if (item.end_date) {
              const d = new Date(item.end_date);
              endDisplay = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            }
          } catch {}

          const displayDates = formatEventDates(startDisplay, endDisplay);
          const status = getHackathonStatus(item.start_date, item.end_date).status;

          allItems.push({
            id: `dorahacks-${idx}-${item.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
            title: item.title,
            platform: "dorahacks",
            mode,
            startDate: item.start_date || null,
            endDate: item.end_date || null,
            displayDates,
            imageUrl:
              item.image_url ||
              "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60",
            url: item.hackathon_url || item.product_page_url || "https://dorahacks.io",
            description: full,
            shortDescription: short,
            tags,
            prizePool,
            location: location || "Global DoraHacks Track",
            organizer: organizer || "DoraHacks DAO",
            status,
            featured: idx === 0 || idx === 1,
          });
        });
      }
    }
  } catch (err) {
    console.error("Error loading dorahacks.json:", err);
  }

  // 3. MLH
  try {
    const mlhPath = path.join(samplesDir, "mlh.json");
    if (fs.existsSync(mlhPath)) {
      const rawData = JSON.parse(fs.readFileSync(mlhPath, "utf-8"));
      if (Array.isArray(rawData)) {
        rawData.forEach((wrapper: RawMLHWrapper) => {
          const list = wrapper.hackathons || [];
          list.forEach((item, idx) => {
            if (!item.title) return;
            const mode = normalizeMode(item.mode);
            const { short, full } = cleanDescription(
              `Major League Hacking Season Event: ${item.title}. Join student developers, creators, and mentors for an exhilarating weekend of building, workshops, hardware labs, and prizes.`
            );
            const tags = extractTagsFromText(item.title + " Student Hackathon MLH", item.title);
            const displayDates = formatEventDates(item.start_date, item.end_date);
            const { location, organizer } = extractLocationAndOrg(item.title, "", mode, item.mode);
            const status = getHackathonStatus(item.start_date, item.end_date).status;

            allItems.push({
              id: `mlh-${idx}-${item.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
              title: item.title,
              platform: "mlh",
              mode,
              startDate: item.start_date || null,
              endDate: item.end_date || null,
              displayDates,
              imageUrl:
                item.image_url ||
                "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60",
              url: item.hackathon_url || "https://mlh.io",
              description: full,
              shortDescription: short,
              tags,
              prizePool: "MLH Category Prizes & Swag",
              location: location || (mode === "In-Person" ? "University Campus" : "Digital"),
              organizer: organizer || "Major League Hacking",
              status,
              featured: idx === 0 || idx === 7 || idx === 11,
            });
          });
        });
      }
    }
  } catch (err) {
    console.error("Error loading mlh.json:", err);
  }

  // 4. Unstop
  try {
    const unstopPath = path.join(samplesDir, "unstop.json");
    if (fs.existsSync(unstopPath)) {
      const rawData = JSON.parse(fs.readFileSync(unstopPath, "utf-8"));
      if (Array.isArray(rawData)) {
        rawData.forEach((item: RawUnstopHackathon, idx: number) => {
          if (!item.title) return;
          const mode = normalizeMode(item.mode);
          const { short, full } = cleanDescription(item.description);
          const tags = extractTagsFromText(full, item.title);
          const prizePool = extractPrizePool(full);
          const { location, organizer } = extractLocationAndOrg(item.title, full, mode, item.mode);

          let startDisplay = item.start_date;
          let endDisplay = item.end_date;
          try {
            if (item.start_date) {
              const d = new Date(item.start_date);
              startDisplay = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            }
            if (item.end_date) {
              const d = new Date(item.end_date);
              endDisplay = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            }
          } catch {}

          const displayDates = formatEventDates(startDisplay, endDisplay);
          const status = getHackathonStatus(item.start_date, item.end_date).status;

          allItems.push({
            id: `unstop-${idx}-${item.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
            title: item.title,
            platform: "unstop",
            mode,
            startDate: item.start_date || null,
            endDate: item.end_date || null,
            displayDates,
            imageUrl:
              item.image_url ||
              "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60",
            url: item.hackathon_url || item.product_page_url || "https://unstop.com",
            description: full,
            shortDescription: short,
            tags,
            prizePool,
            location: location || "Unstop Online Hub",
            organizer: organizer || "Unstop Organizer",
            status,
            featured: idx === 0 || idx === 1,
          });
        });
      }
    }
  } catch (err) {
    console.error("Error loading unstop.json:", err);
  }

  // 5. WeMakeDevs
  try {
    const wemakedevsPath = path.join(samplesDir, "wemakedevs.json");
    if (fs.existsSync(wemakedevsPath)) {
      const rawData = JSON.parse(fs.readFileSync(wemakedevsPath, "utf-8"));
      if (Array.isArray(rawData)) {
        rawData.forEach((wrapper: RawWeMakeDevsWrapper) => {
          const list = wrapper.hackathons || [];
          list.forEach((item, idx) => {
            if (!item.title) return;
            const mode = normalizeMode(item.mode);
            const { short, full } = cleanDescription(item.description);
            const tags = extractTagsFromText((full || "") + " " + item.title, item.title);
            const prizePool = extractPrizePool(full || item.description);
            const { location, organizer } = extractLocationAndOrg(item.title, full, mode, item.mode);
            const displayDates = formatEventDates(item.start_date, item.end_date);
            const status = getHackathonStatus(item.start_date, item.end_date).status;

            allItems.push({
              id: `wemakedevs-${idx}-${item.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
              title: item.title,
              platform: "wemakedevs",
              mode,
              startDate: item.start_date || null,
              endDate: item.end_date || null,
              displayDates,
              imageUrl:
                item.image_url ||
                "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60",
              url: item.hackathon_url || "https://www.wemakedevs.org",
              description: full || item.description || "",
              shortDescription: short || item.description || "",
              tags,
              prizePool: prizePool || "WeMakeDevs Community Bounties",
              location: location || (mode === "In-Person" ? "Campus / Venue" : "Virtual / Global"),
              organizer: organizer || "WeMakeDevs Community",
              status,
              featured: idx === 0 || idx === 3,
            });
          });
        });
      }
    }
  } catch (err) {
    console.error("Error loading wemakedevs.json:", err);
  }

  return allItems;
}

/**
 * Synchronous getter with caching
 */
export function getAllHackathons(): NormalizedHackathon[] {
  if (cachedHackathons) {
    return cachedHackathons;
  }
  const items = getAllHackathonsFromFiles();
  cachedHackathons = items;
  return items;
}

/**
 * Async getter that queries Supabase first if available, with automatic JSON fallback
 */
export async function getAllHackathonsAsync(): Promise<NormalizedHackathon[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("hackathons")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => {
          const status = getHackathonStatus(row.start_date, row.end_date).status;
          return {
            id: row.id,
            title: row.title,
            platform: row.platform,
            mode: row.mode,
            startDate: row.start_date,
            endDate: row.end_date,
            displayDates: row.display_dates,
            imageUrl: row.image_url,
            url: row.url,
            description: row.description || "",
            shortDescription: row.short_description || "",
            tags: row.tags || [],
            prizePool: row.prize_pool || undefined,
            location: row.location || undefined,
            organizer: row.organizer || undefined,
            status,
            featured: row.featured || false,
          };
        });
      }
    } catch (err) {
      console.warn("[DataLoader] Supabase query error, falling back to local files:", err);
    }
  }

  return getAllHackathons();
}

export function getHubStats(hackathons: NormalizedHackathon[]): HubStats {
  const platformCounts: Record<PlatformType, number> = {
    devfolio: 0,
    dorahacks: 0,
    mlh: 0,
    unstop: 0,
    wemakedevs: 0,
  };

  let onlineCount = 0;
  let inPersonCount = 0;
  let upcomingCount = 0;
  let ongoingCount = 0;
  let completedCount = 0;
  const tagFrequency: Record<string, number> = {};

  hackathons.forEach((h) => {
    platformCounts[h.platform] = (platformCounts[h.platform] || 0) + 1;
    if (h.mode === "Online") onlineCount++;
    else if (h.mode === "In-Person" || h.mode === "Hybrid") inPersonCount++;

    if (h.status === "ongoing") ongoingCount++;
    else if (h.status === "upcoming") upcomingCount++;
    else if (h.status === "completed") completedCount++;

    h.tags.forEach((tag) => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  });

  const popularTags = Object.entries(tagFrequency)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    total: hackathons.length,
    onlineCount,
    inPersonCount,
    upcomingCount,
    ongoingCount,
    completedCount,
    platformCounts,
    popularTags,
  };
}
