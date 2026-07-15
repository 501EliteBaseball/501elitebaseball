"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import ExecutiveRegistrationDetail from "@/components/executive/ExecutiveRegistrationDetail";
import {
  loadCurrentMembership,
  loadExecutiveRegistrations,
  type ExecutiveRegistration,
  type OrganizationMember,
} from "@/lib/executive/executive-service";

export default function ExecutiveRecordView({ registrationId }: { registrationId: string }) {
  const [membership, setMembership] = useState<OrganizationMember | null>(null);
  const [registration, setRegistration] = useState<ExecutiveRegistration | null>(null);
  const [status, setStatus] = useState("Loading complete registration record…");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadRecord();
  }, [registrationId]);

  async function loadRecord() {
    try {
      const currentMembership = await loadCurrentMembership();
      const registrations = await loadExecutiveRegistrations();
      const currentRegistration = registrations.find(
        (item) => item.id === registrationId,
      );

      if (!currentRegistration) {
        throw new Error("This registration record was not found.");
      }

      setMembership(currentMembership);
      setRegistration(currentRegistration);
      setStatus("");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "The registration record could not be loaded.",
      );
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center text-red-700 shadow-lg">
        {error}
      </div>
    );
  }

  if (!membership || !registration) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-lg">
        {status}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <a
        href="/executive"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-[#123E74]"
      >
        <ArrowLeft className="h-4 w-4" />
        Executive dashboard
      </a>

      <article className="mt-5 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D7193F]">
          Complete registration record
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          {registration.playerName}
        </h1>
        <p className="mt-2 text-slate-500">
          {registration.familyName} · {registration.parentEmail}
        </p>

        <ExecutiveRegistrationDetail
          registration={registration}
          membership={membership}
        />
      </article>
    </div>
  );
}
