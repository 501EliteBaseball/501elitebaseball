import {
  rosterPlayersFromAudit,
  type TeamRosterAuditEvent,
  type TeamRosterName,
  type TeamRosterPlayer,
} from "@/components/executive/registration-roster";
import { supabaseBrowser } from "@/lib/supabase-browser";

export type TeamRosterAction = "remove" | "restore";

export async function loadTeamRoster(): Promise<TeamRosterPlayer[]> {
  const { data, error } = await supabaseBrowser
    .from("registration_audit_log")
    .select("id, action, details, occurred_at")
    .in("action", ["roster.removed", "roster.restored"])
    .order("occurred_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw error;

  return rosterPlayersFromAudit(
    (data ?? []) as TeamRosterAuditEvent[],
  );
}

export async function updateTeamRosterPlayer(
  playerName: TeamRosterName,
  action: TeamRosterAction,
) {
  const { data: sessionData } = await supabaseBrowser.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error("Please sign in again to update the roster.");
  }

  const response = await fetch("/api/executive/roster", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ action, playerName }),
  });
  const result = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(result?.error || "The roster could not be updated.");
  }
}
