"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Database,
  FileWarning,
  LoaderCircle,
  RotateCcw,
  Search,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import {
  loadCurrentMembership,
  loadExecutiveRegistrations,
  type ExecutiveRegistration,
} from "@/lib/executive/executive-service";
import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  duplicateRegistrationIds,
  registrationMatches,
  type RegistrationFilter,
} from "./registration-record-utils";

const filters: { value: RegistrationFilter; label: string }[] = [
  { value: "all", label: "All records" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "missing-documents", label: "Missing documents" },
  { value: "missing-releases", label: "Missing releases" },
  { value: "duplicates", label: "Possible duplicates" },
];

type BulkAction = "archive" | "restore" | "delete";
type RecordView = "active" | "archived";

export default function ExecutiveRecordsIndex() {
  const [registrations, setRegistrations] = useState<ExecutiveRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RegistrationFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
  const [processing, setProcessing] = useState(false);
  const [view, setView] = useState<RecordView>("active");

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await loadCurrentMembership();
      setRegistrations(await loadExecutiveRegistrations(view));
      setSelectedIds(new Set());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Registration records could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    queueMicrotask(() => void loadRecords());
  }, [loadRecords]);

  const duplicateIds = useMemo(() => duplicateRegistrationIds(registrations), [registrations]);
  const visibleRegistrations = useMemo(
    () => registrations.filter((registration) => registrationMatches(registration, search, filter, duplicateIds)),
    [duplicateIds, filter, registrations, search],
  );
  const visibleIds = visibleRegistrations.map(({ id }) => id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  function toggleRecord(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }

  async function runBulkAction() {
    if (!pendingAction || !selectedIds.size) return;
    try {
      setProcessing(true);
      setError("");
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Authentication required.");
      const response = await fetch("/api/executive/registrations/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ action: pendingAction, registrationIds: [...selectedIds] }),
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error || `Unable to ${pendingAction} registrations.`);
      const count = selectedIds.size;
      const actionLabel = pendingAction === "delete" ? "deleted" : pendingAction === "restore" ? "restored" : "archived";
      setNotice(`${count} registration${count === 1 ? "" : "s"} ${actionLabel}.`);
      setSelectedIds(new Set());
      setPendingAction(null);
      await loadRecords();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The bulk action could not be completed.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl pb-28 sm:pb-10">
      <a href="/executive" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-[#123E74] transition hover:border-[#123E74]">
        <ArrowLeft className="h-4 w-4" /> Executive dashboard
      </a>

      <section className="mt-5 overflow-hidden rounded-[32px] bg-[#071D39] p-7 text-white shadow-xl sm:p-10">
        <Database className="h-9 w-9 text-red-300" />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-red-300">Secure operations</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Registration database</h1>
        <p className="mt-3 max-w-2xl text-blue-100">Find, review, and manage every family record from one secure workspace.</p>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:max-w-xl sm:grid-cols-3">
          <Metric value={registrations.length} label={view === "archived" ? "Archived" : "Registrations"} />
          <Metric value={duplicateIds.size} label="Possible duplicates" />
          <Metric value={registrations.filter((item) => item.releaseCount < 6 || item.birthCertificateStatus === "missing").length} label="Need attention" className="col-span-2 sm:col-span-1" />
        </div>
      </section>

      <div className="mt-5 grid grid-cols-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm" role="tablist" aria-label="Registration record status">
        <button type="button" role="tab" aria-selected={view === "active"} onClick={() => { setView("active"); setSearch(""); setFilter("all"); }} className={`min-h-11 rounded-xl px-4 text-sm font-bold transition ${view === "active" ? "bg-[#123E74] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>Active records</button>
        <button type="button" role="tab" aria-selected={view === "archived"} onClick={() => { setView("archived"); setSearch(""); setFilter("all"); }} className={`min-h-11 rounded-xl px-4 text-sm font-bold transition ${view === "archived" ? "bg-[#123E74] text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}><span className="inline-flex items-center gap-2"><Archive className="h-4 w-4" /> Archived records</span></button>
      </div>

      <section aria-label="Registration search and filters" className="sticky top-2 z-20 mt-5 rounded-[26px] border border-slate-200 bg-white/95 p-3 shadow-lg shadow-slate-900/5 backdrop-blur sm:p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <label className="relative block">
            <span className="sr-only">Search registrations</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search player, parent, email, team, season…" className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-11 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#123E74] focus:ring-4 focus:ring-blue-100" />
            {search ? <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200"><X className="h-4 w-4" /></button> : null}
          </label>
          <label className="relative block">
            <span className="sr-only">Filter registrations</span>
            <select value={filter} onChange={(event) => setFilter(event.target.value as RegistrationFilter)} className="min-h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-bold text-[#123E74] outline-none focus:border-[#123E74] focus:ring-4 focus:ring-blue-100">
              {filters.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#123E74]" />
          </label>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 px-1">
          <button type="button" onClick={toggleVisible} disabled={!visibleIds.length} className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#123E74] disabled:opacity-40">
            <SelectionBox checked={allVisibleSelected} /> {allVisibleSelected ? "Clear visible" : "Select visible"}
          </button>
          <p aria-live="polite" className="text-sm font-medium text-slate-500">{visibleRegistrations.length} of {registrations.length}</p>
        </div>
      </section>

      {error ? <Alert tone="error" message={error} onDismiss={() => setError("")} /> : null}
      {notice ? <Alert tone="success" message={notice} onDismiss={() => setNotice("")} /> : null}

      <div className="mt-5 grid gap-3">
        {loading ? <LoadingState /> : visibleRegistrations.map((registration) => (
          <RegistrationCard key={registration.id} registration={registration} duplicate={duplicateIds.has(registration.id)} selected={selectedIds.has(registration.id)} onToggle={() => toggleRecord(registration.id)} />
        ))}
        {!loading && !visibleRegistrations.length ? <EmptyState filtered={registrations.length > 0} onReset={() => { setSearch(""); setFilter("all"); }} /> : null}
      </div>

      {selectedIds.size ? (
        <div className="fixed inset-x-3 bottom-3 z-30 mx-auto max-w-2xl rounded-[24px] border border-white/10 bg-[#071D39] p-3 text-white shadow-2xl sm:sticky sm:inset-auto sm:bottom-5 sm:mt-6">
          <div className="flex items-center gap-2">
            <div className="mr-auto pl-2"><p className="text-sm font-bold">{selectedIds.size} selected</p><p className="text-xs text-blue-200">Bulk actions apply to this selection</p></div>
            {view === "active" ? <button type="button" onClick={() => setPendingAction("archive")} aria-label={`Archive ${selectedIds.size} selected registrations`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-[#123E74]"><Archive className="h-4 w-4" /><span className="hidden sm:inline">Archive</span></button> : <button type="button" onClick={() => setPendingAction("restore")} aria-label={`Restore ${selectedIds.size} selected registrations`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-[#123E74]"><RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">Restore</span></button>}
            <button type="button" onClick={() => setPendingAction("delete")} aria-label={`Delete ${selectedIds.size} selected registrations`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#D7193F] px-4 text-sm font-bold text-white"><Trash2 className="h-4 w-4" /><span className="hidden sm:inline">Delete</span></button>
          </div>
        </div>
      ) : null}

      {pendingAction ? <ConfirmationDialog action={pendingAction} count={selectedIds.size} processing={processing} onCancel={() => !processing && setPendingAction(null)} onConfirm={() => void runBulkAction()} /> : null}
    </div>
  );
}

function RegistrationCard({ registration, duplicate, selected, onToggle }: { registration: ExecutiveRegistration; duplicate: boolean; selected: boolean; onToggle: () => void }) {
  const missingDocuments = registration.birthCertificateStatus === "missing";
  const missingReleases = registration.releaseCount < 6;
  return (
    <article className={`relative rounded-[26px] border bg-white p-5 shadow-sm transition sm:p-6 ${selected ? "border-[#123E74] ring-4 ring-blue-100" : "border-slate-200 hover:border-slate-300"}`}>
      <div className="flex items-start gap-4">
        <button type="button" onClick={onToggle} aria-label={`${selected ? "Deselect" : "Select"} ${registration.playerName}`} aria-pressed={selected} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-[#123E74] hover:bg-blue-50"><SelectionBox checked={selected} /></button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={registration.status} />
            {duplicate ? <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700"><UsersRound className="h-3 w-3" /> Possible duplicate</span> : null}
          </div>
          <h2 className="mt-3 truncate text-xl font-semibold text-slate-950 sm:text-2xl">{registration.playerName}</h2>
          <p className="mt-1 truncate text-sm font-medium text-slate-600">{registration.parentName} · {registration.parentEmail}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
            <span>{registration.season || "Season not set"}</span><span>{registration.familyName}</span><span>DOB {registration.dateOfBirth}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <RequirementBadge warning={missingReleases} label={`Releases ${registration.releaseCount}/6`} />
            <RequirementBadge warning={missingDocuments} label={missingDocuments ? "Birth certificate missing" : `Document ${registration.birthCertificateStatus}`} />
          </div>
        </div>
        <a href={`/executive/records/${registration.id}`} aria-label={`Open ${registration.playerName}'s registration`} className="hidden min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#123E74] px-5 text-sm font-bold text-white sm:inline-flex">Open <ArrowRight className="h-4 w-4" /></a>
      </div>
      <a href={`/executive/records/${registration.id}`} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#123E74] px-5 text-sm font-bold text-white sm:hidden">Open record <ArrowRight className="h-4 w-4" /></a>
    </article>
  );
}

function SelectionBox({ checked }: { checked: boolean }) { return <span aria-hidden="true" className={`flex h-5 w-5 items-center justify-center rounded-md border ${checked ? "border-[#123E74] bg-[#123E74] text-white" : "border-slate-300 bg-white"}`}>{checked ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}</span>; }
function StatusBadge({ status }: { status: string }) { const approved = status.toLowerCase() === "approved"; const submitted = status.toLowerCase() === "submitted"; return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${approved ? "bg-emerald-50 text-emerald-700" : submitted ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{status || "Draft"}</span>; }
function RequirementBadge({ warning, label }: { warning: boolean; label: string }) { return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${warning ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}>{warning ? <FileWarning className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}{label}</span>; }
function Metric({ value, label, className = "" }: { value: number; label: string; className?: string }) { return <div className={`rounded-2xl border border-white/10 bg-white/10 p-4 ${className}`}><p className="text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-blue-100">{label}</p></div>; }
function Alert({ tone, message, onDismiss }: { tone: "error" | "success"; message: string; onDismiss: () => void }) { return <div role={tone === "error" ? "alert" : "status"} className={`mt-5 flex items-center gap-3 rounded-2xl border p-4 text-sm font-semibold ${tone === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}><span className="flex-1">{message}</span><button type="button" onClick={onDismiss} aria-label="Dismiss message" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"><X className="h-4 w-4" /></button></div>; }
function LoadingState() { return <div className="flex min-h-48 items-center justify-center rounded-[26px] border border-slate-200 bg-white text-slate-500"><LoaderCircle className="mr-3 h-5 w-5 animate-spin" /> Loading registration database…</div>; }
function EmptyState({ filtered, onReset }: { filtered: boolean; onReset: () => void }) { return <div className="rounded-[26px] border border-dashed border-slate-300 bg-white p-10 text-center"><Database className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-4 text-lg font-semibold text-slate-900">{filtered ? "No matching registrations" : "No registration records yet"}</h2><p className="mt-2 text-sm text-slate-500">{filtered ? "Try a different search or filter." : "New registrations will appear here."}</p>{filtered ? <button type="button" onClick={onReset} className="mt-5 min-h-11 rounded-full bg-[#123E74] px-5 text-sm font-bold text-white">Clear search and filters</button> : null}</div>; }

function ConfirmationDialog({ action, count, processing, onCancel, onConfirm }: { action: BulkAction; count: number; processing: boolean; onCancel: () => void; onConfirm: () => void }) {
  const deleting = action === "delete";
  const restoring = action === "restore";
  const title = deleting ? "Delete" : restoring ? "Restore" : "Archive";
  const description = deleting ? "This permanently removes the selected registrations and their related files. This cannot be undone." : restoring ? "Restored registrations return to the active records workspace." : "Archived registrations leave the active workspace and remain available for organizational records.";
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#071D39]/70 p-3 backdrop-blur-sm sm:items-center" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onCancel(); }}><div role="alertdialog" aria-modal="true" aria-labelledby="bulk-dialog-title" aria-describedby="bulk-dialog-description" className="w-full max-w-md rounded-[30px] bg-white p-6 shadow-2xl sm:p-8"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${deleting ? "bg-red-50 text-[#D7193F]" : "bg-blue-50 text-[#123E74]"}`}>{deleting ? <Trash2 className="h-6 w-6" /> : restoring ? <RotateCcw className="h-6 w-6" /> : <Archive className="h-6 w-6" />}</div><h2 id="bulk-dialog-title" className="mt-5 text-2xl font-semibold text-slate-950">{title} {count} registration{count === 1 ? "" : "s"}?</h2><p id="bulk-dialog-description" className="mt-3 text-sm leading-6 text-slate-600">{description}</p>{processing ? <div className="mt-5" aria-live="polite"><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-2/3 animate-pulse rounded-full bg-[#123E74]" /></div><p className="mt-2 text-xs font-semibold text-slate-500">Securely processing records…</p></div> : null}<div className="mt-7 grid grid-cols-2 gap-3"><button type="button" onClick={onCancel} disabled={processing} className="min-h-12 rounded-full border border-slate-300 text-sm font-bold text-slate-700 disabled:opacity-50">Cancel</button><button type="button" onClick={onConfirm} disabled={processing} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full text-sm font-bold text-white disabled:opacity-60 ${deleting ? "bg-[#D7193F]" : "bg-[#123E74]"}`}>{processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{processing ? "Processing…" : `Confirm ${action}`}</button></div></div></div>;
}
