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

export type TeamRosterName = string;

export type TeamRosterPlayer = {
  playerName: TeamRosterName;
  active: boolean;
  changedAt: string | null;
  registrationOverride: boolean | null;
};

export type TeamRosterAuditEvent = {
  id: number;
  action: string;
  details: unknown;
  occurred_at: string;
};

export function isValidRosterPlayerName(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length >= 2 &&
    value.trim().length <= 120
  );
}

export function rosterPlayersFromAudit(
  events: TeamRosterAuditEvent[],
): TeamRosterPlayer[] {
  const players = new Map<string, TeamRosterPlayer>(
    TEAM_ROSTER.map((playerName) => [
      playerName.toLocaleLowerCase(),
      {
        playerName,
        active: true,
        changedAt: null,
        registrationOverride: null,
      },
    ]),
  );

  for (const event of events) {
    const details =
      event.details && typeof event.details === "object"
        ? (event.details as Record<string, unknown>)
        : null;
    const rawPlayerName = details?.player_name;
    if (!isValidRosterPlayerName(rawPlayerName)) continue;

    const playerName = rawPlayerName.trim();
    const key = playerName.toLocaleLowerCase();
    const existing = players.get(key);

    if (event.action === "roster.added") {
      if (!existing) {
        players.set(key, {
          playerName,
          active: true,
          changedAt: event.occurred_at,
          registrationOverride: null,
        });
      }
      continue;
    }

    if (!existing) continue;

    if (event.action === "roster.removed") {
      players.set(key, { ...existing, active: false, changedAt: event.occurred_at });
    } else if (event.action === "roster.restored") {
      players.set(key, { ...existing, active: true, changedAt: event.occurred_at });
    } else if (event.action === "registration.marked_registered") {
      players.set(key, { ...existing, registrationOverride: true });
    } else if (event.action === "registration.marked_unregistered") {
      players.set(key, { ...existing, registrationOverride: false });
    } else if (event.action === "registration.override_cleared") {
      players.set(key, { ...existing, registrationOverride: null });
    }
  }

  return [...players.values()].sort((a, b) =>
    a.playerName.localeCompare(b.playerName),
  );
}

function normalizeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((part) => (part === "jr" ? "junior" : part))
    .join("");
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
