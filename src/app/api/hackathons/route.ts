import { NextResponse } from "next/server";
import { getAllHackathonsAsync, getHubStats } from "@/lib/dataLoader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const hackathons = await getAllHackathonsAsync();
    const stats = getHubStats(hackathons);

    return NextResponse.json({
      success: true,
      data: hackathons,
      stats,
    });
  } catch (error: any) {
    console.error("API /api/hackathons error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load hackathons" },
      { status: 500 }
    );
  }
}
