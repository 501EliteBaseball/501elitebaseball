"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  FileWarning,
  LoaderCircle,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import NotificationCard from "@/components/app/NotificationCard";
import {
  registrationForRosterPlayer,
  type TeamRosterName,
  type TeamRosterPlayer,
} from "@/components/executive/registration-roster";
import {
  grantOrganizationAccess,
  loadCurrentMembership,
  loadExecutiveRegistrations,
  loadOrganizationMembers,
  revokeOrganizationAccess,
  type ExecutiveRegistration,
  type OrganizationMember,
} from "@/lib/executive/executive-service";
import {
  loadTeamRoster,
  updateTeamRosterPlayer,
  type TeamRosterAction,
} from "@/lib/executive/roster-service";

export default function ExecutiveDashboard() {
  const [membership, setMembership] = useState<OrganizationMember | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [registrations, setRegistrations] = useState<ExecutiveRegistration[]>([]);
  const [rosterPlayers, setRosterPlayers] = useState<TeamRosterPlayer[]>([]);
  const [rosterActionPlayer, setRosterActionPlayer] =
    useState<TeamRosterName | null>(null);
  const [rosterNotice, setRosterNotice] = useState("");
  const [rosterError, setRosterError] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      setError("");
      const currentMembership = await loadCurrentMembership();
      const [registrationRows, rosterRows, memberRows] = await Promise.all([
        loadExecutiveRegistrations(),
        loadTeamRoster(),
        currentMembership.role === "admin"
          ? loadOrganizationMembers()
          : Promise.resolve([]),
      ]);
      setMembership(currentMembership);
      setRegistrations(registrationRows);
      setRosterPlayers(rosterRows);
      setMembers(memberRows);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Executive data could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  const rosterStatus = useMemo(
    () =>
      rosterPlayers
        .filter((player) => player.active)
        .map((player) => {
          const registration = registrationForRosterPlayer(
            player.playerName,
            registrations,
          );
          return {
            ...player,
            registration,
            registered:
              player.registrationOverride ?? Boolean(registration),
          };
        }),
    [registrations, rosterPlayers],
  );
  const unregisteredPlayers = rosterStatus.filter((item) => !item.registered);
  const registrationsStarted = rosterStatus.length - unregisteredPlayers.length;
  const completeRegistrations = rosterStatus.filter(
    ({ registration }) =>
      registration?.status === "submitted" &&
      registration.releaseCount === 6 &&
      registration.birthCertificateStatus !== "missing",
  ).length;

  async function changeRosterPlayer(
    playerName: TeamRosterName,
    action: TeamRosterAction,
  ) {
    try {
      setRosterActionPlayer(playerName);
      setRosterError("");
      setRosterNotice("");
      await updateTeamRosterPlayer(playerName, action);
      setRosterPlayers(await loadTeamRoster());
      const messages: Record<TeamRosterAction, string> = {
        add: `${playerName} was added to the roster.`,
        remove: `${playerName} was removed from the active roster. Their records were preserved.`,
        restore: `${playerName} was restored to the active roster.`,
        mark_registered: `${playerName} was manually marked registered.`,
        mark_unregistered: `${playerName} was manually marked not registered.`,
        clear_registration_override: `${playerName} now follows automatic registration matching.`,
      };
      setRosterNotice(messages[action]);
    } catch (actionError) {
      setRosterError(
        actionError instanceof Error
          ? actionError.message
          : "The roster could not be updated.",
      );
    } finally {
      setRosterActionPlayer(null);
    }
  }

  async function addRosterPlayer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const playerName = newPlayerName.trim();
    if (!playerName) return;
    await changeRosterPlayer(playerName, "add");
    setNewPlayerName("");
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl p-8 text-slate-600">Loading executive dashboard…</div>;
  }

  if (error || !membership) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center text-red-700 shadow-lg">
        {error || "Executive access is required."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-[32px] bg-[#071D39] p-7 text-white shadow-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-300">
          501 Elite OS
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Executive registration</h1>
        <p className="mt-3 max-w-2xl text-blue-100">
          Track submitted registrations, releases, and required documents.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Metric label="Team roster" value={rosterStatus.length} />
          <Metric label="Registration started" value={registrationsStarted} />
          <Metric label="Not registered" value={unregisteredPlayers.length} />
          <Metric label="Launch complete" value={completeRegistrations} />
        </div>
      </div>

      <RosterRegistrationTracker
        registrations={registrations}
        rosterPlayers={rosterPlayers}
        actionPlayer={rosterActionPlayer}
        notice={rosterNotice}
        error={rosterError}
        newPlayerName={newPlayerName}
        onNewPlayerNameChange={setNewPlayerName}
        onAddPlayer={addRosterPlayer}
        onChange={changeRosterPlayer}
      />

      <div className="mt-5">
        <NotificationCard />
      </div>

      <div className="mt-7 grid gap-4">
        {registrations.map((registration) => {
          const releasesComplete = registration.releaseCount === 6;
          const documentComplete =
            registration.birthCertificateStatus !== "missing";

          return (
            <article
              key={registration.id}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7193F]">
                    {registration.familyName}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    {registration.playerName}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Parent: {registration.parentName} · {registration.parentEmail}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    DOB: {registration.dateOfBirth} · Season {registration.season}
                  </p>
                </div>

                <span className="self-start rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700">
                  {registration.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <RequirementStatus
                  complete={releasesComplete}
                  label={`Releases ${registration.releaseCount}/6`}
                />
                <RequirementStatus
                  complete={documentComplete}
                  label={
                    documentComplete
                      ? `Birth certificate: ${registration.birthCertificateStatus}`
                      : "Birth certificate missing"
                  }
                />
              </div>
            </article>
          );
        })}

        {!registrations.length ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No registrations found.
          </div>
        ) : null}
      </div>

      {membership.role === "admin" ? (
        <AccessManager members={members} onChanged={refresh} />
      ) : null}
    </div>
  );
}

function RosterRegistrationTracker({
  registrations,
  rosterPlayers,
  actionPlayer,
  notice,
  error,
  newPlayerName,
  onNewPlayerNameChange,
  onAddPlayer,
  onChange,
}: {
  registrations: ExecutiveRegistration[];
  rosterPlayers: TeamRosterPlayer[];
  actionPlayer: TeamRosterName | null;
  notice: string;
  error: string;
  newPlayerName: string;
  onNewPlayerNameChange: (value: string) => void;
  onAddPlayer: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onChange: (
    playerName: TeamRosterName,
    action: TeamRosterAction,
  ) => Promise<void>;
}) {
  const rosterStatus = rosterPlayers
    .filter((player) => player.active)
    .map((player) => {
      const registration = registrationForRosterPlayer(
        player.playerName,
        registrations,
      );
      return {
        ...player,
        registration,
        registered: player.registrationOverride ?? Boolean(registration),
      };
    });
  const removedPlayers = rosterPlayers.filter((player) => !player.active);
  const missing = rosterStatus.filter((item) => !item.registered);
  const started = rosterStatus.filter((item) => item.registered);

  async function removePlayer(playerName: TeamRosterName) {
    const confirmed = window.confirm(
      `Remove ${playerName} from the active roster?\n\nTheir family account, registration, documents, attendance history, and accounting records will be preserved.`,
    );
    if (confirmed) await onChange(playerName, "remove");
  }

  return (
    <section className="mt-7 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7193F]">
            2026–2027 team roster
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Registration tracker
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Automatically matched to Family OS, with manual controls when needed.
          </p>
          <p className="mt-2 text-xs font-medium text-slate-400">
            Removing a player only changes the active roster. Their records stay intact.
          </p>
        </div>
        <span
          className={`self-start rounded-full px-4 py-2 text-sm font-bold ${
            missing.length
              ? "bg-red-50 text-[#B31534]"
              : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {missing.length ? `${missing.length} not registered` : "Entire roster registered"}
        </span>
      </div>

      <form
        onSubmit={onAddPlayer}
        className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 p-6 sm:flex-row sm:p-8"
      >
        <input
          type="text"
          required
          minLength={2}
          maxLength={120}
          value={newPlayerName}
          onChange={(event) => onNewPlayerNameChange(event.target.value)}
          placeholder="Player first and last name"
          className="min-h-12 flex-1 rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-[#123E74]"
        />
        <button
          type="submit"
          disabled={Boolean(actionPlayer)}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#123E74] px-5 font-bold text-white disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add player
        </button>
      </form>

      {notice || error ? (
        <div
          aria-live="polite"
          className={`border-b px-6 py-4 text-sm font-semibold sm:px-8 ${
            error
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error || notice}
        </div>
      ) : null}

      {missing.length ? (
        <div className="bg-red-50/60 p-6 sm:p-8">
          <div className="flex items-center gap-3 text-[#9F1239]">
            <UserRoundX className="h-6 w-6" />
            <h3 className="text-lg font-bold">Still need to register</h3>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {missing.map(({ playerName }) => (
              <div
                key={playerName}
                className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-red-200 bg-white px-4 py-3 text-slate-900"
              >
                <span className="flex items-center gap-3 font-semibold">
                  <CircleAlert className="h-5 w-5 shrink-0 text-[#D7193F]" />
                  {playerName}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={actionPlayer === playerName}
                    onClick={() => void onChange(playerName, "mark_registered")}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 disabled:opacity-50"
                  >
                    Mark registered
                  </button>
                  <RosterRemoveButton
                    playerName={playerName}
                    busy={actionPlayer === playerName}
                    onRemove={removePlayer}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 bg-emerald-50 p-6 text-emerald-900 sm:p-8">
          <UserRoundCheck className="h-7 w-7 shrink-0" />
          <p className="font-semibold">Every player on the roster has started registration.</p>
        </div>
      )}

      {started.length ? (
        <details className="group p-6 sm:p-8">
          <summary className="cursor-pointer list-none font-bold text-[#123E74] marker:hidden">
            View {started.length} matched player{started.length === 1 ? "" : "s"}
          </summary>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {started.map(({ playerName, registration, registrationOverride }) => (
              <div key={playerName} className="flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2 font-semibold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {playerName}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {registrationOverride === true
                      ? "manual"
                      : registration?.status ?? "registered"}
                  </span>
                  <button
                    type="button"
                    disabled={actionPlayer === playerName}
                    onClick={() => void onChange(playerName, "mark_unregistered")}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-50"
                  >
                    Mark not registered
                  </button>
                  {registrationOverride !== null ? (
                    <button
                      type="button"
                      disabled={actionPlayer === playerName}
                      onClick={() =>
                        void onChange(playerName, "clear_registration_override")
                      }
                      className="text-xs font-bold text-[#123E74] underline"
                    >
                      Use automatic
                    </button>
                  ) : null}
                  <RosterRemoveButton
                    playerName={playerName}
                    busy={actionPlayer === playerName}
                    onRemove={removePlayer}
                  />
                </span>
              </div>
            ))}
          </div>
        </details>
      ) : null}

      {removedPlayers.length ? (
        <details className="border-t border-slate-200 p-6 sm:p-8">
          <summary className="cursor-pointer list-none font-bold text-slate-600 marker:hidden">
            Removed from roster ({removedPlayers.length})
          </summary>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {removedPlayers.map(({ playerName }) => (
              <div
                key={playerName}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <span className="font-semibold text-slate-600">{playerName}</span>
                <button
                  type="button"
                  disabled={actionPlayer === playerName}
                  onClick={() => void onChange(playerName, "restore")}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-blue-200 bg-white px-3 text-xs font-bold text-[#123E74] transition hover:border-[#123E74] disabled:opacity-50"
                >
                  {actionPlayer === playerName ? (
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5" />
                  )}
                  Restore
                </button>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}

function RosterRemoveButton({
  playerName,
  busy,
  onRemove,
}: {
  playerName: TeamRosterName;
  busy: boolean;
  onRemove: (playerName: TeamRosterName) => Promise<void>;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void onRemove(playerName)}
      aria-label={`Remove ${playerName} from roster`}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-[#B31534] disabled:opacity-50"
    >
      {busy ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-blue-100">{label}</p>
    </div>
  );
}

function RequirementStatus({
  complete,
  label,
}: {
  complete: boolean;
  label: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
        complete
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      {complete ? (
        <CheckCircle2 className="h-5 w-5" />
      ) : (
        <FileWarning className="h-5 w-5" />
      )}
      {label}
    </div>
  );
}

function AccessManager({
  members,
  onChanged,
}: {
  members: OrganizationMember[];
  onChanged: () => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"coach" | "executive" | "admin">("coach");
  const [canViewMedical, setCanViewMedical] = useState(false);
  const [canViewDocuments, setCanViewDocuments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  async function grantAccess(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setStatus("");
      await grantOrganizationAccess({
        email,
        role,
        canViewMedical,
        canViewDocuments,
      });
      setEmail("");
      setStatus("Access updated.");
      await onChanged();
    } catch (grantError) {
      setStatus(
        grantError instanceof Error
          ? grantError.message
          : "Access could not be updated.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <UsersRound className="h-7 w-7 text-[#123E74]" />
        <div>
          <h2 className="text-2xl font-semibold">Delegated access</h2>
          <p className="mt-1 text-sm text-slate-500">
            The person must create a 501 Elite OS account before access can be granted.
          </p>
        </div>
      </div>

      <form onSubmit={grantAccess} className="mt-6 grid gap-4 lg:grid-cols-2">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Account email"
          className="rounded-2xl border border-slate-300 px-4 py-3"
        />

        <select
          value={role}
          onChange={(event) => {
            const nextRole = event.target.value as "coach" | "executive" | "admin";
            setRole(nextRole);
            if (nextRole === "coach") setCanViewDocuments(false);
          }}
          className="rounded-2xl border border-slate-300 px-4 py-3"
        >
          <option value="coach">Coach</option>
          <option value="executive">Executive</option>
          <option value="admin">Administrator</option>
        </select>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
          <input
            type="checkbox"
            checked={canViewMedical}
            onChange={(event) => setCanViewMedical(event.target.checked)}
          />
          May view medical and emergency information
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
          <input
            type="checkbox"
            disabled={role === "coach"}
            checked={canViewDocuments}
            onChange={(event) => setCanViewDocuments(event.target.checked)}
          />
          May view private registration documents
        </label>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#123E74] px-6 font-bold text-white disabled:opacity-50 lg:col-span-2"
        >
          <ShieldCheck className="h-4 w-4" />
          {saving ? "Saving…" : "Grant or update access"}
        </button>
      </form>

      {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}

      <div className="mt-7 space-y-3">
        {members.map((member) => (
          <div
            key={member.user_id}
            className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold capitalize">{member.role}</p>
              <p className="mt-1 break-all text-xs text-slate-500">
                {member.user_id}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Medical: {member.can_view_medical ? "yes" : "no"} · Documents:{" "}
                {member.can_view_documents ? "yes" : "no"} ·{" "}
                {member.active ? "active" : "inactive"}
              </p>
            </div>

            {member.active ? (
              <button
                type="button"
                onClick={async () => {
                  await revokeOrganizationAccess(member.user_id);
                  await onChanged();
                }}
                className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"
              >
                Revoke
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
