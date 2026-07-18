export type TeamAnnouncement = {
  id: string;
  title: string;
  body: string;
  priority: "normal" | "important" | "urgent";
  status: "draft" | "published";
  audience: "all" | "families" | "staff";
  link_label: string;
  link_url: string;
  publish_at: string;
  expires_at: string | null;
  created_at: string;
};
