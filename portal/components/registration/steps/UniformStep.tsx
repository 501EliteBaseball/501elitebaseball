"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Hash,
  Shirt,
  Sparkles,
} from "lucide-react";
import { UniformPreview } from "@/components/uniform";

export type UniformForm = {
  jersey_size: string;
  pants_size: string;
  hat_size: string;
  jersey_name: string;
  jersey_number_preference: string;
};

type UniformStepProps = {
  uniform: UniformForm;
  setUniform: Dispatch<SetStateAction<UniformForm>>;
  question: number;
  setQuestion: Dispatch<SetStateAction<number>>;
  playerName: string;
};

const totalQuestions = 4;

const jerseySizes = ["YXS", "YS", "YM", "YL", "YXL", "AS", "AM"];
const pantsSizes = ["YXS", "YS", "YM", "YL", "YXL", "AS", "AM"];
const hatSizes = ["Youth", "S/M", "M/L", "L/XL"];

const textInputClassName =
  "w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-4 text-2xl font-semibold tracking-[-0.025em] text-slate-950 outline-none transition-all duration-300 placeholder:text-slate-300 focus:border-[#D7193F] sm:text-3xl";

export default function UniformStep({
  uniform,
  setUniform,
  question,
  setQuestion,
  playerName,
}: UniformStepProps) {
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const displayName =
    uniform.jersey_name.trim() || playerName.trim() || "PLAYER";

  const progressPercentage =
    question === 0 ? 0 : Math.min((question / totalQuestions) * 100, 100);

  function updateUniform(values: Partial<UniformForm>) {
    setLocalErrors({});
    setUniform((current) => ({
      ...current,
      ...values,
    }));
  }

  function advance() {
    const errors: Record<string, string> = {};

    if (question === 1 && !uniform.jersey_size.trim()) {
      errors.jersey_size = "Please select a jersey size.";
    }

    if (question === 2 && !uniform.pants_size.trim()) {
      errors.pants_size = "Please select a pants size.";
    }

    if (question === 3 && !uniform.hat_size.trim()) {
      errors.hat_size = "Please select a hat size.";
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLocalErrors({});
    setQuestion((current) => Math.min(current + 1, 5));
  }

  function goBack() {
    setLocalErrors({});
    setQuestion((current) => Math.max(current - 1, 0));
  }

  function SizeChoices({
    options,
    value,
    onChange,
  }: {
    options: string[];
    value: string;
    onChange: (value: string) => void;
  }) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map((option) => {
          const selected = value === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`relative min-h-20 rounded-[22px] border px-4 py-4 text-center transition duration-200 ${
                selected
                  ? "border-[#123E74] bg-[#123E74] text-white shadow-[0_14px_30px_rgba(18,62,116,0.24)]"
                  : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-[#123E74]/40 hover:shadow-lg"
              }`}
            >
              {selected ? (
                <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#123E74]">
                  <Check className="h-3 w-3" />
                </span>
              ) : null}

              <span className="text-lg font-bold">{option}</span>
            </button>
          );
        })}
      </div>
    );
  }

  function UniformPreviewCard() {
    return (
      <UniformPreview
        playerName={playerName}
        jerseyName={uniform.jersey_name}
        jerseyNumber={uniform.jersey_number_preference}
        jerseySize={uniform.jersey_size}
        pantsSize={uniform.pants_size}
        hatSize={uniform.hat_size}
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-[620px] max-w-5xl flex-col">
      <div className="mb-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#123E74]">
              Uniform fit
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              {question === 0
                ? "Introduction"
                : question === 5
                  ? "Uniform complete"
                  : `Question ${question} of ${totalQuestions}`}
            </p>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Game ready
          </p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#FF5B7C,#D7193F)] shadow-[0_0_14px_rgba(215,25,63,0.28)] transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div
          key={question}
          className="flex min-w-0 flex-col animate-in fade-in slide-in-from-right-5 duration-500"
        >
          {question === 0 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#D7193F]/10 text-[#D7193F]">
                <Shirt className="h-8 w-8" />
              </div>

              <p className="mt-9 text-sm font-bold uppercase tracking-[0.24em] text-[#D7193F]">
                Time to gear up
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                Let’s get {playerName} game ready.
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                Choose the best sizes for the season and personalize the jersey
                preview.
              </p>
            </div>
          ) : null}

          {question === 1 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#D7193F]">
                Jersey fit
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                What jersey size fits {playerName} best?
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                Choose the size they normally wear in athletic tops.
              </p>

              <div className="mt-10">
                <SizeChoices
                  options={jerseySizes}
                  value={uniform.jersey_size}
                  onChange={(value) =>
                    updateUniform({ jersey_size: value })
                  }
                />

                {localErrors.jersey_size ? (
                  <p className="mt-4 text-sm font-semibold text-[#D7193F]">
                    {localErrors.jersey_size}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {question === 2 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#123E74]">
                Pants fit
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                What pants size should we order?
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                Choose the size closest to their current baseball pants.
              </p>

              <div className="mt-10">
                <SizeChoices
                  options={pantsSizes}
                  value={uniform.pants_size}
                  onChange={(value) =>
                    updateUniform({ pants_size: value })
                  }
                />

                {localErrors.pants_size ? (
                  <p className="mt-4 text-sm font-semibold text-[#D7193F]">
                    {localErrors.pants_size}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {question === 3 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#123E74]">
                Hat fit
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                Which hat size fits {playerName}?
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                Select the closest fitted or flex-fit size.
              </p>

              <div className="mt-10">
                <SizeChoices
                  options={hatSizes}
                  value={uniform.hat_size}
                  onChange={(value) => updateUniform({ hat_size: value })}
                />

                {localErrors.hat_size ? (
                  <p className="mt-4 text-sm font-semibold text-[#D7193F]">
                    {localErrors.hat_size}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {question === 4 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#D7193F]">
                Jersey personalization
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                How should {playerName}’s jersey look?
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                Number preferences are not guaranteed, but we’ll do our best.
              </p>

              <div className="mt-10 grid gap-8 sm:grid-cols-[1.4fr_0.6fr]">
                <div>
                  <label
                    htmlFor="uniform-jersey-name"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Jersey name
                    <span className="ml-2 font-medium normal-case tracking-normal">
                      Optional
                    </span>
                  </label>

                  <input
                    id="uniform-jersey-name"
                    type="text"
                    autoFocus
                    value={uniform.jersey_name}
                    onChange={(event) =>
                      updateUniform({
                        jersey_name: event.target.value.toUpperCase(),
                      })
                    }
                    placeholder={playerName.toUpperCase()}
                    className={textInputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="uniform-number"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Preferred number
                  </label>

                  <div className="relative">
                    <Hash className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />

                    <input
                      id="uniform-number"
                      type="text"
                      inputMode="numeric"
                      value={uniform.jersey_number_preference}
                      onChange={(event) =>
                        updateUniform({
                          jersey_number_preference: event.target.value,
                        })
                      }
                      placeholder="13"
                      className={`${textInputClassName} pl-7`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {question === 5 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-[0_12px_30px_rgba(16,185,129,0.16)]">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <p className="mt-8 text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
                Uniform complete
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                {playerName} is ready to represent 501 Elite.
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                We’ve saved the sizing and personalization preferences for the
                season.
              </p>

              <div className="mt-9 flex max-w-xl items-start gap-4 rounded-[28px] border border-emerald-200/80 bg-emerald-50/70 p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-lg font-semibold text-slate-950">
                    Sizing confirmed
                  </p>

                  <p className="mt-2 leading-7 text-slate-500">
                    Jersey {uniform.jersey_size}, pants {uniform.pants_size},
                    and hat {uniform.hat_size}.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={goBack}
              disabled={question === 0}
              className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#123E74] disabled:invisible"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {question < 5 ? (
              <button
                type="button"
                onClick={advance}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[linear-gradient(145deg,#173F73,#0B2954)] px-8 text-sm font-bold text-white shadow-[0_16px_34px_rgba(18,62,116,0.30)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(18,62,116,0.38)]"
              >
                {question === 0 ? "Choose uniform sizes" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <p className="text-right text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                Uniform details complete
              </p>
            )}
          </div>
        </div>

        <div className="order-first lg:order-last">
          <div className="lg:sticky lg:top-6">
            <UniformPreviewCard />
          </div>
        </div>
      </div>
    </div>
  );
}
