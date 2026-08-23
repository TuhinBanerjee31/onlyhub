import { NextRequest, NextResponse } from "next/server";
import { triggerAllBrightDataCollectors } from "@/lib/brightData";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Daily cron route to trigger all 4 Bright Data DCA Collectors.
 * Can be called by Vercel Cron, GitHub Actions, or an external scheduler.
 */
export async function GET(request: NextRequest) {
  return handleSync(request);
}

export async function POST(request: NextRequest) {
  return handleSync(request);
}

async function handleSync(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Protect the endpoint if CRON_SECRET is configured
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Invalid or missing CRON_SECRET" },
      { status: 401 }
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    `https://${request.headers.get("host")}`;

  const webhookUrl = `${origin}/api/webhooks/brightdata`;

  try {
    console.log(`[Cron] Triggering Bright Data collectors with webhook: ${webhookUrl}`);
    const results = await triggerAllBrightDataCollectors(webhookUrl);

    // Record triggers in sync_logs if Supabase Admin is available
    if (supabaseAdmin) {
      for (const res of results) {
        await supabaseAdmin.from("sync_logs").insert({
          platform: res.platform,
          collector_id: `collector-${res.platform}`,
          response_id: res.responseId || null,
          status: res.success ? "triggered" : "failed",
          error_message: res.error || null,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Bright Data DCA collectors triggered successfully",
      webhookUrl,
      results,
      triggeredAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Cron] Error triggering daily sync:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to trigger daily sync" },
      { status: 500 }
    );
  }
}
