"use client";

import { ArrowUpRight, BellRing, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { TeamAnnouncement } from "@/lib/announcements/announcement-types";

export default function AnnouncementInbox() {
  const [items, setItems] = useState<TeamAnnouncement[]>([]);
  const [reads, setReads] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  async function load() {
    const [{ data: announcements }, { data: readRows }] = await Promise.all([
      supabaseBrowser.from("team_announcements").select("*").order("publish_at", { ascending: false }),
      supabaseBrowser.from("team_announcement_reads").select("announcement_id"),
    ]);
    setItems((announcements ?? []) as TeamAnnouncement[]);
    setReads(new Set((readRows ?? []).map(row => row.announcement_id)));
    setLoading(false);
  }
  useEffect(() => { queueMicrotask(() => void load()); }, []);
  async function markRead(id: string) {
    const user = (await supabaseBrowser.auth.getUser()).data.user;
    if (!user) return;
    await supabaseBrowser.from("team_announcement_reads").upsert({ announcement_id: id, user_id: user.id });
    setReads(current => new Set(current).add(id));
  }
  if (loading) return <p className="text-sm text-slate-500">Loading team updates…</p>;
  return <div>
    <p className="text-xs font-black uppercase tracking-widest text-[#D7193F]">501 Elite OS</p>
    <h1 className="mt-2 text-3xl font-black text-[#071D39]">Team updates</h1>
    <p className="mt-1 text-sm text-slate-500">Announcements from 501 Elite leadership.</p>
    <div className="mt-6 space-y-4">{items.map(item => {
      const unread = !reads.has(item.id);
      return <article key={item.id} onClick={() => void markRead(item.id)} className={`rounded-3xl border bg-white p-5 shadow-sm ${unread ? "border-blue-200 ring-2 ring-blue-100" : "border-slate-200"}`}>
        <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2">{unread ? <BellRing className="h-5 w-5 text-[#D7193F]" /> : <Check className="h-5 w-5 text-emerald-600" />}<span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider ${item.priority === "urgent" ? "bg-red-100 text-red-700" : item.priority === "important" ? "bg-amber-100 text-amber-800" : "bg-blue-50 text-[#123E74]"}`}>{item.priority}</span></div><time className="text-xs text-slate-400">{new Date(item.publish_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</time></div>
        <h2 className="mt-4 text-xl font-black text-[#071D39]">{item.title}</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.body}</p>
        {item.link_url ? <a href={item.link_url} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#123E74] px-5 text-sm font-bold text-white">{item.link_label || "Open link"}<ArrowUpRight className="h-4 w-4" /></a> : null}
      </article>;
    })}{!items.length ? <div className="rounded-3xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">No team announcements yet.</div> : null}</div>
  </div>;
}
