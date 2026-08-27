import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { loadAllHackathons } from "@/lib/dataLoader";
import { findHackathonsStartingTomorrow, getActiveSubscribers } from "@/lib/alerts";
import { sendUpcomingAlertEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleAlertCron(request);
}

export async function POST(request: NextRequest) {
  return handleAlertCron(request);
}

async function handleAlertCron(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Invalid or missing CRON_SECRET" },
      { status: 401 }
    );
  }

  try {
    const allHackathons = await loadAllHackathons();
    const startingTomorrow = findHackathonsStartingTomorrow(allHackathons);
    const subscribers = await getActiveSubscribers();

    console.log(
      `🔔 [Alerts Cron] Found ${startingTomorrow.length} hackathons starting tomorrow for ${subscribers.length} subscribers.`
    );

    let sent = false;
    if (startingTomorrow.length > 0 && subscribers.length > 0) {
      const sendResult = await sendUpcomingAlertEmail(subscribers, startingTomorrow);
      sent = sendResult.success;

      // Update last_notified_at in Supabase
      if (supabaseAdmin) {
        try {
          await supabaseAdmin
            .from("subscribers")
            .update({ last_notified_at: new Date().toISOString() })
            .eq("is_active", true);
        } catch (updateErr) {
          // ignore
        }
      }
    }

    return NextResponse.json({
      success: true,
      hackathonsFound: startingTomorrow.length,
      subscribersNotified: subscribers.length,
      emailsSent: sent,
      upcomingHackathons: startingTomorrow.map((h) => ({
        id: h.id,
        title: h.title,
        platform: h.platform,
        displayDates: h.displayDates,
      })),
      executedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ [Alerts Cron Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute alerts cron." },
      { status: 500 }
    );
  }
}
