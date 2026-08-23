import { NextRequest, NextResponse } from "next/server";
import { ingestHackathonsToSupabase, normalizeScrapedData } from "@/lib/ingestion";
import { PlatformType } from "@/types/hackathon";

export const dynamic = "force-dynamic";

function detectPlatform(payload: any, urlParam?: string | null): PlatformType {
  if (
    urlParam &&
    ["devfolio", "dorahacks", "mlh", "unstop", "wemakedevs"].includes(urlParam)
  ) {
    return urlParam as PlatformType;
  }

  const sample = Array.isArray(payload) ? payload[0] : payload;
  const rawString = JSON.stringify(sample || "").toLowerCase();

  if (rawString.includes("wemakedevs.org") || rawString.includes("c_mt62dad22g0jvfi8gl")) {
    return "wemakedevs";
  }
  if (rawString.includes("dorahacks.io") || rawString.includes("c_mt5yy2u52c6dh4ra3p")) {
    return "dorahacks";
  }
  if (rawString.includes("devfolio.co") || rawString.includes("c_mt5xu60s2cvbgtd10z")) {
    return "devfolio";
  }
  if (rawString.includes("mlh.com") || rawString.includes("c_mt5sss7b1zrfcv5qax")) {
    return "mlh";
  }
  if (rawString.includes("unstop.com") || rawString.includes("c_mt5nm4f1bwbf79hrg")) {
    return "unstop";
  }

  return "devfolio";
}

/**
 * Webhook endpoint to receive completed scraped datasets from Bright Data DCA.
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platformParam = searchParams.get("platform");

    const body = await request.json();
    let items: any[] = [];

    if (Array.isArray(body)) {
      items = body;
    } else if (body && Array.isArray(body.data)) {
      items = body.data;
    } else if (body && Array.isArray(body.hackathons)) {
      items = [body];
    } else if (body) {
      items = [body];
    }

    const platform = detectPlatform(body, platformParam);
    console.log(`[Webhook] Received ${items.length} items for platform: ${platform}`);

    const normalized = normalizeScrapedData(platform, items);
    const result = await ingestHackathonsToSupabase(platform, normalized, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, platform },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      platform,
      receivedItems: items.length,
      upsertedCount: result.upsertedCount,
      processedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Webhook] Error processing Bright Data payload:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process webhook payload" },
      { status: 500 }
    );
  }
}
