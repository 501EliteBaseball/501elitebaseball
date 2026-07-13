"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Phone,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

export type EmergencyForm = {
  name: string;
  relationship: string;
  phone: string;
  alternate_phone: string;
  authorized_pickup: boolean;
};

type EmergencyStepProps = {
  emergency: EmergencyForm;
  setEmergency: Dispatch<SetStateAction<EmergencyForm>>;
  question: number;
  setQuestion: Dispatch<SetStateAction<number>>;
  playerName: string;
};

const totalQuestions = 3;

const textInputClassName =
  "w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-4 text-2xl font-semibold tracking-[-0.025em] text-slate-950 outline-none transition-all duration-300 placeholder:text-slate-300 focus:border-[#D7193F] sm:text-3xl";

const choiceClassName =
  "min-h-16 rounded-2xl border px-5 text-left text-base font-semibold transition duration-200";

export default function EmergencyStep({
  emergency,
  setEmergency,
  question,
  setQuestion,
  playerName,
}: EmergencyStepProps) {
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const contactName = emergency.name.trim() || "your emergency contact";

  const progressPercentage =
    question === 0 ? 0 : Math.min((question / totalQuestions) * 100, 100);

  function updateEmergency(values: Partial<EmergencyForm>) {
    setLocalErrors({});
    setEmergency((current) => ({
      ...current,
      ...values,
    }));
  }

  function advance() {
    const errors: Record<string, string> = {};

    if (question === 1) {
      if (!emergency.name.trim()) {
        errors.name = "Please enter the contact’s name.";
      }

      if (!emergency.relationship.trim()) {
        errors.relationship = `Please tell us how this person is connected to ${playerName}.`;
      }
    }

    if (question === 2 && !emergency.phone.trim()) {
      errors.phone = "Please enter the best phone number for this contact.";
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLocalErrors({});
    setQuestion((current) => Math.min(current + 1, 4));
  }

  function goBack() {
    setLocalErrors({});
    setQuestion((current) => Math.max(current - 1, 0));
  }

  function EmergencyContactCard() {
    return (
      <aside className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-[linear-gradient(155deg,#ffffff_0%,#f8fafc_58%,#eef4fb_100%)] p-6 shadow-[0_24px_70px_rgba(18,62,116,0.12)]">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#123E74]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-emerald-200/30 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#123E74]">
                Trusted contact
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Available when a parent cannot be reached.
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#123E74] text-white shadow-[0_12px_26px_rgba(18,62,116,0.22)]">
              <UserRoundCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-8">
            <p className="text-2xl font-semibold tracking-[-0.035em] text-slate-950">
              {emergency.name.trim() || "Trusted adult"}
            </p>

            <p className="mt-2 text-sm font-semibold text-[#D7193F]">
              {emergency.relationship.trim() || `Support for ${playerName}`}
            </p>
          </div>

          <div className="mt-7 space-y-3">
            <div className="rounded-2xl border border-white/90 bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-xs font-medium text-slate-400">
                Primary phone
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Phone className="h-4 w-4 text-[#123E74]" />
                {emergency.phone.trim() || "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/90 bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-xs font-medium text-slate-400">
                Alternate phone
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {emergency.alternate_phone.trim() || "Not provided"}
              </p>
            </div>

            <div
              className={`rounded-2xl border px-4 py-3 transition ${
                emergency.authorized_pickup
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-white/80"
              }`}
            >
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    emergency.authorized_pickup
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {emergency.authorized_pickup ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  )}
                </span>

                {emergency.authorized_pickup
                  ? "Authorized for pickup"
                  : "Not authorized for pickup"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-3 w-3" />
            </span>
            Securely saved to {playerName}’s profile
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
              Emergency support
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              {question === 0
                ? "Introduction"
                : question === 4
                  ? "Contact complete"
                  : `Question ${question} of ${totalQuestions}`}
            </p>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Safety first
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
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#123E74]/10 text-[#123E74]">
                <ShieldCheck className="h-8 w-8" />
              </div>

              <p className="mt-9 text-sm font-bold uppercase tracking-[0.24em] text-[#D7193F]">
                A trusted backup
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                Who should Coach Chase call if we can’t reach you?
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                Choose someone you trust to support {playerName} when you are
                unavailable.
              </p>
            </div>
          ) : null}

          {question === 1 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#D7193F]">
                Trusted contact
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                Who can we count on for {playerName}?
              </h3>

              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="emergency-name"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Full name
                  </label>

                  <input
                    id="emergency-name"
                    type="text"
                    autoComplete="name"
                    autoFocus
                    value={emergency.name}
                    onChange={(event) =>
                      updateEmergency({ name: event.target.value })
                    }
                    placeholder="Jane Thomas"
                    className={textInputClassName}
                  />

                  {localErrors.name ? (
                    <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                      {localErrors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="emergency-relationship"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Relationship
                  </label>

                  <input
                    id="emergency-relationship"
                    type="text"
                    value={emergency.relationship}
                    onChange={(event) =>
                      updateEmergency({ relationship: event.target.value })
                    }
                    placeholder="Grandmother"
                    className={textInputClassName}
                  />

                  {localErrors.relationship ? (
                    <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                      {localErrors.relationship}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {question === 2 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
                Great — we have {contactName}
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                What’s the best number to reach them?
              </h3>

              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="emergency-phone"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Primary phone
                  </label>

                  <input
                    id="emergency-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    autoFocus
                    value={emergency.phone}
                    onChange={(event) =>
                      updateEmergency({ phone: event.target.value })
                    }
                    placeholder="(501) 555-0123"
                    className={textInputClassName}
                  />

                  {localErrors.phone ? (
                    <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                      {localErrors.phone}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="emergency-alternate-phone"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Alternate phone
                    <span className="ml-2 font-medium normal-case tracking-normal">
                      Optional
                    </span>
                  </label>

                  <input
                    id="emergency-alternate-phone"
                    type="tel"
                    inputMode="tel"
                    value={emergency.alternate_phone}
                    onChange={(event) =>
                      updateEmergency({
                        alternate_phone: event.target.value,
                      })
                    }
                    placeholder="Another number"
                    className={textInputClassName}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {question === 3 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#D7193F]">
                Pickup permissions
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                May {contactName} pick up {playerName}?
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                This permission can be updated later from your family account.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    updateEmergency({ authorized_pickup: true })
                  }
                  className={`${choiceClassName} ${
                    emergency.authorized_pickup
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400"
                  }`}
                >
                  <span className="block">Yes</span>
                  <span
                    className={`mt-1 block text-sm font-medium ${
                      emergency.authorized_pickup
                        ? "text-emerald-50"
                        : "text-slate-400"
                    }`}
                  >
                    Add as an authorized pickup
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateEmergency({ authorized_pickup: false })
                  }
                  className={`${choiceClassName} ${
                    !emergency.authorized_pickup
                      ? "border-[#123E74] bg-[#123E74] text-white shadow-lg shadow-[#123E74]/20"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#123E74]/40"
                  }`}
                >
                  <span className="block">No</span>
                  <span
                    className={`mt-1 block text-sm font-medium ${
                      !emergency.authorized_pickup
                        ? "text-blue-100"
                        : "text-slate-400"
                    }`}
                  >
                    Emergency contact only
                  </span>
                </button>
              </div>
            </div>
          ) : null}

          {question === 4 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-[0_12px_30px_rgba(16,185,129,0.16)]">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <p className="mt-8 text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
                Emergency support complete
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                {contactName} is now part of {playerName}’s support team.
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                Coaches will know exactly who to contact when a parent is
                unavailable.
              </p>
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

            {question < 4 ? (
              <button
                type="button"
                onClick={advance}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[linear-gradient(145deg,#173F73,#0B2954)] px-8 text-sm font-bold text-white shadow-[0_16px_34px_rgba(18,62,116,0.30)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(18,62,116,0.38)]"
              >
                {question === 0 ? "Add a trusted contact" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <p className="text-right text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                Emergency contact complete
              </p>
            )}
          </div>
        </div>

        <div className="order-first lg:order-last">
          <div className="lg:sticky lg:top-6">
            <EmergencyContactCard />
          </div>
        </div>
      </div>
    </div>
  );
}
