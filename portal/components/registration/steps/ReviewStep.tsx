"use client";

import Link from "next/link";
import {
  Check,
  CheckCircle2,
  HeartPulse,
  Home,
  Pencil,
  Phone,
  Shirt,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

type ProfileForm = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
};

type FamilyForm = {
  family_name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
};

type PlayerForm = {
  first_name: string;
  middle_name: string;
  last_name: string;
  preferred_name: string;
  date_of_birth: string;
  gender: string;
  school: string;
  grade: string;
  jersey_number_preference: string;
  bats: string;
  throws: string;
};

type EmergencyForm = {
  name: string;
  relationship: string;
  phone: string;
  alternate_phone: string;
  authorized_pickup: boolean;
};

type MedicalForm = {
  physician_name: string;
  physician_phone: string;
  insurance_provider: string;
  policy_number: string;
  allergies: string;
  medications: string;
  medical_conditions: string;
  special_instructions: string;
};

type UniformForm = {
  jersey_size: string;
  pants_size: string;
  hat_size: string;
  jersey_name: string;
  jersey_number_preference: string;
};

type ReviewStepProps = {
  profile: ProfileForm;
  family: FamilyForm;
  player: PlayerForm;
  emergency: EmergencyForm;
  medical: MedicalForm;
  uniform: UniformForm;
};

type SummaryCardProps = {
  title: string;
  eyebrow: string;
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

function SummaryCard({
  title,
  eyebrow,
  href,
  icon,
  children,
}: SummaryCardProps) {
  return (
    <section className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_50px_rgba(18,62,116,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(18,62,116,0.13)] sm:p-6">
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#123E74]/5 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#123E74]/10 text-[#123E74]">
              {icon}
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                {eyebrow}
              </p>

              <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-slate-950">
                {title}
              </h3>
            </div>
          </div>

          <Link
            href={href}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-xs font-bold text-[#123E74] transition hover:border-[#123E74]/30 hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>

        <div className="mt-5">{children}</div>

        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-emerald-700">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-3 w-3" />
          </span>
          Section complete
        </div>
      </div>
    </section>
  );
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-5 py-1.5">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-semibold leading-6 text-slate-800">
        {value?.trim() || "Not provided"}
      </span>
    </div>
  );
}

export default function ReviewStep({
  profile,
  family,
  player,
  emergency,
  medical,
  uniform,
}: ReviewStepProps) {
  const playerName =
    player.preferred_name.trim() ||
    player.first_name.trim() ||
    "Your athlete";

  const fullPlayerName = [
    player.first_name,
    player.middle_name,
    player.last_name,
  ]
    .filter((value) => value.trim())
    .join(" ");

  const address = [
    family.address_line_1,
    family.address_line_2,
    [family.city, family.state].filter(Boolean).join(", "),
    family.postal_code,
  ]
    .filter((value) => value.trim())
    .join(" · ");

  const hasMedicalAlerts =
    medical.allergies.trim().toLowerCase() !== "none" ||
    medical.medications.trim().toLowerCase() !== "none" ||
    medical.medical_conditions.trim().toLowerCase() !== "none";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rounded-[32px] border border-emerald-200/80 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_72%)] p-6 shadow-[0_20px_70px_rgba(5,150,105,0.10)] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-emerald-600 text-white shadow-[0_14px_30px_rgba(5,150,105,0.24)]">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
                Everything looks great
              </p>

              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Review {playerName}’s registration.
              </h3>

              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                Confirm each section below. You can make changes before
                submitting.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Ready to submit
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <SummaryCard
          title={`${profile.first_name} ${profile.last_name}`}
          eyebrow="Parent"
          href="/registration/parent"
          icon={<UserRound className="h-5 w-5" />}
        >
          <DataRow label="Phone" value={profile.phone} />
          <DataRow label="Email" value={profile.email} />
        </SummaryCard>

        <SummaryCard
          title={family.family_name}
          eyebrow="Family"
          href="/registration/family"
          icon={<Home className="h-5 w-5" />}
        >
          <DataRow label="Address" value={address} />
        </SummaryCard>

        <SummaryCard
          title={fullPlayerName}
          eyebrow="Player"
          href="/registration/player"
          icon={<UsersRound className="h-5 w-5" />}
        >
          <DataRow label="Preferred name" value={player.preferred_name} />
          <DataRow label="Birthday" value={player.date_of_birth} />
          <DataRow
            label="School"
            value={
              [player.school, player.grade].filter(Boolean).join(" · ") ||
              undefined
            }
          />
          <DataRow
            label="Baseball profile"
            value={`Bats ${player.bats || "—"} · Throws ${
              player.throws || "—"
            }`}
          />
        </SummaryCard>

        <SummaryCard
          title={emergency.name}
          eyebrow="Emergency contact"
          href="/registration/emergency"
          icon={<Phone className="h-5 w-5" />}
        >
          <DataRow label="Relationship" value={emergency.relationship} />
          <DataRow label="Primary phone" value={emergency.phone} />
          <DataRow
            label="Pickup"
            value={
              emergency.authorized_pickup
                ? "Authorized for pickup"
                : "Emergency contact only"
            }
          />
        </SummaryCard>

        <SummaryCard
          title="Medical care profile"
          eyebrow="Medical"
          href="/registration/medical"
          icon={<HeartPulse className="h-5 w-5" />}
        >
          <DataRow label="Physician" value={medical.physician_name} />
          <DataRow label="Physician phone" value={medical.physician_phone} />
          <DataRow
            label="Insurance"
            value={medical.insurance_provider}
          />

          <div
            className={`mt-3 rounded-2xl border px-4 py-3 ${
              hasMedicalAlerts
                ? "border-amber-200 bg-amber-50"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                hasMedicalAlerts ? "text-amber-800" : "text-emerald-700"
              }`}
            >
              {hasMedicalAlerts
                ? "Medical notes have been provided"
                : "No active medical alerts reported"}
            </p>
          </div>
        </SummaryCard>

        <SummaryCard
          title={`${playerName}’s uniform`}
          eyebrow="Uniform"
          href="/registration/uniform"
          icon={<Shirt className="h-5 w-5" />}
        >
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Jersey", uniform.jersey_size],
              ["Pants", uniform.pants_size],
              ["Hat", uniform.hat_size],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-center"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-base font-bold text-slate-950">
                  {value || "—"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-[#123E74] px-4 py-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
              Jersey
            </p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <p className="truncate text-lg font-bold uppercase">
                {uniform.jersey_name || player.last_name || playerName}
              </p>
              <p className="text-3xl font-black">
                #{uniform.jersey_number_preference || "—"}
              </p>
            </div>
          </div>
        </SummaryCard>
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#123E74] shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <p className="font-semibold text-slate-950">
              Your information is ready.
            </p>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Selecting Submit Registration confirms that the information above
              is accurate to the best of your knowledge. Your registration will
              move from draft to submitted status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
