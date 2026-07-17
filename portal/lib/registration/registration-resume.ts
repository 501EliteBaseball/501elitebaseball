"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";

const REGISTRATION_STEPS = [
  "parent",
  "family",
  "player",
  "emergency",
  "medical",
  "uniform",
  "review",
] as const;

export async function getRegistrationResumePath(userId: string) {
  const { data: family, error: familyError } = await supabaseBrowser
    .from("families")
    .select("id")
    .eq("primary_parent_id", userId)
    .maybeSingle();

  if (familyError || !family) return "/registration/parent";

  const { data: registrations, error: registrationError } = await supabaseBrowser
    .from("registrations")
    .select("id, status, current_step, created_at")
    .eq("family_id", family.id)
    .in("status", ["draft", "submitted", "approved"])
    .order("created_at", { ascending: false })
    .limit(10);

  if (registrationError || !registrations?.length) {
    return "/registration/parent";
  }

  const draft = registrations.find((registration) => registration.status === "draft");
  if (draft) {
    const stepIndex = Math.min(
      Math.max(Number(draft.current_step || 1) - 1, 0),
      REGISTRATION_STEPS.length - 1,
    );
    return `/registration/${REGISTRATION_STEPS[stepIndex]}`;
  }

  const submitted = registrations[0];
  const [{ data: releases }, { data: document }] = await Promise.all([
    supabaseBrowser
      .from("registration_release_acceptances")
      .select("agreement_key")
      .eq("registration_id", submitted.id),
    supabaseBrowser
      .from("registration_documents")
      .select("id")
      .eq("registration_id", submitted.id)
      .eq("document_type", "birth_certificate")
      .neq("status", "replaced")
      .limit(1)
      .maybeSingle(),
  ]);

  if (new Set((releases ?? []).map((release) => release.agreement_key)).size < 6) {
    return "/registration/releases";
  }

  if (!document) return "/registration/documents";
  return "/dashboard";
}
