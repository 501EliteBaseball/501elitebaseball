"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSignOut() {
    setLoading(true);
    setStatus("");

    const { error } = await supabaseBrowser.auth.signOut();
    setLoading(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    router.replace("/login");
  }

  return (
    <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full bg-[#D7193F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b21431] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing out…" : "Sign out"}
      </button>
      {status ? <p className="text-sm text-red-700">{status}</p> : null}
    </div>
  );
}
