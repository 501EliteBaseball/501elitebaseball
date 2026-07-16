import { NextResponse } from "next/server";
import { loadPublicHomepageAnnouncements } from "@/lib/announcements/announcement-public";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const announcements = await loadPublicHomepageAnnouncements();

    return NextResponse.json(
      { announcements },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { announcements: [] },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}
