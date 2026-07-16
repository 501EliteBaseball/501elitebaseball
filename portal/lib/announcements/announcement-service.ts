"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";
import { loadCurrentMembership } from "@/lib/executive/executive-service";
import {
  ANNOUNCEMENT_AUDIENCE,
  type Announcement,
  type AnnouncementInput,
} from "@/lib/announcements/announcement-types";

const announcementColumns =
  "id, audience, title, message, button_text, link_url, priority, active, starts_at, ends_at, display_order, created_at, updated_at";

async function requireAnnouncementAccess() {
  return loadCurrentMembership();
}

export async function loadAnnouncements(): Promise<Announcement[]> {
  await requireAnnouncementAccess();

  const { data, error } = await supabaseBrowser
    .from("announcements")
    .select(announcementColumns)
    .eq("audience", ANNOUNCEMENT_AUDIENCE)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Announcement[];
}

export async function createAnnouncement(input: AnnouncementInput) {
  await requireAnnouncementAccess();

  const { error } = await supabaseBrowser.from("announcements").insert({
    ...input,
    audience: ANNOUNCEMENT_AUDIENCE,
  });

  if (error) throw error;
}

export async function updateAnnouncement(id: string, input: AnnouncementInput) {
  await requireAnnouncementAccess();

  const { error } = await supabaseBrowser
    .from("announcements")
    .update(input)
    .eq("id", id)
    .eq("audience", ANNOUNCEMENT_AUDIENCE);

  if (error) throw error;
}

export async function setAnnouncementActive(id: string, active: boolean) {
  await requireAnnouncementAccess();

  const { error } = await supabaseBrowser
    .from("announcements")
    .update({ active })
    .eq("id", id)
    .eq("audience", ANNOUNCEMENT_AUDIENCE);

  if (error) throw error;
}

export async function deleteAnnouncement(id: string) {
  await requireAnnouncementAccess();

  const { error } = await supabaseBrowser
    .from("announcements")
    .delete()
    .eq("id", id)
    .eq("audience", ANNOUNCEMENT_AUDIENCE);

  if (error) throw error;
}

export async function swapAnnouncementOrder(
  first: Pick<Announcement, "id" | "display_order">,
  second: Pick<Announcement, "id" | "display_order">,
) {
  await requireAnnouncementAccess();

  const { error } = await supabaseBrowser.rpc(
    "swap_homepage_announcement_order",
    {
      first_announcement_id: first.id,
      second_announcement_id: second.id,
    },
  );

  if (error) throw error;
}
