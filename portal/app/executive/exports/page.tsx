import { AlertTriangle, Download, FileSpreadsheet, HeartPulse, PhoneCall, ReceiptText, Shirt, Users } from "lucide-react";

const exports=[
  ["Complete roster","Players, family names, parent contact details, school and grade.","roster",Users],
  ["Uniform sizes","Jersey, pants and hat sizes with names and number preferences.","uniforms",Shirt],
  ["Allergies & medical","Allergies, medications, conditions, physicians and instructions.","medical",HeartPulse],
  ["Emergency contacts","Emergency contacts, phone numbers and pickup authorization.","emergency",PhoneCall],
  ["Registration status","Season, status, progress and submission dates.","registrations",FileSpreadsheet],
  ["Accounting summary","Account numbers, billed, paid and current balances.","accounting",ReceiptText],
  ["All charges","Every fee and charge with category, due date and status.","charges",AlertTriangle],
  ["All payments","Every recorded payment, method, reference and date.","payments",Download],
] as const;

export default function ExportsPage(){return <main className="min-h-screen bg-[#F4F7FC] px-4 py-8 text-slate-950 sm:px-6 sm:py-12"><div className="mx-auto max-w-5xl"><p className="text-xs font-black uppercase tracking-widest text-[#D7193F]">501 Elite OS</p><h1 className="mt-2 text-3xl font-black text-[#071D39]">Data exports</h1><p className="mt-1 text-sm text-slate-500">Download current organization data for Excel or Apple Numbers.</p><div className="mt-6 grid gap-4 sm:grid-cols-2">{exports.map(([title,description,dataset,Icon])=><section key={dataset} className="flex flex-col rounded-3xl border bg-white p-5 shadow-sm"><Icon className="h-6 w-6 text-[#123E74]"/><h2 className="mt-4 text-lg font-black text-[#071D39]">{title}</h2><p className="mt-1 flex-1 text-sm leading-6 text-slate-600">{description}</p><a href={`/api/exports/${dataset}`} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#123E74] px-5 text-sm font-bold text-white"><Download className="h-4 w-4"/>Download CSV</a></section>)}</div><p className="mt-5 text-xs leading-5 text-slate-500">Exports contain private team information. Store and share them securely. Medical downloads require medical-record access.</p></div></main>}
