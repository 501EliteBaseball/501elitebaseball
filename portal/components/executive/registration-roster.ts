import type { ExecutiveRegistration } from "@/lib/executive/executive-service";

export const TEAM_ROSTER = [
  "Billy Dawson",
  "Boston Grimmett",
  "Carter Brown",
  "Cache Scott",
  "Dan Wiley",
  "Dawson Frechette",
  "Jack Thomas",
  "Jackson Chambers",
  "Jesse George",
  "Junior Gillespie",
  "Parker Willingham",
  "Sonny Mills",
  "Zeke French",
] as const;

export type TeamRosterName = (typeof TEAM_ROSTER)[number];

export type TeamRosterPlayer = {
  playerName: TeamRosterName;
  active: boolean;
  changedAt: string | null;
};

export type TeamRosterAuditEvent = {
  id: number;
  action: string;
  details: unknown;
  occurred_at: string;
};

export function isTeamRosterName(value: unknown): value is TeamRosterName {
  return (
    typeof value === "string" &&
    TEAM_ROSTER.some((playerName) => playerName === value)
  );
}

export function rosterPlayersFromAudit(
  events: TeamRosterAuditEvent[],
): TeamRosterPlayer[] {
  const latestState = new Map<
    TeamRosterName,
    { active: boolean; changedAt: string }
  >();

  for (const event of events) {
    if (
      event.action !== "roster.removed" &&
      event.action !== "roster.restored"
    ) {
      continue;
    }

    const details =
      event.details && typeof event.details === "object"
        ? (event.details as Record<string, unknown>)
        : null;
    const playerName = details?.player_name;

    if (!isTeamRosterName(playerName)) continue;

    latestState.set(playerName, {
      active: event.action === "roster.restored",
      changedAt: event.occurred_at,
    });
  }

  return TEAM_ROSTER.map((playerName) => {
    const state = latestState.get(playerName);
    return {
      playerName,
      active: state?.active ?? true,
      changedAt: state?.changedAt ?? null,
    };
  });
}

function normalizeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function registrationForRosterPlayer(
  playerName: string,
  registrations: ExecutiveRegistration[],
) {
  const rosterName = normalizeName(playerName);

  return registrations.find((registration) => {
    const structuredName = [
      registration.player.first_name,
      registration.player.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return [structuredName, registration.playerName].some(
      (candidate) => normalizeName(candidate) === rosterName,
    );
  });
}
