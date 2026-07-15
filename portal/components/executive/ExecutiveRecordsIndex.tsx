"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Database } from "lucide-react";
import {
  loadCurrentMembership,
  loadExecutiveRegistrations,
  type ExecutiveRegistration,
} from "@/lib/executive/executive-service";

export default function ExecutiveRecordsIndex() {
  const [registrations, setRegistrations] = useState<ExecutiveRegistration[]>([]);
  const [status, setStatus] = useState("Loading registration database…");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadRecords();
  }, []);

  async function loadRecords() {
    try {
      await loadCurrentMembership();
      setRegistrations(await loadExecutiveRegistrations());
      setStatus("");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Registration records could not be loaded.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <a
        href="/executive"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-[#123E74]"
      >
        <ArrowLeft className="h-4 w-4" />
        Executive dashboard
      </a>

      <section className="mt-5 rounded-[32px] bg-[#071D39] p-7 text-white shadow-xl sm:p-10">
        <Database className="h-9 w-9 text-red-300" />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-red-300">
          Secure operations
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Registration database</h1>
        <p className="mt-3 max-w-2xl text-blue-100">
          Open a complete family record, review every submitted section, and
          retrieve authorized private documents.
        </p>
      </section>

      {error ? (
        <div className="mt-5 rounded-3xl border border-red-200 bg-white p-7 text-red-700">
          {error}
        </div>
      ) : null}

      {status ? (
        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-7 text-slate-600">
          {status}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        {registrations.map((registration) => (
          <a
            key={registration.id}
            href={`/executive/records/${registration.id}`}
            className="flex flex-col gap-4 rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#123E74] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D7193F]">
                {registration.familyName}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {registration.playerName}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {registration.parentName} · {registration.parentEmail}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Releases {registration.releaseCount}/6 · Birth certificate{" "}
                {registration.birthCertificateStatus}
              </p>
            </div>
            <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#123E74] px-5 text-sm font-bold text-white">
              Open record
              <ArrowRight className="h-4 w-4" />
            </span>
          </a>
        ))}

        {!status && !registrations.length ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No registration records found.
          </div>
        ) : null}
      </div>
    </div>
  );
}
