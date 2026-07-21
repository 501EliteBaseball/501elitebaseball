"use client";

import { Pencil, Trash2, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { FamilyPlayer } from "@/lib/family/family-dashboard-service";

const emptyPlayer: FamilyPlayer = {
  id: "",
  firstName: "",
  middleName: "",
  lastName: "",
  preferredName: "",
  dateOfBirth: "",
  gender: "",
  school: "",
  grade: "",
  jerseyNumberPreference: "",
  bats: "",
  throws: "",
};

export default function PlayerManager({
  familyId,
  players,
}: {
  familyId: string;
  players: FamilyPlayer[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<FamilyPlayer | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");

    const values = {
      first_name: editing.firstName.trim(),
      middle_name: editing.middleName.trim(),
      last_name: editing.lastName.trim(),
      preferred_name: editing.preferredName.trim(),
      date_of_birth: editing.dateOfBirth || null,
      gender: editing.gender,
      school: editing.school.trim(),
      grade: editing.grade,
      jersey_number_preference: editing.jerseyNumberPreference.trim(),
      bats: editing.bats,
      throws: editing.throws,
    };

    const query = editing.id
      ? supabaseBrowser
          .from("players")
          .update(values)
          .eq("id", editing.id)
          .eq("family_id", familyId)
      : supabaseBrowser.from("players").insert({ family_id: familyId, ...values });

    const { error: saveError } = await query.select("id").single();
    setSaving(false);

    if (saveError) {
      setError(saveError.message || "We couldn't save this player.");
      return;
    }

    setEditing(null);
    router.refresh();
  }

  async function remove(player: FamilyPlayer) {
    const name = `${player.preferredName || player.firstName} ${player.lastName}`.trim();
    if (!window.confirm(`Remove ${name}? This is intended for duplicates and cannot be undone.`)) return;

    setDeletingId(player.id);
    setError("");

    const { data: linked, error: lookupError } = await supabaseBrowser
      .from("registrations")
      .select("id,status")
      .eq("player_id", player.id)
      .limit(1);

    if (lookupError) {
      setError(lookupError.message || "We couldn't verify this player.");
      setDeletingId(null);
      return;
    }

    if (linked?.length) {
      setError(
        `${name} is linked to a ${linked[0].status} registration. Contact an executive before removing this record so releases, documents, and uniform details stay intact.`,
      );
      setDeletingId(null);
      return;
    }

    const { error: deleteError } = await supabaseBrowser
      .from("players")
      .delete()
      .eq("id", player.id)
      .eq("family_id", familyId);

    setDeletingId(null);

    if (deleteError) {
      setError(deleteError.message || "We couldn't remove this player.");
      return;
    }

    router.refresh();
  }

  function field(
    label: string,
    key: keyof FamilyPlayer,
    options?: { type?: string; required?: boolean; placeholder?: string },
  ) {
    if (!editing) return null;
    return (
      <label className="grid gap-1 text-sm font-bold text-[#071D39]">
        {label}
        <input
          type={options?.type || "text"}
          required={options?.required}
          placeholder={options?.placeholder}
          value={String(editing[key] || "")}
          onChange={(event) => setEditing({ ...editing, [key]: event.target.value })}
          className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none focus:border-[#123E74] focus:ring-2 focus:ring-blue-100"
        />
      </label>
    );
  }

  function select(label: string, key: keyof FamilyPlayer, values: string[]) {
    if (!editing) return null;
    return (
      <label className="grid gap-1 text-sm font-bold text-[#071D39]">
        {label}
        <select
          value={String(editing[key] || "")}
          onChange={(event) => setEditing({ ...editing, [key]: event.target.value })}
          className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 font-normal outline-none focus:border-[#123E74] focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Select</option>
          {values.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div className="mt-5">
      <div className="space-y-3">
        {players.map((player) => (
          <article key={player.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-[#123E74]">
                <UserRound className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <b className="block text-[#071D39]">
                  {player.preferredName || player.firstName} {player.lastName}
                </b>
                <p className="mt-1 text-sm text-slate-500">
                  {[player.grade && `${player.grade} grade`, player.school].filter(Boolean).join(" · ") ||
                    "501 Elite player"}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setEditing(player);
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#123E74] px-3 text-sm font-bold text-white"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                disabled={deletingId === player.id}
                onClick={() => remove(player)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-bold text-[#D7193F] disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {deletingId === player.id ? "Removing…" : "Remove duplicate"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {!players.length ? (
        <div className="rounded-2xl border border-dashed bg-white p-6 text-center text-sm text-slate-500">
          No players are attached to this family account yet.
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setError("");
          setEditing({ ...emptyPlayer });
        }}
        className="mt-4 min-h-12 w-full rounded-xl border-2 border-[#123E74] px-4 font-bold text-[#123E74]"
      >
        Add another player
      </button>

      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      {editing ? (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#071D39]/70 p-3 py-[max(1rem,env(safe-area-inset-top))]">
          <form onSubmit={save} className="mx-auto max-w-xl rounded-3xl bg-[#F5F7FB] p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#D7193F]">Family player record</p>
                <h2 className="mt-1 text-2xl font-black text-[#071D39]">
                  {editing.id ? "Edit player" : "Add player"}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setEditing(null)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {field("First name", "firstName", { required: true })}
              {field("Middle name", "middleName")}
              {field("Last name", "lastName", { required: true })}
              {field("Preferred name", "preferredName")}
              {field("Date of birth", "dateOfBirth", { type: "date" })}
              {select("Gender", "gender", ["Male", "Female", "Other"])}
              {field("School", "school")}
              {select("Grade", "grade", ["Pre-K", "K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"])}
              {field("Jersey number preference", "jerseyNumberPreference")}
              {select("Bats", "bats", ["Right", "Left", "Switch"])}
              {select("Throws", "throws", ["Right", "Left"])}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="min-h-12 rounded-xl border bg-white px-4 font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="min-h-12 rounded-xl bg-[#D7193F] px-4 font-bold text-white disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save player"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
