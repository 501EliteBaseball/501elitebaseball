"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, FileSignature, ShieldCheck } from "lucide-react";
import SectionCompletePrompt from "@/components/registration/requirements/SectionCompletePrompt";
import {
  loadRegistrationContext,
  loadReleaseAcceptances,
  saveReleaseAcceptance,
  type RegistrationContext,
} from "@/lib/registration/registration-requirements-service";

const AGREEMENT_VERSION = "2026-2027-v1";

const agreements = [
  {
    key: "participation_liability",
    title: "Participation & Liability",
    summary: "Acknowledge the ordinary risks involved in youth baseball.",
    body:
      "I understand that baseball activities involve inherent risks, including physical injury. I voluntarily permit my child to participate in 501 Elite Baseball activities and agree to follow organization safety rules and coaching instructions. To the extent permitted by law, I release 501 Elite Baseball, its directors, coaches, volunteers, facilities, and event partners from claims arising from ordinary risks of participation, except for gross negligence or intentional misconduct.",
    options: [{ value: "accepted", label: "I agree and give permission to participate" }],
  },
  {
    key: "medical_authorization",
    title: "Emergency Medical Authorization",
    summary: "Authorize emergency care if you cannot be reached.",
    body:
      "If I cannot be reached during an emergency, I authorize 501 Elite Baseball representatives to obtain reasonable emergency medical evaluation or treatment for my child. I understand that I remain responsible for medical expenses and that this authorization does not replace the medical information supplied during registration.",
    options: [{ value: "accepted", label: "I authorize emergency medical care" }],
  },
  {
    key: "media_release",
    title: "Photo & Media Release",
    summary: "Choose whether your child may appear in team media.",
    body:
      "501 Elite Baseball may photograph or record team activities for team communications, the organization website, social media, publications, recruiting, sponsorship recognition, and program promotion. Names will not be paired with sensitive personal information.",
    options: [
      { value: "accepted", label: "I authorize photo and media use" },
      { value: "declined", label: "I do not authorize photo and media use" },
    ],
  },
  {
    key: "transportation_authorization",
    title: "Transportation Authorization",
    summary: "Choose whether approved adults may transport your child.",
    body:
      "From time to time, transportation to a team activity may be provided by an approved coach, volunteer, or another team parent. Seat belts and applicable child-restraint laws must be followed. Parents will receive trip details whenever practical.",
    options: [
      { value: "accepted", label: "I authorize approved team transportation" },
      { value: "declined", label: "I will provide my child’s transportation" },
    ],
  },
  {
    key: "conduct_handbook",
    title: "Handbook & Code of Conduct",
    summary: "Confirm your family will follow the 501 Elite standards.",
    body:
      "I acknowledge receipt of the current 501 Elite Parent Handbook and Season Guide. I agree that my family will follow team expectations, communication policies, the 24-hour rule, sportsmanship standards, attendance expectations, and decisions made to protect players and the organization.",
    options: [{ value: "accepted", label: "I acknowledge and agree" }],
  },
  {
    key: "financial_commitment",
    title: "Financial Commitment",
    summary: "Acknowledge team fees and payment responsibilities.",
    body:
      "I understand the published team costs, payment schedule, fundraising and sponsorship opportunities, and any stated refund limitations. I agree to communicate promptly with 501 Elite leadership if my family needs confidential financial assistance or cannot meet a payment deadline.",
    options: [{ value: "accepted", label: "I acknowledge the financial commitment" }],
  },
] as const;

export default function ReleaseForms() {
  const [context, setContext] = useState<RegistrationContext | null>(null);
  const [completedKeys, setCompletedKeys] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [response, setResponse] = useState<"accepted" | "declined" | "">("");
  const [signatureName, setSignatureName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const agreement = agreements[currentIndex];
  const complete = completedKeys.length === agreements.length;

  useEffect(() => {
    void initialize();
  }, []);

  async function initialize() {
    try {
      setLoading(true);
      const registrationContext = await loadRegistrationContext();
      const existing = await loadReleaseAcceptances(
        registrationContext.registrationId,
      );
      const keys = existing.map((item) => item.agreement_key);
      setContext(registrationContext);
      setCompletedKeys(keys);
      setSignatureName(existing[0]?.signature_name ?? "");
      const nextIndex = agreements.findIndex((item) => !keys.includes(item.key));
      setCurrentIndex(nextIndex === -1 ? agreements.length - 1 : nextIndex);
    } catch (initializationError) {
      setError(
        initializationError instanceof Error
          ? initializationError.message
          : "The release forms could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  const progress = useMemo(
    () => Math.round((completedKeys.length / agreements.length) * 100),
    [completedKeys],
  );

  async function saveCurrentAgreement() {
    if (!context || !response || !signatureName.trim()) {
      setError("Choose a response and type your full legal name.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await saveReleaseAcceptance({
        context,
        agreementKey: agreement.key,
        agreementVersion: AGREEMENT_VERSION,
        agreementTitle: agreement.title,
        agreementSnapshot: agreement.body,
        response,
        signatureName,
      });

      const nextKeys = Array.from(new Set([...completedKeys, agreement.key]));
      setCompletedKeys(nextKeys);
      setResponse("");

      const nextIndex = agreements.findIndex(
        (item, index) => index > currentIndex && !nextKeys.includes(item.key),
      );

      if (nextIndex !== -1) {
        setCurrentIndex(nextIndex);
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "This release could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <StatusCard text="Loading release forms…" />;
  }

  if (error && !context) {
    return <StatusCard text={error} error />;
  }

  if (complete) {
    return (
      <SectionCompletePrompt
        eyebrow="Release forms complete"
        title="All six forms are signed."
        description="Every response, agreement version, signature, and timestamp has been securely saved. One required document remains."
        continueHref="/registration/documents"
        continueLabel="Upload birth certificate"
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D7193F]">
            Release {currentIndex + 1} of {agreements.length}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {agreement.title}
          </h1>
          <p className="mt-2 text-slate-500">{agreement.summary}</p>
        </div>
        <FileSignature className="h-8 w-8 shrink-0 text-[#123E74]" />
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#D7193F] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-7 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
        {agreement.body}
      </div>

      <div className="mt-6 grid gap-3">
        {agreement.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setResponse(option.value)}
            className={`min-h-14 rounded-full border px-5 text-left font-semibold transition ${
              response === option.value
                ? "border-[#123E74] bg-[#123E74] text-white"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="mt-7 block text-sm font-semibold text-slate-700">
        Electronic signature — full legal name
        <input
          type="text"
          autoComplete="name"
          value={signatureName}
          onChange={(event) => setSignatureName(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-[#123E74]"
          placeholder="Type your full legal name"
        />
      </label>

      <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        Typing your name and continuing creates an electronic signature record
        with the agreement version and timestamp.
      </p>

      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-7 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
        <button
          type="button"
          disabled={currentIndex === 0 || saving}
          onClick={() => {
            setError("");
            setResponse("");
            setCurrentIndex((current) => Math.max(current - 1, 0));
          }}
          className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 font-semibold text-slate-500 disabled:invisible"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() => void saveCurrentAgreement()}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#D7193F] px-6 font-bold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Sign & continue"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function StatusCard({ text, error = false }: { text: string; error?: boolean }) {
  return (
    <div
      className={`mx-auto max-w-xl rounded-3xl border bg-white p-8 text-center shadow-lg ${
        error ? "border-red-200 text-red-700" : "border-slate-200 text-slate-600"
      }`}
    >
      {text}
    </div>
  );
}
