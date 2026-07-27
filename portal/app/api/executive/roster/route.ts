import { NextResponse } from "next/server";
import { isTeamRosterName } from "@/components/executive/registration-roster";
import { requireExecutive } from "@/lib/executive/require-executive";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

type RosterRequest = {
  action?: unknown;
  playerName?: unknown;
};

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  }

  const authorization = await requireExecutive(request);
  if ("error" in authorization) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  let body: RosterRequest;
  try {
    body = (await request.json()) as RosterRequest;
  } catch {
    return NextResponse.json(
      { error: "A valid roster request is required." },
      { status: 400 },
    );
  }

  if (
    !isTeamRosterName(body.playerName) ||
    (body.action !== "remove" && body.action !== "restore")
  ) {
    return NextResponse.json(
      { error: "Choose a valid roster player and action." },
      { status: 400 },
    );
  }

  const auditAction =
    body.action === "remove" ? "roster.removed" : "roster.restored";
  const { error } = await createSupabaseAdmin()
    .from("registration_audit_log")
    .insert({
      actor_user_id: authorization.user.id,
      action: auditAction,
      details: {
        player_name: body.playerName,
        season: "2026-2027",
        source: "executive_roster",
      },
    });

  if (error) {
    console.error("Executive roster update failed", {
      action: auditAction,
      playerName: body.playerName,
      error,
    });
    return NextResponse.json(
      { error: "The roster could not be updated. No records were changed." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    action: body.action,
    playerName: body.playerName,
  });
}
