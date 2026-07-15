"use client";

import { useEffect, useState } from "react";
import { ClipboardList, LogOut, ShieldCheck } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type StaffMembership = {
  role: "coach" | "executive" | "admin";
  active: boolean;
};

export default function StaffPage() {
  const [membership, setMembership] = useState<StaffMembership | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Verifying staff access…");

  useEffect(() => {
    void loadStaffAccess();
  }, []);

  async function loadStaffAccess() {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();

    if (!user) {
      window.location.replace("/staff/login");
      return;
    }

    const { data } = await supabaseBrowser
      .from("organization_members")
      .select("role, active")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data?.active) {
      await supabaseBrowser.auth.signOut();
      window.location.replace("/staff/login");
      return;
    }

    if (data.role === "executive" || data.role === "admin") {
      window.location.replace("/executive");
      return;
    }

    setEmail(user.email || "");
    setMembership(data as StaffMembership);
    setStatus("");
  }

  async function signOut() {
    await supabaseBrowser.auth.signOut();
    window.location.replace("/staff/login");
  }

  if (!membership) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-16 text-center text-slate-600">
        {status}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[32px] bg-[#071D39] p-8 text-white shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-red-300">501 Elite OS</p>
          <h1 className="mt-2 text-4xl font-semibold">Coach workspace</h1>
          <p className="mt-3 text-blue-100">{email}</p>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex items-start gap-4">
            <ClipboardList className="mt-1 h-7 w-7 text-[#123E74]" />
            <div>
              <h2 className="text-2xl font-semibold">Coach access is active</h2>
              <p className="mt-2 leading-7 text-slate-600">
                Player and uniform tools will appear here as the coach workspace is released. Private birth certificates remain restricted to authorized executives and administrators.
              </p>
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={signOut}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </main>
  );
}
