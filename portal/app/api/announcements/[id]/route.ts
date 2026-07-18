import { NextResponse } from "next/server";
import { requireScheduleStaff } from "@/lib/schedule/require-schedule-staff";
import { sendPushNotification } from "@/lib/notifications/push";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireScheduleStaff(request);
  if (!auth) return NextResponse.json({ error: "Staff access required." }, { status: 403 });
  const { id } = await params;
  const body = await request.json() as { status?: string };
  if (!body.status || !["draft", "published"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid announcement status." }, { status: 400 });
  }
  const { data, error } = await auth.s.from("team_announcements")
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq("id", id).select("title,body,audience,publish_at").single();
  if (!error && body.status === "published" && data.audience !== "staff" && new Date(data.publish_at) <= new Date()) {
    await sendPushNotification({ title: data.title, body: data.body.slice(0, 180), url: "/dashboard/messages" });
  }
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Context) {
  const auth = await requireScheduleStaff(request);
  if (!auth) return NextResponse.json({ error: "Staff access required." }, { status: 403 });
  const { id } = await params;
  const { error } = await auth.s.from("team_announcements").delete().eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
}
