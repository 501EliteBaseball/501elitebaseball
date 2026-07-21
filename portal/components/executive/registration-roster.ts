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

