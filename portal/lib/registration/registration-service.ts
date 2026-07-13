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
