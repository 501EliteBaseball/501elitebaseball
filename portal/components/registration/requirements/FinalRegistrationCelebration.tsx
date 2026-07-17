"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, CreditCard, Trophy } from "lucide-react";
import Link from "next/link";
import {
  loadBirthCertificate,
  loadRegistrationContext,
  loadReleaseAcceptances,
} from "@/lib/registration/registration-requirements-service";

type CompletionState = {
  playerName: string;
  releasesComplete: boolean;
  documentComplete: boolean;
};

const CONFETTI_COLORS = ["#D7193F", "#123E74", "#FF5B7C", "#2F6DB2", "#ffffff"];

export default function FinalRegistrationCelebration() {
  const [completion, setCompletion] = useState<CompletionState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCompletion() {
      try {
        const context = await loadRegistrationContext();
        const [releases, document] = await Promise.all([
          loadReleaseAcceptances(context.registrationId),
          loadBirthCertificate(context.registrationId),
        ]);

        setCompletion({
          playerName: context.playerName,
          releasesComplete:
            new Set(releases.map((item) => item.agreement_key)).size === 6,
          documentComplete: Boolean(document),
        });
      } catch (completionError) {
        setError(
          completionError instanceof Error
            ? completionError.message
            : "Completion status could not be loaded.",
        );
      }
    }

    void loadCompletion();
  }, []);

  const confetti = useMemo(
    () =>
      Array.from({ length: 72 }, (_, index) => ({
        id: index,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        left: (index * 37) % 100,
        delay: (index % 12) * 0.12,
        duration: 3.4 + (index % 7) * 0.22,
        rotation: (index * 47) % 360,
      })),
    [],
  );

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center text-red-700 shadow-lg">
        {error}
      </div>
    );
  }

  if (!completion) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-lg">
        Confirming registration completion…
      </div>
    );
  }

  if (!completion.releasesComplete || !completion.documentComplete) {
    return (
      <div className="mx-auto max-w-2xl rounded-[32px] border border-amber-200 bg-white p-8 text-center shadow-xl">
        <h1 className="text-3xl font-semibold text-slate-950">One more step.</h1>
        <p className="mt-3 text-slate-600">
          Complete both requirements before finalizing registration.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link href="/registration/releases" className="rounded-full bg-[#D7193F] px-6 py-4 font-bold" style={{ color: "#ffffff" }}>
            Complete releases
          </Link>
          <Link href="/registration/documents" className="rounded-full bg-[#123E74] px-6 py-4 font-bold" style={{ color: "#ffffff" }}>
            Upload birth certificate
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[36px] border border-white bg-[linear-gradient(145deg,#071D39,#123E74)] p-7 text-center text-white shadow-[0_36px_120px_rgba(7,29,57,0.38)] sm:p-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="elite-confetti-piece"
            style={{
              backgroundColor: piece.color,
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              transform: `rotate(${piece.rotation}deg)`,
            }}
          />
        ))}
      </div>

      <div className="relative">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-[#D7193F] shadow-[0_20px_55px_rgba(0,0,0,0.28)]">
          <Trophy className="h-12 w-12" />
        </div>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-red-200">
          Registration fully complete
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.045em] sm:text-6xl">
          Welcome to 501 Elite.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">
          {completion.playerName}’s information, releases, and required document
          have been securely received.
        </p>

        <div className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/15 px-5 py-3 text-sm font-bold text-emerald-100">
          <CheckCircle2 className="h-5 w-5" />
          All launch requirements complete
        </div>

        <div className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
          <a
            href="https://www.501elitebaseball.com/payments.html"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#D7193F] px-7 font-bold shadow-xl transition hover:-translate-y-0.5"
            style={{ color: "#ffffff" }}
          >
            <CreditCard className="h-5 w-5" />
            Continue to payment
          </a>
          <Link
            href="/dashboard"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 font-bold transition hover:bg-white/15"
            style={{ color: "#ffffff" }}
          >
            Open Family Home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-5 text-xs text-blue-200">
          Payment can be completed now or from the 501 Elite Payment Center later.
        </p>
      </div>
    </div>
  );
}
