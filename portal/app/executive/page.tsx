import { CalendarDays, Database, Download, Megaphone, WalletCards } from "lucide-react";
import Link from "next/link";
import ExecutiveDashboard from "@/components/executive/ExecutiveDashboard";
import HandbookChecklist from "@/components/executive/HandbookChecklist";

export default function ExecutivePage() {
  return (
    <main className="min-h-screen bg-[#F4F7FC] px-4 py-8 text-slate-950 sm:px-6 sm:py-12">
      <div className="mx-auto mb-5 grid max-w-6xl grid-cols-2 gap-3 sm:flex sm:justify-end">
        <Link href="/executive/accounting" style={{color:"#ffffff"}} className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-emerald-700 px-4 text-sm font-bold text-white shadow-md sm:px-5"><WalletCards className="h-4 w-4"/>Accounting</Link>
        <Link href="/executive/announcements" style={{color:"#ffffff"}} className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#071D39] px-4 text-sm font-bold text-white shadow-md sm:px-5"><Megaphone className="h-4 w-4"/>Announcements</Link>
        <Link href="/executive/schedule" style={{color:"#ffffff"}} className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#D7193F] px-4 text-sm font-bold text-white shadow-md sm:px-5"><CalendarDays className="h-4 w-4"/>Schedule</Link>
        <Link
          href="/executive/records"
          style={{ color: "#ffffff" }}
          className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#123E74] px-4 text-sm font-bold text-white shadow-md sm:px-5"
        >
          <Database className="h-4 w-4" />
          Records
        </Link>
        <Link href="/executive/exports" style={{color:"#ffffff"}} className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-slate-700 px-4 text-sm font-bold text-white shadow-md sm:col-auto sm:px-5"><Download className="h-4 w-4"/>Exports</Link>
      </div>
      <HandbookChecklist />
      <ExecutiveDashboard />
    </main>
  );
}
