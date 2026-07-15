"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, Clock3 } from "lucide-react";

type SectionCompletePromptProps = {
  eyebrow: string;
  title: string;
  description: string;
  continueHref: string;
  continueLabel: string;
  laterHref?: string;
};

export default function SectionCompletePrompt({
  eyebrow,
  title,
  description,
  continueHref,
  continueLabel,
  laterHref = "/",
}: SectionCompletePromptProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-[32px] border border-emerald-200 bg-white p-7 text-center shadow-[0_30px_90px_rgba(18,62,116,0.16)] sm:p-11">
      <div
        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_18px_40px_rgba(16,185,129,0.32)] transition duration-700 ${visible ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
      >
        <Check className="h-10 w-10 stroke-[3]" />
      </div>

      <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
        {description}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <a
          href={continueHref}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#123E74] px-6 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0f335f]"
        >
          {continueLabel}
          <ArrowRight className="h-4 w-4" />
        </a>
        <a
          href={laterHref}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 font-semibold text-slate-700 transition hover:border-[#123E74] hover:text-[#123E74]"
        >
          <Clock3 className="h-4 w-4" />
          Save &amp; come back later
        </a>
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-400">
        Your progress is securely saved to this account.
      </p>
    </div>
  );
}
