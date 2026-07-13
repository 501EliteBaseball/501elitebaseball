"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export type FamilyForm = {
  family_name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
};

type FamilyStepProps = {
  family: FamilyForm;
  setFamily: Dispatch<SetStateAction<FamilyForm>>;
  question: number;
  setQuestion: Dispatch<SetStateAction<number>>;
};

export default function FamilyStep({
  family,
  setFamily,
  question,
  setQuestion,
}: FamilyStepProps) {
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const inputClassName =
    "w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-4 text-2xl font-semibold tracking-[-0.025em] text-slate-950 outline-none transition-all duration-300 placeholder:text-slate-300 focus:border-[#D7193F] sm:text-3xl";

  function advance() {
    const errors: Record<string, string> = {};

    if (question === 0 && !family.family_name.trim()) {
      errors.family_name = "Please enter the name you use for your family.";
    }

    if (question === 1 && !family.address_line_1.trim()) {
      errors.address_line_1 = "Please enter your street address.";
    }

    if (question === 2) {
      if (!family.city.trim()) {
        errors.city = "Please enter your city.";
      }

      if (!family.state.trim()) {
        errors.state = "Please enter your state.";
      }

      if (!family.postal_code.trim()) {
        errors.postal_code = "Please enter your ZIP code.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLocalErrors({});
    setQuestion((current) => Math.min(current + 1, 3));
  }

  return (
    <div className="mx-auto flex min-h-[560px] max-w-2xl flex-col">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index <= question
                  ? "w-10 bg-[linear-gradient(90deg,#FF5B7C,#D7193F)] shadow-[0_0_12px_rgba(215,25,63,0.24)]"
                  : "w-5 bg-slate-200"
              }`}
            />
          ))}
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Your family
        </p>
      </div>

      <div
        key={question}
        className="flex flex-1 animate-in flex-col fade-in slide-in-from-right-5 duration-500"
      >
        {question === 0 ? (
          <div className="flex flex-1 flex-col justify-center pb-12">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#D7193F]">
              Let’s meet the household
            </p>

            <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
              What should we call your family?
            </h3>

            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
              Most families simply use their last name, such as “The Thomas
              Family.”
            </p>

            <div className="mt-12 max-w-xl">
              <label
                htmlFor="family-name"
                className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
              >
                Family name
              </label>

              <input
                id="family-name"
                type="text"
                autoFocus
                value={family.family_name}
                onChange={(event) =>
                  setFamily({
                    ...family,
                    family_name: event.target.value,
                  })
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    advance();
                  }
                }}
                placeholder="The Thomas Family"
                className={inputClassName}
              />

              {localErrors.family_name ? (
                <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                  {localErrors.family_name}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {question === 1 ? (
          <div className="flex flex-1 flex-col justify-center pb-12">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
              Great
            </p>

            <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
              Where does your family call home?
            </h3>

            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
              This helps us maintain accurate team and emergency records.
            </p>

            <div className="mt-12 max-w-xl space-y-7">
              <div>
                <label
                  htmlFor="address-line-1"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                >
                  Street address
                </label>

                <input
                  id="address-line-1"
                  type="text"
                  autoComplete="address-line1"
                  autoFocus
                  value={family.address_line_1}
                  onChange={(event) =>
                    setFamily({
                      ...family,
                      address_line_1: event.target.value,
                    })
                  }
                  placeholder="123 Ballpark Lane"
                  className={inputClassName}
                />

                {localErrors.address_line_1 ? (
                  <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                    {localErrors.address_line_1}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="address-line-2"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                >
                  Apartment, suite, or unit
                  <span className="ml-2 font-medium normal-case tracking-normal text-slate-400">
                    Optional
                  </span>
                </label>

                <input
                  id="address-line-2"
                  type="text"
                  autoComplete="address-line2"
                  value={family.address_line_2}
                  onChange={(event) =>
                    setFamily({
                      ...family,
                      address_line_2: event.target.value,
                    })
                  }
                  placeholder="Unit 4"
                  className={inputClassName}
                />
              </div>
            </div>
          </div>
        ) : null}

        {question === 2 ? (
          <div className="flex flex-1 flex-col justify-center pb-12">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
              Almost there
            </p>

            <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
              Finish your home address.
            </h3>

            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
              Just the city, state, and ZIP code remain.
            </p>

            <div className="mt-12 grid gap-8 sm:grid-cols-[1.4fr_0.65fr_0.9fr]">
              <div>
                <label
                  htmlFor="family-city"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                >
                  City
                </label>

                <input
                  id="family-city"
                  type="text"
                  autoComplete="address-level2"
                  autoFocus
                  value={family.city}
                  onChange={(event) =>
                    setFamily({
                      ...family,
                      city: event.target.value,
                    })
                  }
                  placeholder="Hot Springs"
                  className={inputClassName}
                />

                {localErrors.city ? (
                  <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                    {localErrors.city}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="family-state"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                >
                  State
                </label>

                <input
                  id="family-state"
                  type="text"
                  autoComplete="address-level1"
                  maxLength={2}
                  value={family.state}
                  onChange={(event) =>
                    setFamily({
                      ...family,
                      state: event.target.value.toUpperCase(),
                    })
                  }
                  placeholder="AR"
                  className={inputClassName}
                />

                {localErrors.state ? (
                  <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                    {localErrors.state}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="family-postal-code"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                >
                  ZIP code
                </label>

                <input
                  id="family-postal-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={10}
                  value={family.postal_code}
                  onChange={(event) =>
                    setFamily({
                      ...family,
                      postal_code: event.target.value,
                    })
                  }
                  placeholder="71901"
                  className={inputClassName}
                />

                {localErrors.postal_code ? (
                  <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                    {localErrors.postal_code}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {question === 3 ? (
          <div className="flex flex-1 flex-col justify-center pb-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-[0_12px_30px_rgba(16,185,129,0.16)]">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <p className="mt-8 text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
              Home base confirmed
            </p>

            <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
              Your family details are ready.
            </h3>

            <div className="mt-9 max-w-xl rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-6">
              <p className="text-lg font-semibold text-slate-950">
                {family.family_name}
              </p>
              <p className="mt-3 leading-7 text-slate-500">
                {family.address_line_1}
                {family.address_line_2
                  ? `, ${family.address_line_2}`
                  : ""}
                <br />
                {family.city}, {family.state} {family.postal_code}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={() => {
            setLocalErrors({});
            setQuestion((current) => Math.max(current - 1, 0));
          }}
          disabled={question === 0}
          className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#123E74] disabled:invisible"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {question < 3 ? (
          <button
            type="button"
            onClick={advance}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[linear-gradient(145deg,#173F73,#0B2954)] px-8 text-sm font-bold text-white shadow-[0_16px_34px_rgba(18,62,116,0.30)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(18,62,116,0.38)]"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <p className="text-right text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
            Family details complete
          </p>
        )}
      </div>
    </div>
  );
}
