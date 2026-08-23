import axios from "axios";
import { PlatformType } from "@/types/hackathon";

export interface BrightDataCollectorConfig {
  platform: PlatformType;
  collectorId: string;
  targetUrl: string;
  name: string;
}

export const BRIGHT_DATA_COLLECTORS: Record<PlatformType, BrightDataCollectorConfig> = {
  unstop: {
    platform: "unstop",
    collectorId: "c_mt5nm4f1bwbf79hrg",
    targetUrl: "https://unstop.com/hackathons?oppstatus=open&usertype=fresher&fresherPassingOutYear=2025",
    name: "Unstop Freshers Hackathons",
  },
  dorahacks: {
    platform: "dorahacks",
    collectorId: "c_mt5yy2u52c6dh4ra3p",
    targetUrl: "https://dorahacks.io/hackathon",
    name: "DoraHacks Global Hackathons",
  },
  devfolio: {
    platform: "devfolio",
    collectorId: "c_mt5xu60s2cvbgtd10z",
    targetUrl: "https://devfolio.co/hackathons",
    name: "Devfolio Community Hackathons",
  },
  mlh: {
    platform: "mlh",
    collectorId: "c_mt5sss7b1zrfcv5qax",
    targetUrl: "https://www.mlh.com/seasons/2027/events",
    name: "Major League Hacking Season Events",
  },
  wemakedevs: {
    platform: "wemakedevs",
    collectorId: "c_mt62dad22g0jvfi8gl",
    targetUrl: "https://www.wemakedevs.org/hackathons",
    name: "WeMakeDevs Community Hackathons",
  },
};

const BRIGHT_DATA_API_TOKEN = process.env.BRIGHT_DATA_API_TOKEN || "";

/**
 * Triggers a single Bright Data DCA collector
 */
export async function triggerBrightDataCollector(
  platform: PlatformType,
  webhookUrl?: string
): Promise<{ success: boolean; platform: PlatformType; responseId?: string; error?: string }> {
  const config = BRIGHT_DATA_COLLECTORS[platform];
  if (!config) {
    return { success: false, platform, error: `Invalid platform: ${platform}` };
  }

  if (!BRIGHT_DATA_API_TOKEN) {
    return {
      success: false,
      platform,
      error: "BRIGHT_DATA_API_TOKEN environment variable is not configured.",
    };
  }

  let endpoint = `https://api.brightdata.com/dca/trigger?collector=${config.collectorId}&queue_next=1`;
  if (webhookUrl) {
    endpoint += `&deliver_webhook=${encodeURIComponent(webhookUrl)}`;
  }

  const payload = [{ url: config.targetUrl }];

  try {
    const response = await axios.post(endpoint, payload, {
      headers: {
        Authorization: `Bearer ${BRIGHT_DATA_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    const responseId =
      response.data?.response_id ||
      response.data?.collection_id ||
      response.data?.id ||
      (typeof response.data === "string" ? response.data : undefined);

    return {
      success: true,
      platform,
      responseId,
    };
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.message || err.response?.data || err.message || "Failed to trigger collector";
    console.error(`[BrightData] Error triggering collector for ${platform}:`, errorMsg);
    return {
      success: false,
      platform,
      error: errorMsg,
    };
  }
}

/**
 * Triggers all 5 collectors concurrently
 */
export async function triggerAllBrightDataCollectors(webhookUrl?: string) {
  const platforms: PlatformType[] = ["devfolio", "dorahacks", "mlh", "unstop", "wemakedevs"];
  const promises = platforms.map((p) => triggerBrightDataCollector(p, webhookUrl));
  return Promise.all(promises);
}

/**
 * Fetches the scraped result dataset from Bright Data by collection/response ID
 */
export async function getBrightDataResult(responseId: string): Promise<any> {
  if (!BRIGHT_DATA_API_TOKEN) {
    throw new Error("BRIGHT_DATA_API_TOKEN is not configured.");
  }

  const endpoint = `https://api.brightdata.com/dca/get_result?response_id=${responseId}`;
  const response = await axios.get(endpoint, {
    headers: {
      Authorization: `Bearer ${BRIGHT_DATA_API_TOKEN}`,
    },
    timeout: 30000,
  });

  return response.data;
}

/**
 * Checks progress of a running collector
 */
export async function getBrightDataProgress(responseId: string): Promise<any> {
  if (!BRIGHT_DATA_API_TOKEN) {
    throw new Error("BRIGHT_DATA_API_TOKEN is not configured.");
  }

  const endpoint = `https://api.brightdata.com/dca/get_progress?response_id=${responseId}`;
  const response = await axios.get(endpoint, {
    headers: {
      Authorization: `Bearer ${BRIGHT_DATA_API_TOKEN}`,
    },
    timeout: 10000,
  });

  return response.data;
}
