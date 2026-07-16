"use client";

import Image from "next/image";
import { Check, RotateCcw, Shirt } from "lucide-react";
import { useMemo, useState } from "react";

export type UniformPreviewSide = "front" | "back";

// Keep the production artwork mapping explicit. The vendor-exported filenames do
// not describe the jersey side and are easy to reverse accidentally.
const FRONT_JERSEY_ARTWORK = "/uniforms/OWN THE STANDARD-3.png";
const BACK_JERSEY_ARTWORK = "/uniforms/OWN THE STANDARD-2.png";

export type UniformPreviewProps = {
  playerName: string;
  jerseyName?: string;
  jerseyNumber?: string;
  jerseySize?: string;
  pantsSize?: string;
  hatSize?: string;
  initialSide?: UniformPreviewSide;
  className?: string;
};

function SizeCard({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/90 bg-white/90 px-3 py-4 text-center shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-bold text-slate-950">
        {value || "—"}
      </p>
    </div>
  );
}

export default function UniformPreview({
  playerName,
  jerseyName = "",
  jerseyNumber = "",
  jerseySize = "",
  pantsSize = "",
  hatSize = "",
  initialSide = "front",
  className = "",
}: UniformPreviewProps) {
  const [side, setSide] = useState<UniformPreviewSide>(initialSide);

  const displayName = useMemo(
    () =>
      (jerseyName.trim() || playerName.trim() || "PLAYER")
        .toUpperCase()
        .replace(/[^A-Z0-9 .'-]/g, "")
        .slice(0, 14),
    [jerseyName, playerName],
  );

  const displayNumber = useMemo(
    () => jerseyNumber.replace(/\D/g, "").slice(0, 2) || "00",
    [jerseyNumber],
  );

  return (
    <aside
      className={`relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-[linear-gradient(155deg,#ffffff_0%,#f7f9fc_55%,#edf3fa_100%)] p-5 shadow-[0_24px_70px_rgba(18,62,116,0.12)] sm:p-6 ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#D7193F]/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-20 -left-14 h-48 w-48 rounded-full bg-[#123E74]/12 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#123E74]">
              Live uniform preview
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Built for {playerName}.
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D7193F] text-white shadow-[0_12px_26px_rgba(215,25,63,0.22)]">
            <Shirt className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 flex rounded-full border border-slate-200 bg-white/85 p-1 shadow-sm">
          {(["front", "back"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSide(option)}
              aria-pressed={side === option}
              className={`flex-1 rounded-full px-4 py-2.5 text-xs font-bold capitalize transition ${
                side === option
                  ? "bg-[#123E74] text-white shadow-sm"
                  : "text-slate-500 hover:text-[#123E74]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-[28px] border border-white/80 bg-[radial-gradient(circle_at_top,#ffffff_0%,#edf3f9_66%,#dce6f1_100%)] shadow-inner">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[430px] [perspective:1200px]">
            <div
              className={`absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d] ${
                side === "back" ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              <div className="absolute inset-0 [backface-visibility:hidden]">
                <Image
                  src={FRONT_JERSEY_ARTWORK}
                  alt="Front of the 501 Elite jersey"
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 430px"
                  className="object-contain p-3"
                />
              </div>

              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <Image
                  src={BACK_JERSEY_ARTWORK}
                  alt={`Back of ${displayName}'s 501 Elite jersey`}
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 430px"
                  className="object-contain p-3"
                />

                <div className="pointer-events-none absolute inset-0">
                  <p
                    className="absolute left-1/2 top-[24.5%] w-[54%] -translate-x-1/2 truncate text-center text-[clamp(0.8rem,3.6vw,1.55rem)] font-black tracking-[0.08em] text-[#123E74]"
                    style={{
                      textShadow:
                        "0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff",
                    }}
                  >
                    {displayName}
                  </p>

                  <p
                    className="absolute left-1/2 top-[32%] -translate-x-1/2 text-[clamp(4rem,18vw,8.25rem)] font-black leading-none tracking-[-0.08em] text-[#123E74]"
                    style={{
                      WebkitTextStroke: "2px #D7193F",
                      paintOrder: "stroke fill",
                      textShadow: "0 5px 10px rgba(18,62,116,0.15)",
                    }}
                  >
                    {displayNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <SizeCard label="Jersey" value={jerseySize} />
          <SizeCard label="Pants" value={pantsSize} />
          <SizeCard label="Hat" value={hatSize} />
        </div>

        <button
          type="button"
          onClick={() =>
            setSide((current) => (current === "front" ? "back" : "front"))
          }
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-3 text-xs font-bold text-[#123E74] transition hover:border-[#123E74]/30 hover:bg-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Show {side === "front" ? "back" : "front"}
        </button>

        <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-700">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-3 w-3" />
          </span>

          Preview updates automatically
        </div>
      </div>
    </aside>
  );
}
