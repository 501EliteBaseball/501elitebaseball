"use client";

import { Bell, BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const publicKey = "BJhWPgWNbi-Ib2CquTUb5jCFxLob5Gc_b3HVGmZiggeNshHeAx9QMZS08Ojj4MXU8qdZATPmYv4E3assWrgMRYg";

function keyBytes(value: string) {
  const padded = `${value}${"=".repeat((4 - value.length % 4) % 4)}`;
  return Uint8Array.from(atob(padded.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
}

export default function NotificationCard() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const available = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    queueMicrotask(() => setSupported(available));
    if (available) void navigator.serviceWorker.ready
      .then(registration => registration.pushManager.getSubscription())
      .then(subscription => setEnabled(Boolean(subscription)));
  }, []);

  async function enable() {
    setBusy(true);
    setStatus("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Notifications were not allowed.");
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBytes(publicKey),
      });
      const token = (await supabaseBrowser.auth.getSession()).data.session?.access_token ?? "";
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!response.ok) throw new Error((await response.json()).error ?? "Could not save notification settings.");
      setEnabled(true);
      setStatus("You’ll receive schedule alerts on this device.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Notifications could not be enabled.");
    } finally {
      setBusy(false);
    }
  }

  if (!supported || enabled && !status) return null;
  return <section className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
    <div className="flex gap-3">
      {enabled ? <BellRing className="h-6 w-6 shrink-0 text-[#123E74]" /> : <Bell className="h-6 w-6 shrink-0 text-[#123E74]" />}
      <div className="min-w-0 flex-1">
        <b className="text-[#071D39]">{enabled ? "Notifications are on" : "Never miss a schedule change"}</b>
        <p className="mt-1 text-sm text-slate-600">{status || "Get alerts for new, updated, and cancelled team events."}</p>
        {!enabled ? <button disabled={busy} onClick={() => void enable()} className="mt-3 min-h-11 rounded-full bg-[#123E74] px-5 text-sm font-bold text-white disabled:opacity-60">{busy ? "Turning on…" : "Turn on notifications"}</button> : null}
      </div>
    </div>
  </section>;
}
