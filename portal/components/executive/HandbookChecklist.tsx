"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, CheckCircle2, Circle } from "lucide-react";
import { loadExecutiveRegistrations } from "@/lib/executive/executive-service";

const STORAGE_KEY = "501-elite-handbooks-received-2026-2027";

type Athlete = {
  id: string;
  lastName: string;
};

export default function HandbookChecklist() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [received, setReceived] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Record<string, boolean>) : {};
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return {};
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadExecutiveRegistrations()
      .then((registrations) => {
        setAthletes(
          registrations
            .filter((registration) => registration.status === "submitted")
            .map((registration) => ({
              id: registration.player.id || registration.id,
              lastName: registration.player.last_name || registration.playerName.split(" ").at(-1) || "Athlete",
            }))
            .sort((a, b) => a.lastName.localeCompare(b.lastName)),
        );
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "The handbook list could not be loaded.");
      })
      .finally(() => setLoading(false));
  }, []);

  const completed = useMemo(
    () => athletes.filter((athlete) => received[athlete.id]).length,
    [athletes, received],
  );

  function toggleAthlete(id: string) {
    setReceived((current) => {
      const next = { ...current, [id]: !current[id] };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <section className="mx-auto mb-7 max-w-6xl overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 bg-[#123E74] px-5 py-5 text-white sm:px-7">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
            <BookOpenCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">Quick checklist</p>
            <h2 className="text-xl font-semibold">Handbooks received</h2>
          </div>
        </div>
        <div className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#123E74]">
          {completed}/{athletes.length}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {loading ? <p className="py-4 text-center text-sm text-slate-500">Loading roster…</p> : null}
        {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

        {!loading && !error ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {athletes.map((athlete) => {
              const checked = Boolean(received[athlete.id]);
              return (
                <button
                  key={athlete.id}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => toggleAthlete(athlete.id)}
                  className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 text-left text-base font-bold transition active:scale-[0.98] ${
                    checked
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-slate-50 text-slate-800"
                  }`}
                >
                  {checked ? <CheckCircle2 className="h-6 w-6 shrink-0" /> : <Circle className="h-6 w-6 shrink-0 text-slate-400" />}
                  <span className={checked ? "line-through opacity-75" : ""}>{athlete.lastName}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {!loading && !error && !athletes.length ? (
          <p className="py-4 text-center text-sm text-slate-500">No submitted athletes were found.</p>
        ) : null}

        <p className="mt-4 text-center text-xs text-slate-400">Saved automatically on this device.</p>
      </div>
    </section>
  );
}
