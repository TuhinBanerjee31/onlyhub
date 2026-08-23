import { NextRequest, NextResponse } from "next/server";
import { triggerBrightDataCollector, getBrightDataResult } from "@/lib/brightData";
import { ingestHackathonsToSupabase, normalizeScrapedData } from "@/lib/ingestion";
import { PlatformType } from "@/types/hackathon";

export const dynamic = "force-dynamic";

/**
 * Manual sync endpoint to trigger a single platform, or ingest payload directly.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const platform: PlatformType = body.platform || "unstop";

    // 1. Direct payload ingestion if provided
    if (body.data && Array.isArray(body.data)) {
      const normalized = normalizeScrapedData(platform, body.data);
      const result = await ingestHackathonsToSupabase(platform, normalized, body.data);
      return NextResponse.json({
        success: true,
        action: "direct_ingestion",
        platform,
        upsertedCount: result.upsertedCount,
      });
    }

    // 2. Fetch by response_id if provided
    if (body.responseId) {
      const rawData = await getBrightDataResult(body.responseId);
      const normalized = normalizeScrapedData(platform, Array.isArray(rawData) ? rawData : [rawData]);
      const result = await ingestHackathonsToSupabase(platform, normalized, rawData);
      return NextResponse.json({
        success: true,
        action: "fetched_result",
        platform,
        upsertedCount: result.upsertedCount,
      });
    }

    // 3. Otherwise trigger the collector
    const triggerRes = await triggerBrightDataCollector(platform);
    return NextResponse.json({
      success: triggerRes.success,
      action: "collector_triggered",
      platform,
      responseId: triggerRes.responseId,
      error: triggerRes.error,
    });
  } catch (error: any) {
    console.error("[Manual Sync] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Manual sync failed" },
      { status: 500 }
    );
  }
}
