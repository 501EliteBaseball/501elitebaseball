import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPushNotification } from "@/lib/notifications/push";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase-config";

const events = new Set(["started", "completed", "edited"]);

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/, "") ?? "";
  const client = createClient(supabaseUrl, supabasePublishableKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const {
    data: { user },
  } = await client.auth.getUser(token);

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json()) as {
    registrationId?: string;
    event?: string;
    section?: string;
  };

  if (!body.registrationId || !body.event || !events.has(body.event)) {
    return NextResponse.json({ error: "Invalid registration event." }, { status: 400 });
  }

  const { data: ownedRegistration } = await client
    .from("registrations")
    .select("id,family_id,player_id,status")
    .eq("id", body.registrationId)
    .maybeSingle();

  if (!ownedRegistration) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  const admin = createSupabaseAdmin();
  const [{ data: family }, { data: player }] = await Promise.all([
    admin
      .from("families")
      .select("family_name,primary_parent_id")
      .eq("id", ownedRegistration.family_id)
      .single(),
    ownedRegistration.player_id
      ? admin
          .from("players")
          .select("first_name,preferred_name,last_name")
          .eq("id", ownedRegistration.player_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (!family || family.primary_parent_id !== user.id) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  const familyName = family.family_name || "A family";
  const playerName = player
    ? `${player.preferred_name || player.first_name} ${player.last_name}`.trim()
    : familyName;
  const section = body.section?.trim() ? ` (${body.section.trim()})` : "";

  const messages = {
    started: {
      title: "Registration started",
      body: `${familyName} started a registration for ${playerName}.`,
    },
    completed: {
      title: "Registration completed",
      body: `${familyName} completed the registration for ${playerName}.`,
    },
    edited: {
      title: "Registration edited",
      body: `${familyName} updated ${playerName}'s registration${section}.`,
    },
  } as const;

  await sendPushNotification(
    { ...messages[body.event as keyof typeof messages], url: `/executive/registrations/${body.registrationId}` },
    { audience: "executives" },
  );

  return NextResponse.json({ ok: true });
}
