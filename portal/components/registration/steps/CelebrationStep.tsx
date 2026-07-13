"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Trophy,
} from "lucide-react";

type CelebrationStepProps = {
  playerName: string;
  familyName: string;
};

export default function CelebrationStep({
  playerName,
  familyName,
}: CelebrationStepProps) {
  const displayPlayerName = playerName.trim() || "Your athlete";
  const displayFamilyName = familyName.trim() || "your";

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-[34px] border border-white/90 bg-[linear-gradient(145deg,#ffffff_0%,#f7faff_55%,#eef4fb_100%)] p-6 text-center shadow-[0_30px_100px_rgba(18,62,116,0.16)] sm:p-10">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] bg-[linear-gradient(145deg,#173F73,#0B2954)] text-white shadow-[0_24px_50px_rgba(18,62,116,0.34)]">
        <Trophy className="h-12 w-12" />
      </div>

      <p className="mt-9 text-sm font-bold uppercase tracking-[0.28em] text-[#D7193F]">
        Registration complete
      </p>

      <h2 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-6xl">
        Welcome to 501 Elite.
      </h2>

      <p className="mx-auto mt-6 max-w-2xl text-xl leading-9 text-slate-500">
        {displayPlayerName} is officially registered for the upcoming season.
        We’re excited to welcome the {displayFamilyName} family.
      </p>

      <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 shadow-sm">
        <CheckCircle2 className="h-5 w-5" />
        Registration submitted successfully
      </div>

      <div className="mx-auto mt-10 max-w-2xl rounded-[28px] border border-slate-200 bg-white/85 p-6 text-left shadow-[0_20px_60px_rgba(18,62,116,0.09)]">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#123E74]/10 text-[#123E74]">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-950">
              Your registration is secure.
            </h3>

            <p className="mt-2 leading-7 text-slate-500">
              Your information has been submitted and is ready for the 501 Elite
              team to review. You can return to your dashboard for updates and
              future team information.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/dashboard"
          className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[linear-gradient(145deg,#173F73,#0B2954)] px-8 text-sm font-bold text-white shadow-[0_16px_34px_rgba(18,62,116,0.30)] transition hover:-translate-y-0.5"
        >
          Go to dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>

        <Link
          href="/registration/parent"
          className="inline-flex min-h-14 items-center justify-center rounded-full border border-slate-300 bg-white px-8 text-sm font-bold text-slate-700 transition hover:border-[#123E74] hover:text-[#123E74]"
        >
          Start another registration
        </Link>
      </div>
    </div>
  );
}
