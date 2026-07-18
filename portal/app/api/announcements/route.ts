import { NextResponse } from "next/server";
import { requireScheduleStaff } from "@/lib/schedule/require-schedule-staff";
import { sendPushNotification } from "@/lib/notifications/push";

export async function POST(request: Request) {
  const auth = await requireScheduleStaff(request);
  if (!auth) return NextResponse.json({ error: "Staff access required." }, { status: 403 });
  const body = await request.json();
  if (!body.title?.trim() || !body.body?.trim()) {
    return NextResponse.json({ error: "Title and message are required." }, { status: 400 });
  }
  const row = {
    title: String(body.title).trim().slice(0, 120),
    body: String(body.body).trim().slice(0, 2000),
    priority: ["normal", "important", "urgent"].includes(body.priority) ? body.priority : "normal",
    status: body.status === "published" ? "published" : "draft",
    audience: ["all", "families", "staff"].includes(body.audience) ? body.audience : "families",
    link_label: String(body.link_label ?? "").trim().slice(0, 60),
    link_url: String(body.link_url ?? "").trim().slice(0, 500),
    publish_at: body.publish_at ? new Date(body.publish_at).toISOString() : new Date().toISOString(),
    expires_at: body.expires_at ? new Date(body.expires_at).toISOString() : null,
    created_by: auth.user.id,
  };
  const { data, error } = await auth.s.from("team_announcements").insert(row).select("id").single();
  const publishesNow = row.status === "published" && new Date(row.publish_at) <= new Date() && row.audience !== "staff";
  if (!error && publishesNow) {
    await sendPushNotification({ title: row.title, body: row.body.slice(0, 180), url: "/dashboard/messages" });
  }
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ id: data.id });
}
