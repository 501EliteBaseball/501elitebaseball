import { supabaseBrowser } from "@/lib/supabase-browser";

type SaveProfileInput = {
  userId: string;
  authEmail: string | null;
  profile: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
};

type SaveFamilyInput = {
  userId: string;
  familyId: string | null;
  family: {
    family_name: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    postal_code: string;
  };
};

export async function saveProfile({
  userId,
  authEmail,
  profile,
}: SaveProfileInput) {
  const { data, error } = await supabaseBrowser
    .from("profiles")
    .upsert(
      {
        id: userId,
        email: authEmail ?? profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
      },
      { onConflict: "id" },
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function saveFamily({
  userId,
  familyId,
  family,
}: SaveFamilyInput): Promise<string> {
  if (familyId) {
    const { error } = await supabaseBrowser
      .from("families")
      .update({
        family_name: family.family_name,
        address_line_1: family.address_line_1,
        address_line_2: family.address_line_2,
        city: family.city,
        state: family.state,
        postal_code: family.postal_code,
      })
      .eq("id", familyId);

    if (error) {
      throw error;
    }

    return familyId;
  }

  const { data, error } = await supabaseBrowser
    .from("families")
    .insert({
      primary_parent_id: userId,
      family_name: family.family_name,
      address_line_1: family.address_line_1,
      address_line_2: family.address_line_2,
      city: family.city,
      state: family.state,
      postal_code: family.postal_code,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

type SavePlayerInput = {
  familyId: string;
  playerId: string | null;
  player: {
    first_name: string;
    middle_name: string;
    last_name: string;
    preferred_name: string;
    date_of_birth: string;
    gender: string;
    school: string;
    grade: string;
    jersey_number_preference: string;
    bats: string;
    throws: string;
  };
};

export async function savePlayer({
  familyId,
  playerId,
  player,
}: SavePlayerInput): Promise<string> {
  if (playerId) {
    const { error } = await supabaseBrowser
      .from("players")
      .update({
        family_id: familyId,
        first_name: player.first_name,
        middle_name: player.middle_name,
        last_name: player.last_name,
        preferred_name: player.preferred_name,
        date_of_birth: player.date_of_birth || null,
        gender: player.gender,
        school: player.school,
        grade: player.grade,
        jersey_number_preference: player.jersey_number_preference,
        bats: player.bats,
        throws: player.throws,
      })
      .eq("id", playerId);

    if (error) {
      throw error;
    }

    return playerId;
  }

  const { data, error } = await supabaseBrowser
    .from("players")
    .insert({
      family_id: familyId,
      first_name: player.first_name,
      middle_name: player.middle_name,
      last_name: player.last_name,
      preferred_name: player.preferred_name,
      date_of_birth: player.date_of_birth || null,
      gender: player.gender,
      school: player.school,
      grade: player.grade,
      jersey_number_preference: player.jersey_number_preference,
      bats: player.bats,
      throws: player.throws,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

type EmergencyFormInput = {
  name: string;
  relationship: string;
  phone: string;
  alternate_phone: string;
  authorized_pickup: boolean;
};

type MedicalFormInput = {
  physician_name: string;
  physician_phone: string;
  insurance_provider: string;
  policy_number: string;
  allergies: string;
  medications: string;
  medical_conditions: string;
  special_instructions: string;
};

type UniformFormInput = {
  jersey_size: string;
  pants_size: string;
  hat_size: string;
  jersey_name: string;
  jersey_number_preference: string;
};

export async function saveEmergencyContact({
  playerId,
  emergency,
}: {
  playerId: string;
  emergency: EmergencyFormInput;
}) {
  const { data: existing, error: lookupError } = await supabaseBrowser
    .from("emergency_contacts")
    .select("id")
    .eq("player_id", playerId)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  const values = {
    name: emergency.name,
    relationship: emergency.relationship,
    phone: emergency.phone,
    alternate_phone: emergency.alternate_phone,
    authorized_pickup: emergency.authorized_pickup,
  };

  if (existing?.id) {
    const { error } = await supabaseBrowser
      .from("emergency_contacts")
      .update(values)
      .eq("id", existing.id);

    if (error) {
      throw error;
    }

    return existing.id;
  }

  const { data, error } = await supabaseBrowser
    .from("emergency_contacts")
    .insert({
      player_id: playerId,
      ...values,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function saveMedicalProfile({
  playerId,
  medical,
}: {
  playerId: string;
  medical: MedicalFormInput;
}) {
  const { data: existing, error: lookupError } = await supabaseBrowser
    .from("medical_profiles")
    .select("id")
    .eq("player_id", playerId)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  const values = {
    physician_name: medical.physician_name,
    physician_phone: medical.physician_phone,
    insurance_provider: medical.insurance_provider,
    policy_number: medical.policy_number,
    allergies: medical.allergies,
    medications: medical.medications,
    medical_conditions: medical.medical_conditions,
    special_instructions: medical.special_instructions,
  };

  if (existing?.id) {
    const { error } = await supabaseBrowser
      .from("medical_profiles")
      .update(values)
      .eq("id", existing.id);

    if (error) {
      throw error;
    }

    return existing.id;
  }

  const { data, error } = await supabaseBrowser
    .from("medical_profiles")
    .insert({
      player_id: playerId,
      ...values,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function saveUniformProfile({
  registrationId,
  playerId,
  uniform,
}: {
  registrationId: string;
  playerId: string;
  uniform: UniformFormInput;
}) {
  const { data: existing, error: lookupError } = await supabaseBrowser
    .from("uniform_profiles")
    .select("id")
    .eq("registration_id", registrationId)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  const values = {
    player_id: playerId,
    jersey_size: uniform.jersey_size,
    pants_size: uniform.pants_size,
    hat_size: uniform.hat_size,
    jersey_name: uniform.jersey_name,
    jersey_number_preference: uniform.jersey_number_preference,
  };

  if (existing?.id) {
    const { error } = await supabaseBrowser
      .from("uniform_profiles")
      .update(values)
      .eq("id", existing.id);

    if (error) {
      throw error;
    }

    return existing.id;
  }

  const { data, error } = await supabaseBrowser
    .from("uniform_profiles")
    .insert({
      registration_id: registrationId,
      ...values,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}
