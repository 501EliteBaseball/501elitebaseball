export const ANNOUNCEMENT_AUDIENCE = "public_homepage" as const;

export type AnnouncementPriority = "normal" | "important" | "urgent";

export type Announcement = {
  id: string;
  audience: typeof ANNOUNCEMENT_AUDIENCE;
  title: string;
  message: string;
  button_text: string | null;
  link_url: string | null;
  priority: AnnouncementPriority;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type AnnouncementInput = Pick<
  Announcement,
  | "title"
  | "message"
  | "button_text"
  | "link_url"
  | "priority"
  | "active"
  | "starts_at"
  | "ends_at"
  | "display_order"
>;
