"use client";

import { useState } from "react";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setLoading(true);

    const redirectTo = `${window.location.origin}/login`;
    const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("If an account exists for that email, instructions have been sent.");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto flex max-w-xl flex-col gap-8 rounded-[32px] bg-white p-8 shadow-[0_32px_100px_rgba(18,62,116,0.12)]">
        <section className="space-y-3 text-center">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D7193F]/10 text-[#D7193F] shadow-sm shadow-[#D7193F]/10">
            <Sparkles className="h-8 w-8" />
          </div>
          <p className="text-sm uppercase tracking-[0.35em] text-[#123E74]">501 Elite OS</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Reset your password</h1>
          <p className="text-sm leading-6 text-slate-600">Enter the email address associated with your account and follow the instructions in the password reset email.</p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#123E74] focus-within:ring-2 focus-within:ring-[#123E74]/20">
              <Mail className="h-5 w-5 text-slate-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border-0 bg-transparent p-0 text-base text-slate-950 outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#123E74] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f335f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending reset link…" : "Send reset link"}
            <ArrowRight className="h-4 w-4" />
          </button>

          {status ? <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{status}</div> : null}
        </form>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Remembered your password? <a href="/login" className="font-semibold text-[#D7193F] hover:underline">Sign in</a>.
        </div>
      </div>
    </main>
  );
}
