"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";

export type OrganizationMember = {
  user_id: string;
  role: "coach" | "executive" | "admin";
  can_view_medical: boolean;
  can_view_documents: boolean;
  active: boolean;
  created_at: string;
};

export type ExecutiveRelease = {
  id: string;
  agreement_key: string;
  agreement_title: string;
  agreement_version: string;
  response: "accepted" | "declined";
  signature_name: string;
  signed_at: string;
};

export type ExecutiveDocument = {
  id: string;
  storage_path: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  status: string;
  created_at: string;
};

export type ExecutiveRegistration = {
  id: string;
  status: string;
  season: string;
  submittedAt: string | null;
  createdAt: string | null;
  archivedAt: string | null;
  familyName: string;
  parentName: string;
  parentEmail: string;
  playerName: string;
  dateOfBirth: string;
  releaseCount: number;
  birthCertificateStatus: string;
  family: {
    id: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    postal_code: string;
  };
  parent: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  player: {
    id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    preferred_name: string;
    date_of_birth: string;
    gender: string;
    school: string;
    grade: string;
    bats: string;
    throws: string;
    jersey_number_preference: string;
  };
  emergency: {
    name: string;
    relationship: string;
    phone: string;
    alternate_phone: string;
    authorized_pickup: boolean;
  } | null;
  medical: {
    physician_name: string;
    physician_phone: string;
    insurance_provider: string;
    policy_number: string;
    allergies: string;
    medications: string;
    medical_conditions: string;
    special_instructions: string;
  } | null;
  uniform: {
    jersey_size: string;
    pants_size: string;
    hat_size: string;
    jersey_name: string;
    jersey_number_preference: string;
  } | null;
  releases: ExecutiveRelease[];
  documents: ExecutiveDocument[];
};

export async function loadCurrentMembership(): Promise<OrganizationMember> {
  const {
    data: { user },
    error: userError,
  } = await supabaseBrowser.auth.getUser();

  if (userError || !user) {
    throw new Error("Please sign in to continue.");
  }

  const { data, error } = await supabaseBrowser
    .from("organization_members")
    .select("user_id, role, can_view_medical, can_view_documents, active, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  if (!data?.active || !["executive", "admin"].includes(data.role)) {
    throw new Error("Executive access has not been granted to this account.");
  }

  return data as OrganizationMember;
}

export async function loadOrganizationMembers(): Promise<OrganizationMember[]> {
  const { data, error } = await supabaseBrowser
    .from("organization_members")
    .select("user_id, role, can_view_medical, can_view_documents, active, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as OrganizationMember[];
}

export async function loadExecutiveRegistrations(
  scope: "active" | "archived" | "all" = "active",
): Promise<ExecutiveRegistration[]> {
  let registrationQuery = supabaseBrowser
    .from("registrations")
    .select("id, family_id, player_id, status, season, submitted_at, created_at, archived_at");

  if (scope === "active") registrationQuery = registrationQuery.is("archived_at", null);
  if (scope === "archived") registrationQuery = registrationQuery.not("archived_at", "is", null);

  const { data: registrations, error: registrationError } = await registrationQuery
    .order(scope === "archived" ? "archived_at" : "created_at", { ascending: false });

  if (registrationError) throw registrationError;
  if (!registrations?.length) return [];

  const familyIds = Array.from(
    new Set(registrations.map((item) => item.family_id).filter(Boolean)),
  );
  const playerIds = Array.from(
    new Set(registrations.map((item) => item.player_id).filter(Boolean)),
  );

  const emptyResult = Promise.resolve({ data: [] as Record<string, unknown>[], error: null });

  const [
    familyResult,
    playerResult,
    releaseResult,
    documentResult,
    emergencyResult,
    medicalResult,
    uniformResult,
  ] = await Promise.all([
    familyIds.length
      ? supabaseBrowser
          .from("families")
          .select("id, primary_parent_id, family_name, address_line_1, address_line_2, city, state, postal_code")
          .in("id", familyIds)
      : emptyResult,
    playerIds.length
      ? supabaseBrowser
          .from("players")
          .select("id, first_name, middle_name, last_name, preferred_name, date_of_birth, gender, school, grade, bats, throws, jersey_number_preference")
          .in("id", playerIds)
      : emptyResult,
    supabaseBrowser
      .from("registration_release_acceptances")
      .select("id, registration_id, agreement_key, agreement_title, agreement_version, response, signature_name, signed_at"),
    supabaseBrowser
      .from("registration_documents")
      .select("id, registration_id, storage_path, original_filename, content_type, size_bytes, status, created_at")
      .order("created_at", { ascending: false }),
    playerIds.length
      ? supabaseBrowser
          .from("emergency_contacts")
          .select("player_id, name, relationship, phone, alternate_phone, authorized_pickup")
          .in("player_id", playerIds)
      : emptyResult,
    playerIds.length
      ? supabaseBrowser
          .from("medical_profiles")
          .select("player_id, physician_name, physician_phone, insurance_provider, policy_number, allergies, medications, medical_conditions, special_instructions")
          .in("player_id", playerIds)
      : emptyResult,
    supabaseBrowser
      .from("uniform_profiles")
      .select("registration_id, player_id, jersey_size, pants_size, hat_size, jersey_name, jersey_number_preference"),
  ]);

  const results = [
    familyResult,
    playerResult,
    releaseResult,
    documentResult,
    emergencyResult,
    medicalResult,
    uniformResult,
  ];

  const failedResult = results.find((result) => result.error);
  if (failedResult?.error) throw failedResult.error;

  const families = familyResult.data ?? [];
  const players = playerResult.data ?? [];
  const releases = releaseResult.data ?? [];
  const documents = documentResult.data ?? [];
  const emergencies = emergencyResult.data ?? [];
  const medicalProfiles = medicalResult.data ?? [];
  const uniforms = uniformResult.data ?? [];

  const parentIds = Array.from(
    new Set(families.map((item) => item.primary_parent_id).filter(Boolean)),
  );

  const { data: profiles, error: profileError } = parentIds.length
    ? await supabaseBrowser
        .from("profiles")
        .select("id, first_name, last_name, email, phone")
        .in("id", parentIds)
    : { data: [], error: null };

  if (profileError) throw profileError;

  return registrations.map((registration) => {
    const family = families.find((item) => item.id === registration.family_id);
    const player = players.find((item) => item.id === registration.player_id);
    const parent = (profiles ?? []).find(
      (item) => item.id === family?.primary_parent_id,
    );
    const emergency = emergencies.find(
      (item) => item.player_id === registration.player_id,
    );
    const medical = medicalProfiles.find(
      (item) => item.player_id === registration.player_id,
    );
    const uniform = uniforms.find(
      (item) => item.registration_id === registration.id,
    );
    const registrationReleases = releases.filter(
      (item) => item.registration_id === registration.id,
    ) as ExecutiveRelease[];
    const registrationDocuments = documents.filter(
      (item) => item.registration_id === registration.id,
    ) as ExecutiveDocument[];
    const activeDocument = registrationDocuments.find(
      (item) => item.status !== "replaced",
    );

    const parentName =
      [parent?.first_name, parent?.last_name].filter(Boolean).join(" ") ||
      "Not provided";
    const playerName =
      player?.preferred_name ||
      [player?.first_name, player?.last_name].filter(Boolean).join(" ") ||
      "Player not saved";

    return {
      id: registration.id,
      status: registration.status,
      season: registration.season,
      submittedAt: registration.submitted_at,
      createdAt: registration.created_at,
      archivedAt: registration.archived_at,
      familyName: family?.family_name || "Unnamed family",
      parentName,
      parentEmail: parent?.email || "Not provided",
      playerName,
      dateOfBirth: player?.date_of_birth || "Not provided",
      releaseCount: new Set(
        registrationReleases.map((item) => item.agreement_key),
      ).size,
      birthCertificateStatus: activeDocument?.status || "missing",
      family: {
        id: family?.id || "",
        address_line_1: family?.address_line_1 || "",
        address_line_2: family?.address_line_2 || "",
        city: family?.city || "",
        state: family?.state || "",
        postal_code: family?.postal_code || "",
      },
      parent: {
        id: parent?.id || "",
        first_name: parent?.first_name || "",
        last_name: parent?.last_name || "",
        email: parent?.email || "",
        phone: parent?.phone || "",
      },
      player: {
        id: player?.id || "",
        first_name: player?.first_name || "",
        middle_name: player?.middle_name || "",
        last_name: player?.last_name || "",
        preferred_name: player?.preferred_name || "",
        date_of_birth: player?.date_of_birth || "",
        gender: player?.gender || "",
        school: player?.school || "",
        grade: player?.grade || "",
        bats: player?.bats || "",
        throws: player?.throws || "",
        jersey_number_preference: player?.jersey_number_preference || "",
      },
      emergency: emergency
        ? {
            name: emergency.name || "",
            relationship: emergency.relationship || "",
            phone: emergency.phone || "",
            alternate_phone: emergency.alternate_phone || "",
            authorized_pickup: Boolean(emergency.authorized_pickup),
          }
        : null,
      medical: medical
        ? {
            physician_name: medical.physician_name || "",
            physician_phone: medical.physician_phone || "",
            insurance_provider: medical.insurance_provider || "",
            policy_number: medical.policy_number || "",
            allergies: medical.allergies || "",
            medications: medical.medications || "",
            medical_conditions: medical.medical_conditions || "",
            special_instructions: medical.special_instructions || "",
          }
        : null,
      uniform: uniform
        ? {
            jersey_size: uniform.jersey_size || "",
            pants_size: uniform.pants_size || "",
            hat_size: uniform.hat_size || "",
            jersey_name: uniform.jersey_name || "",
            jersey_number_preference:
              uniform.jersey_number_preference || "",
          }
        : null,
      releases: registrationReleases,
      documents: registrationDocuments,
    };
  });
}

export async function openRegistrationDocument(storagePath: string) {
  const { data, error } = await supabaseBrowser.storage
    .from("registration-documents")
    .createSignedUrl(storagePath, 120);

  if (error) throw error;
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

export async function deleteExecutiveRegistration(registrationId: string) {
  const { data: sessionData } = await supabaseBrowser.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Authentication required.");
  const response = await fetch(`/api/executive/registrations/${registrationId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const result = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(result.error ?? "The registration could not be deleted.");
  }
}

export async function grantOrganizationAccess({
  email,
  role,
  canViewMedical,
  canViewDocuments,
}: {
  email: string;
  role: "coach" | "executive" | "admin";
  canViewMedical: boolean;
  canViewDocuments: boolean;
}) {
  const { error } = await supabaseBrowser.rpc("grant_organization_access", {
    target_email: email,
    target_role: role,
    allow_medical: canViewMedical,
    allow_documents: role === "coach" ? false : canViewDocuments,
  });

  if (error) throw error;
}

export async function revokeOrganizationAccess(userId: string) {
  const { error } = await supabaseBrowser.rpc("revoke_organization_access", {
    target_user_id: userId,
  });

  if (error) throw error;
}
