"use client";

import { Download, Trash2 } from "lucide-react";
import {
  openRegistrationDocument,
  type ExecutiveRegistration,
  type OrganizationMember,
} from "@/lib/executive/executive-service";

type ExecutiveRegistrationDetailProps = {
  registration: ExecutiveRegistration;
  membership: OrganizationMember;
  deleting: boolean;
  onDelete: () => Promise<void>;
};

export default function ExecutiveRegistrationDetail({
  registration,
  membership,
  deleting,
  onDelete,
}: ExecutiveRegistrationDetailProps) {
  const address = [
    registration.family.address_line_1,
    registration.family.address_line_2,
    registration.family.city,
    registration.family.state,
    registration.family.postal_code,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mt-6 space-y-5 border-t border-slate-200 pt-6">
      <DataSection title="Registration">
        <Field label="Registration ID" value={registration.id} />
        <Field label="Status" value={registration.status} />
        <Field label="Season" value={registration.season} />
        <Field label="Submitted" value={formatDate(registration.submittedAt)} />
      </DataSection>

      <DataSection title="Family & parent">
        <Field label="Family" value={registration.familyName} />
        <Field label="Address" value={address} />
        <Field label="Parent / guardian" value={registration.parentName} />
        <Field label="Email" value={registration.parent.email} />
        <Field label="Phone" value={registration.parent.phone} />
      </DataSection>

      <DataSection title="Player">
        <Field
          label="Legal name"
          value={[
            registration.player.first_name,
            registration.player.middle_name,
            registration.player.last_name,
          ]
            .filter(Boolean)
            .join(" ")}
        />
        <Field label="Preferred name" value={registration.player.preferred_name} />
        <Field label="Date of birth" value={registration.player.date_of_birth} />
        <Field label="Gender" value={registration.player.gender} />
        <Field label="School" value={registration.player.school} />
        <Field label="Grade" value={registration.player.grade} />
        <Field label="Bats / throws" value={[registration.player.bats, registration.player.throws].filter(Boolean).join(" / ")} />
        <Field label="Preferred number" value={registration.player.jersey_number_preference} />
      </DataSection>

      <DataSection title="Emergency contact">
        {registration.emergency ? (
          <>
            <Field label="Name" value={registration.emergency.name} />
            <Field label="Relationship" value={registration.emergency.relationship} />
            <Field label="Phone" value={registration.emergency.phone} />
            <Field label="Alternate phone" value={registration.emergency.alternate_phone} />
            <Field
              label="Authorized pickup"
              value={registration.emergency.authorized_pickup ? "Yes" : "No"}
            />
          </>
        ) : (
          <RestrictedMessage text="No emergency record is available for this registration." />
        )}
      </DataSection>

      <DataSection title="Medical">
        {membership.can_view_medical && registration.medical ? (
          <>
            <Field label="Physician" value={registration.medical.physician_name} />
            <Field label="Physician phone" value={registration.medical.physician_phone} />
            <Field label="Insurance provider" value={registration.medical.insurance_provider} />
            <Field label="Policy number" value={registration.medical.policy_number} />
            <Field label="Allergies" value={registration.medical.allergies} />
            <Field label="Medications" value={registration.medical.medications} />
            <Field label="Medical conditions" value={registration.medical.medical_conditions} />
            <Field label="Special instructions" value={registration.medical.special_instructions} />
          </>
        ) : (
          <RestrictedMessage text="Medical access is restricted for this staff account." />
        )}
      </DataSection>

      <DataSection title="Uniform">
        {registration.uniform ? (
          <>
            <Field label="Jersey size" value={registration.uniform.jersey_size} />
            <Field label="Pants size" value={registration.uniform.pants_size} />
            <Field label="Hat size" value={registration.uniform.hat_size} />
            <Field label="Jersey name" value={registration.uniform.jersey_name} />
            <Field label="Jersey number" value={registration.uniform.jersey_number_preference} />
          </>
        ) : (
          <RestrictedMessage text="No uniform record has been saved." />
        )}
      </DataSection>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-lg font-semibold text-slate-950">
          Releases ({registration.releaseCount}/6)
        </h3>
        <div className="mt-4 space-y-3">
          {registration.releases.map((release) => (
            <div key={release.id} className="rounded-2xl bg-white p-4 text-sm">
              <p className="font-semibold text-slate-900">{release.agreement_title}</p>
              <p className="mt-1 text-slate-500">
                {release.response} · Signed by {release.signature_name} · {formatDate(release.signed_at)}
              </p>
              <p className="mt-1 text-xs text-slate-400">Version {release.agreement_version}</p>
            </div>
          ))}
          {!registration.releases.length ? (
            <RestrictedMessage text="No release forms have been signed." />
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-lg font-semibold text-slate-950">Private documents</h3>
        <div className="mt-4 space-y-3">
          {membership.can_view_documents
            ? registration.documents
                .filter((document) => document.status !== "replaced")
                .map((document) => (
                  <div
                    key={document.id}
                    className="flex flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="break-all font-semibold text-slate-900">
                        {document.original_filename}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                        {document.status} · {formatBytes(document.size_bytes)} · {formatDate(document.created_at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void openRegistrationDocument(document.storage_path)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#123E74] px-5 text-sm font-bold text-white"
                    >
                      <Download className="h-4 w-4" />
                      Open secure file
                    </button>
                  </div>
                ))
            : null}
          {!membership.can_view_documents ? (
            <RestrictedMessage text="Private document access is restricted for this staff account." />
          ) : null}
          {membership.can_view_documents &&
          !registration.documents.some((document) => document.status !== "replaced") ? (
            <RestrictedMessage text="No birth certificate has been uploaded." />
          ) : null}
        </div>
      </section>

      {membership.role === "admin" ? (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-semibold text-red-900">Administrator action</h3>
          <p className="mt-2 text-sm leading-6 text-red-700">
            Deleting this registration permanently removes its releases,
            registration-specific uniform record, document metadata, and stored
            private files. The family and player profiles remain available.
          </p>
          <button
            type="button"
            disabled={deleting}
            onClick={() => void onDelete()}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting…" : "Delete registration"}
          </button>
        </section>
      ) : null}
    </div>
  );
}

function DataSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-800">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function RestrictedMessage({ text }: { text: string }) {
  return <p className="text-sm leading-6 text-slate-500">{text}</p>;
}

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null) {
  if (!value) return "Not provided";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
