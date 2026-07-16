"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarClock,
  Edit3,
  Megaphone,
  Plus,
  Trash2,
} from "lucide-react";
import Button from "@/components/design-system/Button";
import Card from "@/components/design-system/Card";
import {
  createAnnouncement,
  deleteAnnouncement,
  loadAnnouncements,
  setAnnouncementActive,
  swapAnnouncementOrder,
  updateAnnouncement,
} from "@/lib/announcements/announcement-service";
import type {
  Announcement,
  AnnouncementInput,
  AnnouncementPriority,
} from "@/lib/announcements/announcement-types";

type FormState = {
  title: string;
  message: string;
  buttonText: string;
  linkUrl: string;
  priority: AnnouncementPriority;
  active: boolean;
  startsAt: string;
  endsAt: string;
  displayOrder: string;
};

const emptyForm: FormState = {
  title: "",
  message: "",
  buttonText: "",
  linkUrl: "",
  priority: "normal",
  active: true,
  startsAt: "",
  endsAt: "",
  displayOrder: "0",
};

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function getScheduleStatus(announcement: Announcement) {
  if (!announcement.active) return "Inactive";
  const now = Date.now();
  const starts = announcement.starts_at ? new Date(announcement.starts_at).getTime() : null;
  const ends = announcement.ends_at ? new Date(announcement.ends_at).getTime() : null;
  if (starts && starts > now) return "Scheduled";
  if (ends && ends <= now) return "Expired";
  return "Live";
}

export default function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const nextDisplayOrder = useMemo(
    () => Math.max(-1, ...announcements.map((item) => item.display_order)) + 1,
    [announcements],
  );

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      setError("");
      setAnnouncements(await loadAnnouncements());
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Announcements could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, displayOrder: String(nextDisplayOrder) });
    setStatus("");
    document.getElementById("announcement-editor")?.scrollIntoView({ behavior: "smooth" });
  }

  function startEdit(announcement: Announcement) {
    setEditingId(announcement.id);
    setForm({
      title: announcement.title,
      message: announcement.message,
      buttonText: announcement.button_text ?? "",
      linkUrl: announcement.link_url ?? "",
      priority: announcement.priority,
      active: announcement.active,
      startsAt: toLocalInput(announcement.starts_at),
      endsAt: toLocalInput(announcement.ends_at),
      displayOrder: String(announcement.display_order),
    });
    setStatus("");
    document.getElementById("announcement-editor")?.scrollIntoView({ behavior: "smooth" });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (Boolean(form.buttonText.trim()) !== Boolean(form.linkUrl.trim())) {
      setError("Button text and button link must either both be filled in or both be blank.");
      return;
    }

    if (
      form.linkUrl.trim() &&
      !form.linkUrl.trim().startsWith("/") &&
      !/^https?:\/\//i.test(form.linkUrl.trim())
    ) {
      setError("The button link must be an internal path or a full http(s) URL.");
      return;
    }

    const startsAt = toIso(form.startsAt);
    const endsAt = toIso(form.endsAt);
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      setError("The end date must be later than the start date.");
      return;
    }

    const input: AnnouncementInput = {
      title: form.title.trim(),
      message: form.message.trim(),
      button_text: form.buttonText.trim() || null,
      link_url: form.linkUrl.trim() || null,
      priority: form.priority,
      active: form.active,
      starts_at: startsAt,
      ends_at: endsAt,
      display_order: Number.parseInt(form.displayOrder, 10) || 0,
    };

    try {
      setSaving(true);
      if (editingId) {
        await updateAnnouncement(editingId, input);
        setStatus("Announcement updated.");
      } else {
        await createAnnouncement(input);
        setStatus("Announcement created.");
      }
      setEditingId(null);
      setForm({ ...emptyForm, displayOrder: String(input.display_order + 1) });
      await refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Announcement could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(announcement: Announcement) {
    try {
      setError("");
      await setAnnouncementActive(announcement.id, !announcement.active);
      setStatus(announcement.active ? "Announcement deactivated." : "Announcement activated.");
      await refresh();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Status could not be changed.");
    }
  }

  async function remove(announcement: Announcement) {
    if (!window.confirm(`Delete “${announcement.title}”? This cannot be undone.`)) return;
    try {
      setError("");
      await deleteAnnouncement(announcement.id);
      setStatus("Announcement deleted.");
      await refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Announcement could not be deleted.");
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (!announcements[index] || !announcements[target]) return;
    try {
      setError("");
      await swapAnnouncementOrder(announcements[index], announcements[target]);
      setStatus("Display order updated.");
      await refresh();
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : "Display order could not be updated.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 rounded-[32px] bg-[#071D39] p-7 text-white shadow-xl sm:p-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/executive" className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Executive dashboard
          </Link>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-red-300">Homepage communications</p>
          <h1 className="mt-3 text-4xl font-semibold">Announcements</h1>
          <p className="mt-3 max-w-2xl text-blue-100">
            Publish scheduled updates to the public homepage without redeploying the website.
          </p>
        </div>
        <Button size="lg" leftIcon={<Plus className="h-4 w-4" />} onClick={startCreate} className="bg-[#D7193F] hover:bg-[#B91537]">
          New announcement
        </Button>
      </div>

      {(error || status) && (
        <div role="status" className={`mt-5 rounded-2xl border p-4 text-sm font-semibold ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {error || status}
        </div>
      )}

      <section className="mt-7 grid gap-4" aria-label="Existing announcements">
        {loading ? <Card>Loading announcements…</Card> : null}
        {!loading && !announcements.length ? <Card className="text-center text-slate-500">No announcements yet. Create the first homepage update.</Card> : null}

        {announcements.map((announcement, index) => (
          <Card key={announcement.id}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${announcement.priority === "urgent" ? "bg-red-100 text-red-800" : announcement.priority === "important" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                    {announcement.priority}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{getScheduleStatus(announcement)}</span>
                  <span className="text-xs font-semibold text-slate-500">Order {announcement.display_order}</span>
                </div>
                <h2 className="mt-3 text-2xl font-bold text-slate-950">{announcement.title}</h2>
                <p className="mt-2 max-w-3xl text-slate-600">{announcement.message}</p>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <CalendarClock className="h-4 w-4" />
                  Starts: {announcement.starts_at ? new Date(announcement.starts_at).toLocaleString() : "Immediately"} · Ends: {announcement.ends_at ? new Date(announcement.ends_at).toLocaleString() : "No end date"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 lg:max-w-80 lg:justify-end">
                <Button variant="secondary" size="icon" aria-label="Move announcement up" disabled={index === 0} onClick={() => void move(index, -1)}><ArrowUp className="h-4 w-4" /></Button>
                <Button variant="secondary" size="icon" aria-label="Move announcement down" disabled={index === announcements.length - 1} onClick={() => void move(index, 1)}><ArrowDown className="h-4 w-4" /></Button>
                <Button variant="secondary" onClick={() => void toggleActive(announcement)}>{announcement.active ? "Deactivate" : "Activate"}</Button>
                <Button variant="secondary" size="icon" aria-label={`Edit ${announcement.title}`} onClick={() => startEdit(announcement)}><Edit3 className="h-4 w-4" /></Button>
                <Button variant="danger" size="icon" aria-label={`Delete ${announcement.title}`} onClick={() => void remove(announcement)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <Card id="announcement-editor" className="mt-8 scroll-mt-8" padding="lg">
        <div className="flex items-start gap-4">
          <Megaphone className="mt-1 h-7 w-7 text-[#123E74]" />
          <div>
            <h2 className="text-2xl font-bold">{editingId ? "Edit announcement" : "Create announcement"}</h2>
            <p className="mt-1 text-sm text-slate-500">Only active announcements inside their start and end dates appear publicly.</p>
          </div>
        </div>

        <form onSubmit={save} className="mt-7 grid gap-5 lg:grid-cols-2">
          <Field label="Title" className="lg:col-span-2">
            <input required maxLength={120} value={form.title} onChange={(event) => updateField("title", event.target.value)} className="announcement-input" />
          </Field>
          <Field label="Message" className="lg:col-span-2">
            <textarea required maxLength={500} rows={4} value={form.message} onChange={(event) => updateField("message", event.target.value)} className="announcement-input resize-y" />
          </Field>
          <Field label="Optional button text">
            <input maxLength={40} value={form.buttonText} onChange={(event) => updateField("buttonText", event.target.value)} className="announcement-input" />
          </Field>
          <Field label="Optional button link">
            <input placeholder="/parents or https://…" value={form.linkUrl} onChange={(event) => updateField("linkUrl", event.target.value)} className="announcement-input" />
          </Field>
          <Field label="Priority">
            <select value={form.priority} onChange={(event) => updateField("priority", event.target.value as AnnouncementPriority)} className="announcement-input">
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>
          </Field>
          <Field label="Display order">
            <input type="number" min="0" value={form.displayOrder} onChange={(event) => updateField("displayOrder", event.target.value)} className="announcement-input" />
          </Field>
          <Field label="Start date and time">
            <input type="datetime-local" value={form.startsAt} onChange={(event) => updateField("startsAt", event.target.value)} className="announcement-input" />
          </Field>
          <Field label="End date and time">
            <input type="datetime-local" value={form.endsAt} onChange={(event) => updateField("endsAt", event.target.value)} className="announcement-input" />
          </Field>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 font-semibold lg:col-span-2">
            <input type="checkbox" checked={form.active} onChange={(event) => updateField("active", event.target.checked)} className="h-5 w-5 accent-[#123E74]" />
            Active and eligible to display during its schedule
          </label>

          <div className="flex flex-wrap justify-end gap-3 lg:col-span-2">
            {editingId ? <Button variant="secondary" onClick={() => { setEditingId(null); setForm({ ...emptyForm, displayOrder: String(nextDisplayOrder) }); }}>Cancel edit</Button> : null}
            <Button type="submit" size="lg" loading={saving}>{editingId ? "Save changes" : "Create announcement"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={`grid gap-2 text-sm font-bold text-slate-800 ${className}`}>
      {label}
      {children}
    </label>
  );
}
