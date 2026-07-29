import { NextResponse } from "next/server";
import { isValidRosterPlayerName } from "@/components/executive/registration-roster";
import { requireExecutive } from "@/lib/executive/require-executive";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

type RosterRequest = {
  action?: unknown;
  playerName?: unknown;
};

const ACTIONS = {
  add: "roster.added",
  remove: "roster.removed",
  restore: "roster.restored",
  mark_registered: "registration.marked_registered",
  mark_unregistered: "registration.marked_unregistered",
  clear_registration_override: "registration.override_cleared",
} as const;

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

  const action =
    typeof body.action === "string" && body.action in ACTIONS
      ? (body.action as keyof typeof ACTIONS)
      : null;
  if (!action || !isValidRosterPlayerName(body.playerName)) {
    return NextResponse.json(
      { error: "Choose a valid roster player and action." },
      { status: 400 },
    );
  }

  const playerName = body.playerName.trim();
  const auditAction = ACTIONS[action];
  const { error } = await createSupabaseAdmin()
    .from("registration_audit_log")
    .insert({
      actor_user_id: authorization.user.id,
      action: auditAction,
      details: {
        player_name: playerName,
        season: "2026-2027",
        source: "executive_roster",
      },
    });

  if (error) {
    console.error("Executive roster update failed", {
      action: auditAction,
      playerName,
      error,
    });
    return NextResponse.json(
      { error: "The roster could not be updated. No records were changed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, action, playerName });
}
