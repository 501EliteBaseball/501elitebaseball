import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fde8ee_0%,#f3f7fc_42%,#e7eef8_100%)] px-5 py-10 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <section className="w-full max-w-xl rounded-[32px] border border-white/70 bg-white/90 p-7 shadow-[0_30px_80px_rgba(18,62,116,0.14)] backdrop-blur sm:p-10">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#123E74] text-sm font-bold text-white">
              501
            </div>

            <span className="font-semibold text-[#123E74]">
              501 Elite OS
            </span>
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#D7193F]">
            Family registration
          </p>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
            Welcome to 501 Elite Baseball
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Join the 501 Elite family through a simple, secure registration
            experience. Your information is saved automatically, so you can
            complete registration at your own pace.
          </p>

          <div className="mt-8 grid gap-3">
            <FeatureItem icon="⏱️" text="About 10 minutes" />
            <FeatureItem icon="💾" text="Save and continue anytime" />
            <FeatureItem icon="🔒" text="Secure family portal" />
          </div>

          <div className="mt-9 grid gap-3">
            <Link
              href="/register"
              className="flex min-h-14 items-center justify-center rounded-2xl bg-[#D7193F] px-6 text-center text-lg font-bold text-white shadow-[0_14px_30px_rgba(215,25,63,0.26)] transition hover:-translate-y-0.5 hover:bg-[#bf1536] focus:outline-none focus:ring-4 focus:ring-red-200"
            >
              Join 501 Elite
            </Link>

            <Link
              href="/login"
              className="flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 text-center text-lg font-bold text-[#123E74] transition hover:border-[#123E74] hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Sign In
            </Link>
          </div>

          <p className="mt-7 text-center text-sm leading-6 text-slate-500">
            Own Your Effort. Own Your Attitude. Own Your Future.
          </p>
        </section>
      </div>
    </main>
  );
}

function FeatureItem({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <div className="flex min-h-14 items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm"
      >
        {icon}
      </span>

      <span className="font-semibold text-slate-700">{text}</span>
    </div>
  );
}