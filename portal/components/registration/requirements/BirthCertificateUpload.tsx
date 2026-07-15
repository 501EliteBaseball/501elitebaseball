"use client";

import { useEffect, useState } from "react";
import { FileUp, LockKeyhole, Upload } from "lucide-react";
import SectionCompletePrompt from "@/components/registration/requirements/SectionCompletePrompt";
import {
  loadBirthCertificate,
  loadRegistrationContext,
  uploadBirthCertificate,
  type RegistrationContext,
  type RegistrationDocument,
} from "@/lib/registration/registration-requirements-service";

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BirthCertificateUpload() {
  const [context, setContext] = useState<RegistrationContext | null>(null);
  const [document, setDocument] = useState<RegistrationDocument | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void initialize();
  }, []);

  async function initialize() {
    try {
      const registrationContext = await loadRegistrationContext();
      const existing = await loadBirthCertificate(
        registrationContext.registrationId,
      );
      setContext(registrationContext);
      setDocument(existing);
    } catch (initializationError) {
      setError(
        initializationError instanceof Error
          ? initializationError.message
          : "Document requirements could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function upload() {
    if (!context || !file) {
      setError("Choose a birth certificate file first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      const savedDocument = await uploadBirthCertificate({ context, file });
      setDocument(savedDocument);
      setFile(null);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The birth certificate could not be uploaded.",
      );
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <StatusCard text="Loading document requirements…" />;
  }

  if (error && !context) {
    return <StatusCard text={error} error />;
  }

  if (document) {
    return (
      <SectionCompletePrompt
        eyebrow="Required document complete"
        title="Birth certificate uploaded."
        description="The private document is securely stored and available only to your family and specifically authorized administrators."
        continueHref="/registration/success"
        continueLabel="Finish registration"
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#123E74]/10 text-[#123E74]">
          <FileUp className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D7193F]">
            Required document
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            {context?.playerName}’s birth certificate
          </h1>
          <p className="mt-3 leading-7 text-slate-500">
            Upload a clear JPG, PNG, or PDF. The maximum file size is 10 MB.
          </p>
        </div>
      </div>

      <div className="mt-7 flex items-start gap-3 rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-[#123E74]">
        <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          This file is stored in a private Supabase bucket. It is available only
          to your family and specifically authorized executives or administrators.
          Coaches do not receive birth-certificate access.
        </p>
      </div>

      <label className="mt-7 block cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-7 text-center transition hover:border-[#123E74]">
        <Upload className="mx-auto h-8 w-8 text-[#123E74]" />
        <span className="mt-3 block font-semibold text-slate-800">
          {file ? file.name : "Choose a file"}
        </span>
        <span className="mt-1 block text-sm text-slate-500">
          JPG, PNG, or PDF · 10 MB maximum
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="sr-only"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>

      {file ? (
        <button
          type="button"
          disabled={uploading}
          onClick={() => void upload()}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#D7193F] px-6 font-bold text-white disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading securely…" : "Upload birth certificate"}
        </button>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

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
