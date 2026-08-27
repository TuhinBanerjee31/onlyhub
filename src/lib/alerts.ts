import { supabaseAdmin } from "@/lib/supabase";
import { parseHackathonDate } from "@/lib/utils";
import { NormalizedHackathon } from "@/types/hackathon";
import fs from "fs";
import path from "path";

const BACKUP_SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");

export async function getActiveSubscribers(): Promise<string[]> {
  const emailSet = new Set<string>();

  // 1. Try fetching from Supabase
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("subscribers")
        .select("email")
        .eq("is_active", true);

      if (!error && Array.isArray(data)) {
        data.forEach((row) => {
          if (row.email) emailSet.add(row.email.toLowerCase().trim());
        });
      }
    } catch (err) {
      console.warn("⚠️ [Alerts] Could not read subscribers from Supabase:", err);
    }
  }

  // 2. Also read from local backup
  try {
    if (fs.existsSync(BACKUP_SUBSCRIBERS_FILE)) {
      const content = fs.readFileSync(BACKUP_SUBSCRIBERS_FILE, "utf-8");
      const localSubs = JSON.parse(content || "[]");
      if (Array.isArray(localSubs)) {
        localSubs.forEach((s) => {
          if (s.email) emailSet.add(s.email.toLowerCase().trim());
        });
      }
    }
  } catch (err) {
    console.warn("⚠️ [Alerts] Could not read local subscribers file:", err);
  }

  return Array.from(emailSet);
}

/**
 * Identifies hackathons starting within the next ~24 to 48 hours (tomorrow).
 */
export function findHackathonsStartingTomorrow(
  hackathons: NormalizedHackathon[],
  now = new Date()
): NormalizedHackathon[] {
  // Tomorrow's date in UTC
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowYear = tomorrow.getUTCFullYear();
  const tomorrowMonth = tomorrow.getUTCMonth();
  const tomorrowDate = tomorrow.getUTCDate();

  return hackathons.filter((h) => {
    const parsedStart = parseHackathonDate(h.startDate);
    if (!parsedStart) return false;

    // Check if start date matches tomorrow's day/month/year OR starts within 12h to 36h
    const isTomorrowCalendar =
      parsedStart.getFullYear() === tomorrowYear &&
      parsedStart.getMonth() === tomorrowMonth &&
      parsedStart.getDate() === tomorrowDate;

    const diffHours = (parsedStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isWithin24hWindow = diffHours >= 12 && diffHours <= 36;

    return isTomorrowCalendar || isWithin24hWindow;
  });
}
