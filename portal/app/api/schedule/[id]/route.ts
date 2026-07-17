import { NextResponse } from "next/server";
import { requireScheduleStaff } from "@/lib/schedule/require-schedule-staff";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireScheduleStaff(request);
  if (!auth) return NextResponse.json({ error: "Staff access required." }, { status: 403 });

  const { id } = await params;
  const body = (await request.json()) as { status?: string };
  if (!body.status || !["scheduled", "cancelled"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid event status." }, { status: 400 });
  }

  const { error } = await auth.s
    .from("schedule_events")
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq("id", id);

  return error
    ? NextResponse.json({ error: error.message }, { status: 500 })
    : NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Context) {
  const auth = await requireScheduleStaff(request);
  if (!auth) return NextResponse.json({ error: "Staff access required." }, { status: 403 });

  const { id } = await params;
  const { error } = await auth.s.from("schedule_events").delete().eq("id", id);
  return error
    ? NextResponse.json({ error: error.message }, { status: 500 })
    : NextResponse.json({ ok: true });
}
