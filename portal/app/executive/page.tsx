import { CalendarDays, Database, Megaphone } from "lucide-react";
import Link from "next/link";
import ExecutiveDashboard from "@/components/executive/ExecutiveDashboard";

export default function ExecutivePage() {
  return (
    <main className="min-h-screen bg-[#F4F7FC] px-4 py-8 text-slate-950 sm:px-6 sm:py-12">
      <div className="mx-auto mb-5 flex max-w-6xl justify-end gap-3">
        <Link href="/executive/announcements" style={{color:"#ffffff"}} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#071D39] px-5 text-sm font-bold text-white shadow-md"><Megaphone className="h-4 w-4"/>Announcements</Link>
        <Link href="/executive/schedule" style={{color:"#ffffff"}} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#D7193F] px-5 text-sm font-bold text-white shadow-md"><CalendarDays className="h-4 w-4"/>Schedule</Link>
        <Link
          href="/executive/records"
          style={{ color: "#ffffff" }}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#123E74] px-5 text-sm font-bold text-white shadow-md"
        >
          <Database className="h-4 w-4" />
          Database records
        </Link>
      </div>
      <ExecutiveDashboard />
    </main>
  );
}
