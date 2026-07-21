"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  FileWarning,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import NotificationCard from "@/components/app/NotificationCard";
import {
  registrationForRosterPlayer,
  TEAM_ROSTER,
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

export default function ExecutiveDashboard() {
  const [membership, setMembership] = useState<OrganizationMember | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [registrations, setRegistrations] = useState<ExecutiveRegistration[]>([]);
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
      const [registrationRows, memberRows] = await Promise.all([
        loadExecutiveRegistrations(),
        currentMembership.role === "admin"
          ? loadOrganizationMembers()
          : Promise.resolve([]),
      ]);
      setMembership(currentMembership);
      setRegistrations(registrationRows);
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

  const completeRegistrations = useMemo(
    () =>
      registrations.filter(
        (item) =>
          item.status === "submitted" &&
          item.releaseCount === 6 &&
          item.birthCertificateStatus !== "missing",
      ).length,
    [registrations],
  );

  const rosterStatus = useMemo(
    () =>
      TEAM_ROSTER.map((playerName) => ({
        playerName,
        registration: registrationForRosterPlayer(playerName, registrations),
      })),
    [registrations],
  );
  const unregisteredPlayers = rosterStatus.filter((item) => !item.registration);
  const registrationsStarted = rosterStatus.length - unregisteredPlayers.length;

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
          <Metric label="Team roster" value={TEAM_ROSTER.length} />
          <Metric label="Registration started" value={registrationsStarted} />
          <Metric label="Not registered" value={unregisteredPlayers.length} />
          <Metric label="Launch complete" value={completeRegistrations} />
        </div>
      </div>

      <RosterRegistrationTracker registrations={registrations} />

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
}: {
  registrations: ExecutiveRegistration[];
}) {
  const rosterStatus = TEAM_ROSTER.map((playerName) => ({
    playerName,
    registration: registrationForRosterPlayer(playerName, registrations),
  }));
  const missing = rosterStatus.filter((item) => !item.registration);
  const started = rosterStatus.filter((item) => item.registration);

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
            Automatically matched against Family OS registration records.
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
                className="flex min-h-12 items-center gap-3 rounded-2xl border border-red-200 bg-white px-4 py-3 font-semibold text-slate-900"
              >
                <CircleAlert className="h-5 w-5 shrink-0 text-[#D7193F]" />
                {playerName}
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
            {started.map(({ playerName, registration }) => (
              <div key={playerName} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <span className="flex items-center gap-2 font-semibold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {playerName}
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {registration?.status}
                </span>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </section>
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
