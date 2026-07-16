import "server-only";

import { createSupabaseServer } from "@/lib/supabase-server";
import {
  ANNOUNCEMENT_AUDIENCE,
  type Announcement,
} from "@/lib/announcements/announcement-types";

const announcementColumns =
  "id, audience, title, message, button_text, link_url, priority, active, starts_at, ends_at, display_order, created_at, updated_at";

export async function loadPublicHomepageAnnouncements(): Promise<Announcement[]> {
  const supabase = await createSupabaseServer();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("announcements")
    .select(announcementColumns)
    .eq("audience", ANNOUNCEMENT_AUDIENCE)
    .eq("active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data ?? []) as Announcement[];
}
