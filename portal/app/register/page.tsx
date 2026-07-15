import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <section className="mx-auto flex max-w-6xl flex-col px-6 py-8 lg:py-16">
        <a
          href="https://www.501elitebaseball.com"
          className="mb-10 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#123E74] transition hover:border-[#123E74]/30 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to 501 Elite Baseball
        </a>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-[#123E74]">
              <Sparkles className="h-4 w-4" />
              Welcome to 501 Elite OS
            </div>

            <h1 className="text-5xl font-black tracking-tight text-slate-900">
              Register your family in minutes.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Create one secure account, register your player, sign required
              releases, and upload the documents needed for the season.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              <Feature
                icon={<Users className="h-6 w-6" />}
                title="Family Profile"
                text="Create one family account for every athlete."
              />
              <Feature
                icon={<ShieldCheck className="h-6 w-6" />}
                title="Secure"
                text="Protected by Supabase authentication."
              />
              <Feature
                icon={<CheckCircle2 className="h-6 w-6" />}
                title="Simple"
                text="One guided experience from start to finish."
              />
            </div>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <a
                href="/register/start"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#123E74] px-8 py-4 text-lg font-semibold shadow-lg transition hover:-translate-y-0.5 hover:bg-[#0E3260]"
                style={{ color: "#ffffff" }}
              >
                Create Family Account
                <ArrowRight className="h-5 w-5" />
              </a>

              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Parent Sign In
              </a>
            </div>
          </div>

          <div className="mt-16 w-full max-w-md lg:mt-0">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
              <p className="mb-6 text-lg font-semibold text-slate-900">
                Registration includes
              </p>
              <TimelineItem text="Create your family account" />
              <TimelineItem text="Parent information" />
              <TimelineItem text="Player information" />
              <TimelineItem text="Medical & emergency contacts" />
              <TimelineItem text="Uniform sizing" />
              <TimelineItem text="League agreements" />
              <TimelineItem text="Birth certificate upload" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 text-[#123E74]">{icon}</div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{text}</p>
    </div>
  );
}

function TimelineItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="h-3 w-3 rounded-full bg-[#123E74]" />
      <span className="text-slate-700">{text}</span>
    </div>
  );
}
