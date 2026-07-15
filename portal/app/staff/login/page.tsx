"use client";

import { useState } from "react";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const STAFF_ROLES = ["coach", "executive", "admin"];

export default function StaffLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setLoading(true);

    const { data, error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      setLoading(false);
      setStatus(error?.message || "A staff session could not be created.");
      return;
    }

    const { data: membership, error: membershipError } = await supabaseBrowser
      .from("organization_members")
      .select("role, active")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (
      membershipError ||
      !membership?.active ||
      !STAFF_ROLES.includes(membership.role)
    ) {
      await supabaseBrowser.auth.signOut();
      setLoading(false);
      setStatus("This account does not have active 501 Elite staff access.");
      return;
    }

    window.location.assign(
      membership.role === "coach" ? "/staff" : "/executive",
    );
  }

  return (
    <main className="min-h-screen bg-[#071D39] px-6 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto flex max-w-xl flex-col gap-8 rounded-[32px] bg-white p-8 shadow-[0_32px_100px_rgba(0,0,0,0.28)] sm:p-10">
        <section className="space-y-3 text-center">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#123E74]/10 text-[#123E74]">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#D7193F]">501 Elite OS</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Coaches &amp; executives</h1>
          <p className="text-sm leading-6 text-slate-600">
            Secure access for authorized team staff and organizational leadership.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="staff-email" className="block text-sm font-medium text-slate-700">Staff email</label>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#123E74] focus-within:ring-2 focus-within:ring-[#123E74]/20">
              <Mail className="h-5 w-5 text-slate-400" />
              <input
                id="staff-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border-0 bg-transparent p-0 text-base text-slate-950 outline-none"
                placeholder="name@501elitebaseball.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="staff-password" className="block text-sm font-medium text-slate-700">Password</label>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#123E74] focus-within:ring-2 focus-within:ring-[#123E74]/20">
              <Lock className="h-5 w-5 text-slate-400" />
              <input
                id="staff-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border-0 bg-transparent p-0 text-base text-slate-950 outline-none"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#D7193F] px-6 font-bold text-white transition hover:bg-[#b21431] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying access…" : "Staff sign in"}
            <ArrowRight className="h-4 w-4" />
          </button>

          {status ? <div className="rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700">{status}</div> : null}
        </form>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-700">
          Parent or guardian? <a href="/login" className="font-semibold text-[#123E74] hover:underline">Use parent sign in</a>.
        </div>
      </div>
    </main>
  );
}
