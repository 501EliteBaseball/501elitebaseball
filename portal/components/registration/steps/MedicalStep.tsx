"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  HeartPulse,
  Hospital,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

export type MedicalForm = {
  physician_name: string;
  physician_phone: string;
  insurance_provider: string;
  policy_number: string;
  allergies: string;
  medications: string;
  medical_conditions: string;
  special_instructions: string;
};

type MedicalStepProps = {
  medical: MedicalForm;
  setMedical: Dispatch<SetStateAction<MedicalForm>>;
  question: number;
  setQuestion: Dispatch<SetStateAction<number>>;
  playerName: string;
};

const totalQuestions = 5;

const textInputClassName =
  "w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-4 text-2xl font-semibold tracking-[-0.025em] text-slate-950 outline-none transition-all duration-300 placeholder:text-slate-300 focus:border-[#D7193F] sm:text-3xl";

const textareaClassName =
  "min-h-36 w-full resize-none rounded-[24px] border border-slate-200 bg-slate-50/80 px-5 py-4 text-lg font-medium leading-8 text-slate-950 outline-none transition duration-300 placeholder:text-slate-300 focus:border-[#123E74] focus:bg-white focus:ring-4 focus:ring-[#123E74]/10";

export default function MedicalStep({
  medical,
  setMedical,
  question,
  setQuestion,
  playerName,
}: MedicalStepProps) {
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const progressPercentage =
    question === 0 ? 0 : Math.min((question / totalQuestions) * 100, 100);

  function updateMedical(values: Partial<MedicalForm>) {
    setLocalErrors({});
    setMedical((current) => ({
      ...current,
      ...values,
    }));
  }

  function advance() {
    const errors: Record<string, string> = {};

    if (question === 1) {
      if (!medical.physician_name.trim()) {
        errors.physician_name = "Please enter the physician or clinic name.";
      }

      if (!medical.physician_phone.trim()) {
        errors.physician_phone = "Please enter the physician’s phone number.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLocalErrors({});
    setQuestion((current) => Math.min(current + 1, 6));
  }

  function goBack() {
    setLocalErrors({});
    setQuestion((current) => Math.max(current - 1, 0));
  }

  function markNone(field: keyof MedicalForm) {
    updateMedical({ [field]: "None" } as Partial<MedicalForm>);
  }

  function MedicalSummaryCard() {
    const careItems = [
      {
        label: "Allergies",
        value: medical.allergies.trim() || "Not provided",
      },
      {
        label: "Medications",
        value: medical.medications.trim() || "Not provided",
      },
      {
        label: "Conditions",
        value: medical.medical_conditions.trim() || "Not provided",
      },
    ];

    return (
      <aside className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-[linear-gradient(155deg,#ffffff_0%,#f8fafc_58%,#eef7f5_100%)] p-6 shadow-[0_24px_70px_rgba(18,62,116,0.12)]">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-200/35 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-[#123E74]/10 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#123E74]">
                Player care profile
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Important information for coaches and staff.
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-[0_12px_26px_rgba(5,150,105,0.22)]">
              <HeartPulse className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-8">
            <p className="text-2xl font-semibold tracking-[-0.035em] text-slate-950">
              {playerName}
            </p>

            <p className="mt-2 text-sm font-semibold text-emerald-700">
              Medical readiness
            </p>
          </div>

          <div className="mt-7 rounded-2xl border border-white/90 bg-white/80 px-4 py-4 shadow-sm">
            <p className="text-xs font-medium text-slate-400">
              Physician or clinic
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {medical.physician_name.trim() || "—"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {medical.physician_phone.trim() || "Phone not provided"}
            </p>
          </div>

          <div className="mt-3 rounded-2xl border border-white/90 bg-white/80 px-4 py-4 shadow-sm">
            <p className="text-xs font-medium text-slate-400">Insurance</p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {medical.insurance_provider.trim() || "Not provided"}
            </p>

            {medical.policy_number.trim() ? (
              <p className="mt-1 truncate text-xs text-slate-500">
                Policy {medical.policy_number}
              </p>
            ) : null}
          </div>

          <div className="mt-3 space-y-2">
            {careItems.map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-4 rounded-2xl border border-white/90 bg-white/80 px-4 py-3 shadow-sm"
              >
                <span className="text-xs font-medium text-slate-400">
                  {item.label}
                </span>

                <span className="max-w-[165px] text-right text-xs font-semibold leading-5 text-slate-800">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
              <ShieldCheck className="h-3 w-3" />
            </span>
            Private and securely stored
          </div>
        </div>
      </aside>
    );
  }

  return (
    <div className="mx-auto flex min-h-[620px] max-w-5xl flex-col">
      <div className="mb-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#123E74]">
              Medical care
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              {question === 0
                ? "Introduction"
                : question === 6
                  ? "Care profile complete"
                  : `Question ${question} of ${totalQuestions}`}
            </p>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Private & secure
          </p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#34D399,#059669)] shadow-[0_0_14px_rgba(5,150,105,0.28)] transition-all duration-700 ease-out"
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
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-emerald-100 text-emerald-700">
                <HeartPulse className="h-8 w-8" />
              </div>

              <p className="mt-9 text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
                Help us be prepared
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                Help us take great care of {playerName}.
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                Share the information coaches may need to respond calmly and
                appropriately if a medical concern arises.
              </p>
            </div>
          ) : null}

          {question === 1 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
                Primary care
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                Who provides {playerName}’s medical care?
              </h3>

              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="medical-physician-name"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Physician or clinic
                  </label>

                  <input
                    id="medical-physician-name"
                    type="text"
                    autoFocus
                    value={medical.physician_name}
                    onChange={(event) =>
                      updateMedical({ physician_name: event.target.value })
                    }
                    placeholder="Hot Springs Pediatrics"
                    className={textInputClassName}
                  />

                  {localErrors.physician_name ? (
                    <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                      {localErrors.physician_name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="medical-physician-phone"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Phone number
                  </label>

                  <input
                    id="medical-physician-phone"
                    type="tel"
                    inputMode="tel"
                    value={medical.physician_phone}
                    onChange={(event) =>
                      updateMedical({ physician_phone: event.target.value })
                    }
                    placeholder="(501) 555-0123"
                    className={textInputClassName}
                  />

                  {localErrors.physician_phone ? (
                    <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                      {localErrors.physician_phone}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {question === 2 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#123E74]">
                Insurance information
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                What coverage does {playerName} have?
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                This information is kept private and used only when necessary.
              </p>

              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="medical-insurance-provider"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Insurance provider
                  </label>

                  <input
                    id="medical-insurance-provider"
                    type="text"
                    autoFocus
                    value={medical.insurance_provider}
                    onChange={(event) =>
                      updateMedical({
                        insurance_provider: event.target.value,
                      })
                    }
                    placeholder="Blue Cross Blue Shield"
                    className={textInputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="medical-policy-number"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Policy or member ID
                  </label>

                  <input
                    id="medical-policy-number"
                    type="text"
                    value={medical.policy_number}
                    onChange={(event) =>
                      updateMedical({ policy_number: event.target.value })
                    }
                    placeholder="Member ID"
                    className={textInputClassName}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {question === 3 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#D7193F]">
                Allergies and medications
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                Is there anything {playerName} must avoid or take regularly?
              </h3>

              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <label
                      htmlFor="medical-allergies"
                      className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                    >
                      Allergies
                    </label>

                    <button
                      type="button"
                      onClick={() => markNone("allergies")}
                      className="text-xs font-bold text-[#123E74] hover:text-[#D7193F]"
                    >
                      None
                    </button>
                  </div>

                  <textarea
                    id="medical-allergies"
                    autoFocus
                    value={medical.allergies}
                    onChange={(event) =>
                      updateMedical({ allergies: event.target.value })
                    }
                    placeholder="Food, medication, insect, or environmental allergies"
                    className={textareaClassName}
                  />
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <label
                      htmlFor="medical-medications"
                      className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                    >
                      Medications
                    </label>

                    <button
                      type="button"
                      onClick={() => markNone("medications")}
                      className="text-xs font-bold text-[#123E74] hover:text-[#D7193F]"
                    >
                      None
                    </button>
                  </div>

                  <textarea
                    id="medical-medications"
                    value={medical.medications}
                    onChange={(event) =>
                      updateMedical({ medications: event.target.value })
                    }
                    placeholder="Regular or emergency medications"
                    className={textareaClassName}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {question === 4 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#123E74]">
                Medical history
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                Are there any conditions coaches should know about?
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                Include asthma, seizures, diabetes, prior injuries, or anything
                that may affect participation.
              </p>

              <div className="mt-10 max-w-2xl">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label
                    htmlFor="medical-conditions"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Medical conditions
                  </label>

                  <button
                    type="button"
                    onClick={() => markNone("medical_conditions")}
                    className="text-xs font-bold text-[#123E74] hover:text-[#D7193F]"
                  >
                    None
                  </button>
                </div>

                <textarea
                  id="medical-conditions"
                  autoFocus
                  value={medical.medical_conditions}
                  onChange={(event) =>
                    updateMedical({
                      medical_conditions: event.target.value,
                    })
                  }
                  placeholder="Share anything that helps us care for your athlete"
                  className={textareaClassName}
                />
              </div>
            </div>
          ) : null}

          {question === 5 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
                One final care note
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                Is there anything else we should know about caring for{" "}
                {playerName}?
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                This is optional. Include emergency instructions, activity
                limits, or details that would help coaches respond well.
              </p>

              <div className="mt-10 max-w-2xl">
                <textarea
                  id="medical-special-instructions"
                  autoFocus
                  value={medical.special_instructions}
                  onChange={(event) =>
                    updateMedical({
                      special_instructions: event.target.value,
                    })
                  }
                  placeholder="Optional special instructions"
                  className={textareaClassName}
                />
              </div>
            </div>
          ) : null}

          {question === 6 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-[0_12px_30px_rgba(16,185,129,0.16)]">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <p className="mt-8 text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
                Care profile complete
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                We’re prepared to care for {playerName}.
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                This information will help the 501 Elite staff respond quickly,
                calmly, and appropriately when needed.
              </p>

              <div className="mt-9 flex max-w-xl items-start gap-4 rounded-[28px] border border-emerald-200/80 bg-emerald-50/70 p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <Stethoscope className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-lg font-semibold text-slate-950">
                    Medical information secured
                  </p>

                  <p className="mt-2 leading-7 text-slate-500">
                    Physician, insurance, allergies, medications, and care notes
                    are connected to {playerName}’s registration.
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

            {question < 6 ? (
              <button
                type="button"
                onClick={advance}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[linear-gradient(145deg,#173F73,#0B2954)] px-8 text-sm font-bold text-white shadow-[0_16px_34px_rgba(18,62,116,0.30)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(18,62,116,0.38)]"
              >
                {question === 0 ? "Build the care profile" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <p className="text-right text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                Medical details complete
              </p>
            )}
          </div>
        </div>

        <div className="order-first lg:order-last">
          <div className="lg:sticky lg:top-6">
            <MedicalSummaryCard />
          </div>
        </div>
      </div>
    </div>
  );
}
