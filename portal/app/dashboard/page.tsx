import { createSupabaseServer } from "@/lib/supabase-server";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const { data: session, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session?.session) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950 sm:px-8">
        <div className="mx-auto max-w-xl rounded-[32px] bg-white p-10 shadow-[0_32px_100px_rgba(18,62,116,0.12)]">
          <h1 className="text-3xl font-semibold">Not signed in</h1>
          <p className="mt-4 text-slate-600">Please sign in to access your dashboard.</p>
          <div className="mt-6">
            <a href="/login" className="font-semibold text-[#D7193F] hover:underline">Go to sign in</a>
          </div>
        </div>
      </main>
    );
  }

  const user = session.session.user;

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 rounded-[32px] bg-white p-10 shadow-[0_32px_100px_rgba(18,62,116,0.12)]">
        <section className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-[#123E74]">501 Elite OS</p>
          <h1 className="text-4xl font-semibold">Welcome back, {user.email ?? user.id}</h1>
          <p className="max-w-2xl text-slate-600">This dashboard is your secure parent hub for schedules, payments, and team updates.</p>
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold">Account info</h2>
            <p className="mt-3 text-sm text-slate-600">Email</p>
            <p className="mt-1 text-base text-slate-950">{user.email ?? "N/A"}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold">Session type</h2>
            <p className="mt-3 text-base text-slate-950">Email / password</p>
            <p className="mt-2 text-sm text-slate-600">If you signed in with email and password, you can manage your account from here.</p>
          </div>
        </section>

        <LogoutButton />
      </div>
    </main>
  );
}
