import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase-config";

async function authenticatedClient(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/, "") ?? "";
  const client = createClient(supabaseUrl, supabasePublishableKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: { user } } = await client.auth.getUser(token);
  return user ? { client, user } : null;
}

export async function POST(request: Request) {
  const auth = await authenticatedClient(request);
  if (!auth) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const subscription = await request.json() as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys.auth) {
    return NextResponse.json({ error: "Invalid push subscription." }, { status: 400 });
  }

  const { error } = await auth.client.from("push_subscriptions").upsert({
    user_id: auth.user.id,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    user_agent: request.headers.get("user-agent") ?? "",
    active: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: "endpoint" });

  return error
    ? NextResponse.json({ error: error.message }, { status: 500 })
    : NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await authenticatedClient(request);
  if (!auth) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { endpoint } = await request.json() as { endpoint?: string };
  if (!endpoint) return NextResponse.json({ error: "Endpoint required." }, { status: 400 });
  const { error } = await auth.client
    .from("push_subscriptions")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("endpoint", endpoint)
    .eq("user_id", auth.user.id);
  return error
    ? NextResponse.json({ error: error.message }, { status: 500 })
    : NextResponse.json({ ok: true });
}
