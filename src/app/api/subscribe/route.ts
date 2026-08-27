import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { loadAllHackathons } from "@/lib/dataLoader";
import { getHackathonStatus } from "@/lib/utils";
import { sendOngoingDigestEmail } from "@/lib/mailer";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const BACKUP_SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");

function saveLocalSubscriber(email: string) {
  try {
    const dir = path.dirname(BACKUP_SUBSCRIBERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let subscribers: { email: string; subscribedAt: string }[] = [];
    if (fs.existsSync(BACKUP_SUBSCRIBERS_FILE)) {
      const content = fs.readFileSync(BACKUP_SUBSCRIBERS_FILE, "utf-8");
      subscribers = JSON.parse(content || "[]");
    }

    if (!subscribers.find((s) => s.email.toLowerCase() === email.toLowerCase())) {
      subscribers.push({ email, subscribedAt: new Date().toISOString() });
      fs.writeFileSync(BACKUP_SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("⚠️ Failed to write to local subscribers backup:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    // 1. Validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Persist to Supabase if configured
    if (supabaseAdmin) {
      try {
        const { error: dbError } = await supabaseAdmin.from("subscribers").upsert(
          {
            email: cleanEmail,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          { onConflict: "email" }
        );

        if (dbError) {
          console.warn("⚠️ Supabase subscribers upsert warning:", dbError.message);
        }
      } catch (dbEx: any) {
        console.warn("⚠️ Supabase subscribers table error:", dbEx.message);
      }
    }

    // Also persist in local backup file
    saveLocalSubscriber(cleanEmail);

    // 3. Load all hackathons and filter for live ongoing hackathons
    const allHackathons = await loadAllHackathons();
    const ongoingHackathons = allHackathons.filter((h) => {
      const { status } = getHackathonStatus(h.startDate, h.endDate);
      return status === "ongoing";
    });

    console.log(
      `📧 [Subscribe] New subscriber: ${cleanEmail}. Found ${ongoingHackathons.length} ongoing hackathons.`
    );

    // 4. Send Instant Welcome & Ongoing Digest Email
    await sendOngoingDigestEmail(cleanEmail, ongoingHackathons);

    return NextResponse.json({
      success: true,
      message: `Subscribed! We just emailed you ${ongoingHackathons.length} live ongoing hackathons.`,
      ongoingCount: ongoingHackathons.length,
    });
  } catch (error: any) {
    console.error("❌ [Subscribe API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process subscription.",
      },
      { status: 500 }
    );
  }
}
