"use client";

import { useState } from "react";
import { Check, RotateCcw, Shirt } from "lucide-react";

type UniformRenderProps = {
  playerName: string;
  jerseyName: string;
  jerseyNumber: string;
  jerseySize: string;
  pantsSize: string;
  hatSize: string;
};

type UniformSide = "front" | "back";

export default function UniformRender({
  playerName,
  jerseyName,
  jerseyNumber,
  jerseySize,
  pantsSize,
  hatSize,
}: UniformRenderProps) {
  const [side, setSide] = useState<UniformSide>("front");

  const displayName = (
    jerseyName.trim() ||
    playerName.trim() ||
    "PLAYER"
  )
    .toUpperCase()
    .slice(0, 14);

  const displayNumber = jerseyNumber.trim().slice(0, 2) || "00";

  return (
    <aside className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-[linear-gradient(155deg,#ffffff_0%,#f7f9fc_55%,#edf3fa_100%)] p-5 shadow-[0_24px_70px_rgba(18,62,116,0.12)] sm:p-6">
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

        <div className="mt-5 flex rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setSide("front")}
            className={`flex-1 rounded-full px-4 py-2 text-xs font-bold transition ${
              side === "front"
                ? "bg-[#123E74] text-white shadow-sm"
                : "text-slate-500 hover:text-[#123E74]"
            }`}
          >
            Front
          </button>

          <button
            type="button"
            onClick={() => setSide("back")}
            className={`flex-1 rounded-full px-4 py-2 text-xs font-bold transition ${
              side === "back"
                ? "bg-[#123E74] text-white shadow-sm"
                : "text-slate-500 hover:text-[#123E74]"
            }`}
          >
            Back
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-[28px] border border-white/80 bg-[radial-gradient(circle_at_top,#ffffff_0%,#eaf0f7_65%,#dce6f1_100%)] px-2 py-4 shadow-inner">
          <svg
            viewBox="0 0 320 430"
            role="img"
            aria-label={`${side} preview of ${displayName}'s 501 Elite uniform`}
            className="mx-auto h-auto w-full max-w-[300px]"
          >
            <defs>
              <linearGradient id="jersey-navy" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#173F73" />
                <stop offset="55%" stopColor="#123E74" />
                <stop offset="100%" stopColor="#081C36" />
              </linearGradient>

              <linearGradient id="jersey-red" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF5B7C" />
                <stop offset="50%" stopColor="#D7193F" />
                <stop offset="100%" stopColor="#8B0E28" />
              </linearGradient>

              <linearGradient id="pants-white" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#DCE5EF" />
              </linearGradient>

              <filter id="uniform-shadow" x="-30%" y="-30%" width="160%" height="180%">
                <feDropShadow
                  dx="0"
                  dy="12"
                  stdDeviation="10"
                  floodColor="#123E74"
                  floodOpacity="0.2"
                />
              </filter>
            </defs>

            <ellipse
              cx="160"
              cy="398"
              rx="102"
              ry="15"
              fill="#123E74"
              opacity="0.12"
            />

            <g filter="url(#uniform-shadow)">
              <path
                d="M113 35 C126 22 143 17 160 17 C177 17 194 22 207 35 L247 58 L225 112 L204 101 L210 238 C180 252 140 252 110 238 L116 101 L95 112 L73 58 Z"
                fill="url(#jersey-navy)"
              />

              <path
                d="M73 58 L113 35 L118 66 L89 85 Z"
                fill="url(#jersey-red)"
              />

              <path
                d="M247 58 L207 35 L202 66 L231 85 Z"
                fill="url(#jersey-red)"
              />

              <path
                d="M131 28 C138 44 182 44 189 28"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="8"
                strokeLinecap="round"
              />

              <path
                d="M128 31 C136 51 184 51 192 31"
                fill="none"
                stroke="#D7193F"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="M110 229 C132 239 188 239 210 229 L221 271 L194 377 L161 377 L160 290 L159 377 L126 377 L99 271 Z"
                fill="url(#pants-white)"
                stroke="#CBD5E1"
                strokeWidth="2"
              />

              <path
                d="M160 248 L160 376"
                stroke="#CBD5E1"
                strokeWidth="2"
              />

              <path
                d="M111 250 L129 374"
                stroke="#D7193F"
                strokeWidth="5"
                opacity="0.9"
              />

              <path
                d="M209 250 L191 374"
                stroke="#D7193F"
                strokeWidth="5"
                opacity="0.9"
              />

              <path
                d="M105 257 C133 268 187 268 215 257"
                fill="none"
                stroke="#123E74"
                strokeWidth="8"
              />

              <path
                d="M122 8 C137 -1 183 -1 198 8 L207 17 C189 24 131 24 113 17 Z"
                fill="url(#jersey-navy)"
                transform="translate(0,-1)"
              />

              <path
                d="M198 8 C224 10 239 18 243 28 C225 31 210 28 198 22 Z"
                fill="url(#jersey-red)"
                transform="translate(0,-1)"
              />

              <text
                x="160"
                y="15"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="900"
                letterSpacing="1.5"
              >
                501
              </text>

              {side === "front" ? (
                <>
                  <text
                    x="160"
                    y="106"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="21"
                    fontWeight="900"
                    fontStyle="italic"
                    letterSpacing="0.5"
                  >
                    501 ELITE
                  </text>

                  <path
                    d="M107 116 H213"
                    stroke="#D7193F"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  <text
                    x="160"
                    y="190"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    stroke="#D7193F"
                    strokeWidth="2.5"
                    paintOrder="stroke"
                    fontSize="72"
                    fontWeight="900"
                    letterSpacing="-4"
                  >
                    {displayNumber}
                  </text>
                </>
              ) : (
                <>
                  <text
                    x="160"
                    y="91"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={displayName.length > 10 ? "15" : "18"}
                    fontWeight="900"
                    letterSpacing="1.8"
                  >
                    {displayName}
                  </text>

                  <path
                    d="M112 103 H208"
                    stroke="#D7193F"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  <text
                    x="160"
                    y="190"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    stroke="#D7193F"
                    strokeWidth="2.5"
                    paintOrder="stroke"
                    fontSize="78"
                    fontWeight="900"
                    letterSpacing="-4"
                  >
                    {displayNumber}
                  </text>
                </>
              )}
            </g>
          </svg>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/90 bg-white/80 px-3 py-4 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Jersey
            </p>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {jerseySize || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/90 bg-white/80 px-3 py-4 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Pants
            </p>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {pantsSize || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/90 bg-white/80 px-3 py-4 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Hat
            </p>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {hatSize || "—"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setSide((current) => (current === "front" ? "back" : "front"))
          }
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-3 text-xs font-bold text-[#123E74] transition hover:border-[#123E74]/30 hover:bg-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Rotate uniform
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
