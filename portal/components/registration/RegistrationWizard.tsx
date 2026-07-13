"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, ShieldCheck, Sparkles } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  saveFamily,
  savePlayer,
  saveProfile,
} from "@/lib/registration/registration-service";
import FamilyStep, {
  type FamilyForm,
} from "@/components/registration/steps/FamilyStep";
import PlayerStep, {
  type PlayerForm,
} from "@/components/registration/steps/PlayerStep";

type StepKey = "parent" | "family" | "player" | "emergency" | "medical" | "uniform" | "review" | "complete";

type RegistrationWizardProps = {
  step: StepKey;
};

type ProfileForm = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
};

type EmergencyForm = {
  name: string;
  relationship: string;
  phone: string;
  alternate_phone: string;
  authorized_pickup: boolean;
};

type MedicalForm = {
  physician_name: string;
  physician_phone: string;
  insurance_provider: string;
  policy_number: string;
  allergies: string;
  medications: string;
  medical_conditions: string;
  special_instructions: string;
};

type UniformForm = {
  jersey_size: string;
  pants_size: string;
  hat_size: string;
  jersey_name: string;
  jersey_number_preference: string;
};

type RegistrationRecord = {
  id: string;
  family_id: string;
  player_id?: string | null;
  current_step: number;
  completed_steps: number[];
  status: string;
  season: string;
};

const stepConfig = {
  parent: { title: "Parent information", description: "Tell us who is registering the family.", number: 1, route: "/registration/parent" },
  family: { title: "Family details", description: "Share the home base for your family registration.", number: 2, route: "/registration/family" },
  player: { title: "Player profile", description: "Add the athlete(s) joining 501 Elite OS.", number: 3, route: "/registration/player" },
  emergency: { title: "Emergency contacts", description: "Make sure every player has trusted backup support.", number: 4, route: "/registration/emergency" },
  medical: { title: "Medical details", description: "Keep the care plan clear and ready.", number: 5, route: "/registration/medical" },
  uniform: { title: "Uniform sizing", description: "Choose the right gear for the season.", number: 6, route: "/registration/uniform" },
  review: { title: "Review & submit", description: "Confirm everything before submitting.", number: 7, route: "/registration/review" },
  complete: { title: "Registration complete", description: "Your registration is ready for the team.", number: 8, route: "/registration/complete" },
} as const;

const stepOrder: StepKey[] = ["parent", "family", "player", "emergency", "medical", "uniform", "review", "complete"];

const baseProfile = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
};

const baseFamily = {
  family_name: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
};

const basePlayer = {
  first_name: "",
  middle_name: "",
  last_name: "",
  preferred_name: "",
  date_of_birth: "",
  gender: "",
  school: "",
  grade: "",
  jersey_number_preference: "",
  bats: "",
  throws: "",
};

const baseEmergency = {
  name: "",
  relationship: "",
  phone: "",
  alternate_phone: "",
  authorized_pickup: false,
};

const baseMedical = {
  physician_name: "",
  physician_phone: "",
  insurance_provider: "",
  policy_number: "",
  allergies: "",
  medications: "",
  medical_conditions: "",
  special_instructions: "",
};

const baseUniform = {
  jersey_size: "",
  pants_size: "",
  hat_size: "",
  jersey_name: "",
  jersey_number_preference: "",
};

export default function RegistrationWizard({ step }: RegistrationWizardProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autosaveText, setAutosaveText] = useState("Preparing your draft registration…");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [profile, setProfile] = useState<ProfileForm>(baseProfile);
  const [family, setFamily] = useState<FamilyForm>(baseFamily);
  const [player, setPlayer] = useState<PlayerForm>(basePlayer);
  const [emergency, setEmergency] = useState<EmergencyForm>(baseEmergency);
  const [medical, setMedical] = useState<MedicalForm>(baseMedical);
  const [uniform, setUniform] = useState<UniformForm>(baseUniform);
  const [registration, setRegistration] = useState<RegistrationRecord | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    void initializeRegistration();
  }, [step]);

  async function initializeRegistration() {
    try {
      setLoading(true);
      setError(null);
      setFormErrors({});

      const {
      data: { user },
        error: userError,
      } = await supabaseBrowser.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      let { data: profileData } = await supabaseBrowser.from("profiles").select("*").eq("id", user.id).maybeSingle();

      if (!profileData) {
        const { data: insertedProfile, error: profileInsertError } = await supabaseBrowser
          .from("profiles")
          .insert({ id: user.id, email: user.email ?? null })
          .select("*")
          .single();

        if (profileInsertError) {
          throw profileInsertError;
        }
        profileData = insertedProfile;
      }

      setProfile({
        first_name: profileData?.first_name ?? "",
        last_name: profileData?.last_name ?? "",
        phone: profileData?.phone ?? "",
        email: profileData?.email ?? user.email ?? "",
      });

      let { data: familyData } = await supabaseBrowser.from("families").select("*").eq("primary_parent_id", user.id).maybeSingle();

      if (!familyData) {
        const { data: insertedFamily, error: familyInsertError } = await supabaseBrowser
          .from("families")
          .insert({
            primary_parent_id: user.id,
            family_name: `${profileData?.first_name ?? "Family"} ${profileData?.last_name ?? "Household"}`.trim() || "Family Household",
          })
          .select("*")
          .single();

        if (familyInsertError) {
          throw familyInsertError;
        }
        familyData = insertedFamily;
      }

      setFamilyId(familyData?.id ?? null);
      setFamily({
        family_name: familyData?.family_name ?? "",
        address_line_1: familyData?.address_line_1 ?? "",
        address_line_2: familyData?.address_line_2 ?? "",
        city: familyData?.city ?? "",
        state: familyData?.state ?? "",
        postal_code: familyData?.postal_code ?? "",
      });

      let { data: draftRegistration } = await supabaseBrowser
        .from("registrations")
        .select("*")
        .eq("family_id", familyData?.id)
        .eq("status", "draft")
        .maybeSingle();

      if (!draftRegistration) {
        const { data: insertedRegistration, error: registrationInsertError } = await supabaseBrowser
          .from("registrations")
          .insert({
            family_id: familyData?.id,
            season: "2026",
            current_step: stepConfig[step].number,
            completed_steps: [],
          })
          .select("*")
          .single();

        if (registrationInsertError) {
          throw registrationInsertError;
        }
        draftRegistration = insertedRegistration;
      }

      setRegistration(draftRegistration as RegistrationRecord | null);

      if (draftRegistration?.player_id) {
        setPlayerId(draftRegistration.player_id);

        const { data: playerData } = await supabaseBrowser.from("players").select("*").eq("id", draftRegistration.player_id).maybeSingle();
        if (playerData) {
          setPlayer({
            first_name: playerData.first_name ?? "",
            middle_name: playerData.middle_name ?? "",
            last_name: playerData.last_name ?? "",
            preferred_name: playerData.preferred_name ?? "",
            date_of_birth: playerData.date_of_birth ?? "",
            gender: playerData.gender ?? "",
            school: playerData.school ?? "",
            grade: playerData.grade ?? "",
            jersey_number_preference: playerData.jersey_number_preference ?? "",
            bats: playerData.bats ?? "",
            throws: playerData.throws ?? "",
          });
        }

        const { data: emergencyData } = await supabaseBrowser.from("emergency_contacts").select("*").eq("player_id", draftRegistration.player_id).maybeSingle();
        if (emergencyData) {
          setEmergency({
            name: emergencyData.name ?? "",
            relationship: emergencyData.relationship ?? "",
            phone: emergencyData.phone ?? "",
            alternate_phone: emergencyData.alternate_phone ?? "",
            authorized_pickup: Boolean(emergencyData.authorized_pickup),
          });
        }

        const { data: medicalData } = await supabaseBrowser.from("medical_profiles").select("*").eq("player_id", draftRegistration.player_id).maybeSingle();
        if (medicalData) {
          setMedical({
            physician_name: medicalData.physician_name ?? "",
            physician_phone: medicalData.physician_phone ?? "",
            insurance_provider: medicalData.insurance_provider ?? "",
            policy_number: medicalData.policy_number ?? "",
            allergies: medicalData.allergies ?? "",
            medications: medicalData.medications ?? "",
            medical_conditions: medicalData.medical_conditions ?? "",
            special_instructions: medicalData.special_instructions ?? "",
          });
        }

        const { data: uniformData } = await supabaseBrowser.from("uniform_profiles").select("*").eq("registration_id", draftRegistration.id).maybeSingle();
        if (uniformData) {
          setUniform({
            jersey_size: uniformData.jersey_size ?? "",
            pants_size: uniformData.pants_size ?? "",
            hat_size: uniformData.hat_size ?? "",
            jersey_name: uniformData.jersey_name ?? "",
            jersey_number_preference: uniformData.jersey_number_preference ?? "",
          });
        }
      }

      setAutosaveText("Draft ready. Continue when you are prepared.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while loading your registration.");
    } finally {
      setLoading(false);
    }
  }

  function validateStep(nextStep: StepKey) {
    const errors: Record<string, string> = {};

    if (nextStep === "parent") {
      if (!profile.first_name.trim()) errors.first_name = "Please enter the parent first name.";
      if (!profile.last_name.trim()) errors.last_name = "Please enter the parent last name.";
      if (!profile.phone.trim()) errors.phone = "Please enter a phone number.";
    }

    if (nextStep === "family") {
      if (!family.family_name.trim()) errors.family_name = "Please enter the family name.";
      if (!family.address_line_1.trim()) errors.address_line_1 = "Please enter the street address.";
      if (!family.city.trim()) errors.city = "Please enter your city.";
      if (!family.state.trim()) errors.state = "Please enter your state.";
      if (!family.postal_code.trim()) errors.postal_code = "Please enter the postal code.";
    }

    if (nextStep === "player") {
      if (!player.first_name.trim()) errors.first_name = "Please enter the player first name.";
      if (!player.last_name.trim()) errors.last_name = "Please enter the player last name.";
      if (!player.date_of_birth) errors.date_of_birth = "Please enter the date of birth.";
      if (!player.gender.trim()) errors.gender = "Please select the player gender.";
    }

    if (nextStep === "emergency") {
      if (!emergency.name.trim()) errors.name = "Please enter the emergency contact name.";
      if (!emergency.relationship.trim()) errors.relationship = "Please enter the relationship.";
      if (!emergency.phone.trim()) errors.phone = "Please enter a phone number.";
    }

    if (nextStep === "medical") {
      if (!medical.physician_name.trim()) errors.physician_name = "Please enter the physician name.";
      if (!medical.physician_phone.trim()) errors.physician_phone = "Please enter the physician phone number.";
    }

    if (nextStep === "uniform") {
      if (!uniform.jersey_size.trim()) errors.jersey_size = "Please select a jersey size.";
      if (!uniform.pants_size.trim()) errors.pants_size = "Please select a pants size.";
      if (!uniform.hat_size.trim()) errors.hat_size = "Please select a hat size.";
    }

    setFormErrors(errors);
    return errors;
  }

  async function saveStep(destinationStep?: StepKey | null, shouldSubmit = false) {
    if (saving) return;

    const errors = validateStep(step);
    if (Object.keys(errors).length > 0) {
      setError("Please correct the highlighted fields before continuing.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setAutosaveText("Saving your registration details…");

      const {
        data: { user },
        error: userError,
      } = await supabaseBrowser.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      await saveProfile({
        userId: user.id,
        authEmail: user.email ?? null,
        profile,
      });

      const currentFamilyId = await saveFamily({
        userId: user.id,
        familyId,
        family,
      });

      if (currentFamilyId !== familyId) {
        setFamilyId(currentFamilyId);
      }

      let currentRegistration = registration;

      if (!currentRegistration) {
        const { data: registrationData, error: registrationError } = await supabaseBrowser
          .from("registrations")
          .insert({ family_id: currentFamilyId, season: "2026", current_step: stepConfig[step].number, completed_steps: [] })
          .select("*")
          .single();

        if (registrationError) throw registrationError;
        currentRegistration = registrationData as RegistrationRecord;
        setRegistration(currentRegistration);
      }

      let currentPlayerId = playerId ?? currentRegistration?.player_id ?? null;

      if (
        step === "player" ||
        step === "emergency" ||
        step === "medical" ||
        step === "uniform" ||
        step === "review"
      ) {
        currentPlayerId = await savePlayer({
          familyId: currentFamilyId,
          playerId: currentPlayerId,
          player,
        });

        if (currentPlayerId !== playerId) {
          setPlayerId(currentPlayerId);
        }

        if (currentRegistration.player_id !== currentPlayerId) {
          const { error: registrationPlayerError } = await supabaseBrowser
            .from("registrations")
            .update({ player_id: currentPlayerId })
            .eq("id", currentRegistration.id);

          if (registrationPlayerError) {
            throw registrationPlayerError;
          }

          currentRegistration = {
            ...currentRegistration,
            player_id: currentPlayerId,
          };

          setRegistration(currentRegistration);
        }
      }

      if (step === "emergency" || step === "review" || step === "medical" || step === "uniform") {
        const { data: existingEmergency } = await supabaseBrowser.from("emergency_contacts").select("id").eq("player_id", currentPlayerId).maybeSingle();

        if (existingEmergency?.id) {
          await supabaseBrowser.from("emergency_contacts").update({
            name: emergency.name,
            relationship: emergency.relationship,
            phone: emergency.phone,
            alternate_phone: emergency.alternate_phone,
            authorized_pickup: emergency.authorized_pickup,
          }).eq("id", existingEmergency.id);
        } else {
          await supabaseBrowser.from("emergency_contacts").insert({
            player_id: currentPlayerId,
            name: emergency.name,
            relationship: emergency.relationship,
            phone: emergency.phone,
            alternate_phone: emergency.alternate_phone,
            authorized_pickup: emergency.authorized_pickup,
          });
        }
      }

      if (step === "medical" || step === "review" || step === "uniform") {
        const { data: existingMedical } = await supabaseBrowser.from("medical_profiles").select("id").eq("player_id", currentPlayerId).maybeSingle();

        if (existingMedical?.id) {
          await supabaseBrowser.from("medical_profiles").update({
            physician_name: medical.physician_name,
            physician_phone: medical.physician_phone,
            insurance_provider: medical.insurance_provider,
            policy_number: medical.policy_number,
            allergies: medical.allergies,
            medications: medical.medications,
            medical_conditions: medical.medical_conditions,
            special_instructions: medical.special_instructions,
          }).eq("id", existingMedical.id);
        } else {
          await supabaseBrowser.from("medical_profiles").insert({
            player_id: currentPlayerId,
            physician_name: medical.physician_name,
            physician_phone: medical.physician_phone,
            insurance_provider: medical.insurance_provider,
            policy_number: medical.policy_number,
            allergies: medical.allergies,
            medications: medical.medications,
            medical_conditions: medical.medical_conditions,
            special_instructions: medical.special_instructions,
          });
        }
      }

      if (step === "uniform" || step === "review") {
        const { data: existingUniform } = await supabaseBrowser.from("uniform_profiles").select("id").eq("registration_id", currentRegistration.id).maybeSingle();

        if (existingUniform?.id) {
          await supabaseBrowser.from("uniform_profiles").update({
            jersey_size: uniform.jersey_size,
            pants_size: uniform.pants_size,
            hat_size: uniform.hat_size,
            jersey_name: uniform.jersey_name,
            jersey_number_preference: uniform.jersey_number_preference,
          }).eq("id", existingUniform.id);
        } else {
          await supabaseBrowser.from("uniform_profiles").insert({
            registration_id: currentRegistration.id,
            jersey_size: uniform.jersey_size,
            pants_size: uniform.pants_size,
            hat_size: uniform.hat_size,
            jersey_name: uniform.jersey_name,
            jersey_number_preference: uniform.jersey_number_preference,
          });
        }
      }

      const currentStepNumber = stepConfig[step].number;
      const completedSteps = Array.isArray(currentRegistration?.completed_steps) ? [...currentRegistration.completed_steps] : [];
      if (!completedSteps.includes(currentStepNumber)) completedSteps.push(currentStepNumber);

      if (shouldSubmit) {
        await supabaseBrowser.from("registrations").update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
          current_step: stepConfig.review.number,
          completed_steps: completedSteps,
        }).eq("id", currentRegistration.id);
        setAutosaveText("Registration submitted. Redirecting…");
        router.replace("/registration/complete");
        return;
      }

      const nextStep = destinationStep ?? getNextStep(step);
      await supabaseBrowser.from("registrations").update({
        current_step: stepConfig[nextStep].number,
        completed_steps: completedSteps,
      }).eq("id", currentRegistration.id);

      setAutosaveText("Draft saved and ready to continue.");
      router.push(`/registration/${nextStep}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not save this section right now.");
    } finally {
      setSaving(false);
    }
  }

  function getNextStep(currentStep: StepKey): StepKey {
    const currentIndex = stepOrder.indexOf(currentStep);
    return stepOrder[Math.min(currentIndex + 1, stepOrder.length - 2)];
  }

  function getPreviousStep(currentStep: StepKey): StepKey {
    const currentIndex = stepOrder.indexOf(currentStep);
    return stepOrder[Math.max(currentIndex - 1, 0)];
  }

  function renderFormFields() {
    if (step === "parent") {
      const inputClassName =
        "min-h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#123E74] focus:ring-4 focus:ring-[#123E74]/10";

      const errorInputClassName =
        "border-[#D7193F] focus:border-[#D7193F] focus:ring-[#D7193F]/10";

      const errorTextClassName =
        "flex items-center gap-1.5 text-sm font-medium text-[#B31334]";

      return (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#123E74]">
                Primary parent or guardian
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Enter the contact information for the adult completing this registration.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="parent-first-name"
                  className="block text-sm font-semibold text-slate-800"
                >
                  First name
                </label>
                <input
                  id="parent-first-name"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  enterKeyHint="next"
                  value={profile.first_name}
                  onChange={(event) =>
                    setProfile({
                      ...profile,
                      first_name: event.target.value,
                    })
                  }
                  aria-invalid={Boolean(formErrors.first_name)}
                  aria-describedby={
                    formErrors.first_name
                      ? "parent-first-name-error"
                      : undefined
                  }
                  className={`${inputClassName} ${
                    formErrors.first_name ? errorInputClassName : ""
                  }`}
                />
                {formErrors.first_name ? (
                  <p
                    id="parent-first-name-error"
                    role="alert"
                    className={errorTextClassName}
                  >
                    <span aria-hidden="true">●</span>
                    {formErrors.first_name}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="parent-last-name"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Last name
                </label>
                <input
                  id="parent-last-name"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  enterKeyHint="next"
                  value={profile.last_name}
                  onChange={(event) =>
                    setProfile({
                      ...profile,
                      last_name: event.target.value,
                    })
                  }
                  aria-invalid={Boolean(formErrors.last_name)}
                  aria-describedby={
                    formErrors.last_name
                      ? "parent-last-name-error"
                      : undefined
                  }
                  className={`${inputClassName} ${
                    formErrors.last_name ? errorInputClassName : ""
                  }`}
                />
                {formErrors.last_name ? (
                  <p
                    id="parent-last-name-error"
                    role="alert"
                    className={errorTextClassName}
                  >
                    <span aria-hidden="true">●</span>
                    {formErrors.last_name}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <label
                htmlFor="parent-phone"
                className="block text-sm font-semibold text-slate-800"
              >
                Mobile phone
              </label>
              <input
                id="parent-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="done"
                placeholder="(501) 555-0123"
                value={profile.phone}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    phone: event.target.value,
                  })
                }
                aria-invalid={Boolean(formErrors.phone)}
                aria-describedby={
                  formErrors.phone
                    ? "parent-phone-error"
                    : "parent-phone-hint"
                }
                className={`${inputClassName} ${
                  formErrors.phone ? errorInputClassName : ""
                }`}
              />
              {formErrors.phone ? (
                <p
                  id="parent-phone-error"
                  role="alert"
                  className={errorTextClassName}
                >
                  <span aria-hidden="true">●</span>
                  {formErrors.phone}
                </p>
              ) : (
                <p id="parent-phone-hint" className="text-sm text-slate-500">
                  We’ll use this number for important team and registration updates.
                </p>
              )}
            </div>

            <div className="mt-5 space-y-2">
              <label
                htmlFor="parent-email"
                className="block text-sm font-semibold text-slate-800"
              >
                Email address
              </label>
              <input
                id="parent-email"
                name="email"
                type="email"
                autoComplete="email"
                value={profile.email}
                readOnly
                aria-describedby="parent-email-hint"
                className="min-h-14 w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-base text-slate-600 shadow-inner outline-none"
              />
              <p id="parent-email-hint" className="text-sm leading-5 text-slate-500">
                This is the email connected to your secure 501 Elite account.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-2xl border border-[#123E74]/15 bg-[#123E74]/5 p-4">
            <div
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#123E74] shadow-sm"
            >
              i
            </div>
            <p className="text-sm leading-6 text-slate-700">
              You’ll be able to add another parent, guardian, or authorized contact
              later in the registration.
            </p>
          </div>
        </div>
      );
    }

    if (step === "family") {
      return (
        <FamilyStep
          family={family}
          setFamily={setFamily}
          formErrors={formErrors}
        />
      );
    }

    if (step === "player") {
      return (
        <PlayerStep
          player={player}
          setPlayer={setPlayer}
          formErrors={formErrors}
        />
      );
    }

    if (step === "emergency") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Name</label>
            <input value={emergency.name} onChange={(event) => setEmergency({ ...emergency, name: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            {formErrors.name ? <p className="text-sm text-[#D7193F]">{formErrors.name}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Relationship</label>
            <input value={emergency.relationship} onChange={(event) => setEmergency({ ...emergency, relationship: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            {formErrors.relationship ? <p className="text-sm text-[#D7193F]">{formErrors.relationship}</p> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Phone</label>
              <input value={emergency.phone} onChange={(event) => setEmergency({ ...emergency, phone: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
              {formErrors.phone ? <p className="text-sm text-[#D7193F]">{formErrors.phone}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Alternate phone</label>
              <input value={emergency.alternate_phone} onChange={(event) => setEmergency({ ...emergency, alternate_phone: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" checked={emergency.authorized_pickup} onChange={() => setEmergency({ ...emergency, authorized_pickup: !emergency.authorized_pickup })} className="h-4 w-4 rounded border-slate-300 text-[#123E74]" />
            Authorized pickup
          </label>
        </div>
      );
    }

    if (step === "medical") {
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Physician name</label>
              <input value={medical.physician_name} onChange={(event) => setMedical({ ...medical, physician_name: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
              {formErrors.physician_name ? <p className="text-sm text-[#D7193F]">{formErrors.physician_name}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Physician phone</label>
              <input value={medical.physician_phone} onChange={(event) => setMedical({ ...medical, physician_phone: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
              {formErrors.physician_phone ? <p className="text-sm text-[#D7193F]">{formErrors.physician_phone}</p> : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Insurance provider</label>
              <input value={medical.insurance_provider} onChange={(event) => setMedical({ ...medical, insurance_provider: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Policy number</label>
              <input value={medical.policy_number} onChange={(event) => setMedical({ ...medical, policy_number: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Allergies</label>
            <textarea value={medical.allergies} onChange={(event) => setMedical({ ...medical, allergies: event.target.value })} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Medications</label>
            <textarea value={medical.medications} onChange={(event) => setMedical({ ...medical, medications: event.target.value })} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Medical conditions</label>
            <textarea value={medical.medical_conditions} onChange={(event) => setMedical({ ...medical, medical_conditions: event.target.value })} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Special instructions</label>
            <textarea value={medical.special_instructions} onChange={(event) => setMedical({ ...medical, special_instructions: event.target.value })} className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
          </div>
        </div>
      );
    }

    if (step === "uniform") {
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Jersey size</label>
              <input value={uniform.jersey_size} onChange={(event) => setUniform({ ...uniform, jersey_size: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
              {formErrors.jersey_size ? <p className="text-sm text-[#D7193F]">{formErrors.jersey_size}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Pants size</label>
              <input value={uniform.pants_size} onChange={(event) => setUniform({ ...uniform, pants_size: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
              {formErrors.pants_size ? <p className="text-sm text-[#D7193F]">{formErrors.pants_size}</p> : null}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Hat size</label>
            <input value={uniform.hat_size} onChange={(event) => setUniform({ ...uniform, hat_size: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            {formErrors.hat_size ? <p className="text-sm text-[#D7193F]">{formErrors.hat_size}</p> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Jersey name</label>
              <input value={uniform.jersey_name} onChange={(event) => setUniform({ ...uniform, jersey_name: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Jersey number preference</label>
              <input value={uniform.jersey_number_preference} onChange={(event) => setUniform({ ...uniform, jersey_number_preference: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </div>
          </div>
        </div>
      );
    }

    if (step === "review") {
      return (
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Parent</h2>
              <Link href="/registration/parent" className="text-sm font-semibold text-[#123E74]">Edit</Link>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>{profile.first_name} {profile.last_name}</p>
              <p>{profile.phone}</p>
              <p>{profile.email}</p>
            </div>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Family</h2>
              <Link href="/registration/family" className="text-sm font-semibold text-[#123E74]">Edit</Link>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>{family.family_name}</p>
              <p>{family.address_line_1}</p>
              <p>{family.city}, {family.state} {family.postal_code}</p>
            </div>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Player</h2>
              <Link href="/registration/player" className="text-sm font-semibold text-[#123E74]">Edit</Link>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>{player.first_name} {player.last_name}</p>
              <p>{player.school} · {player.grade}</p>
            </div>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Emergency</h2>
              <Link href="/registration/emergency" className="text-sm font-semibold text-[#123E74]">Edit</Link>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>{emergency.name}</p>
              <p>{emergency.relationship}</p>
              <p>{emergency.phone}</p>
            </div>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Medical</h2>
              <Link href="/registration/medical" className="text-sm font-semibold text-[#123E74]">Edit</Link>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>{medical.physician_name}</p>
              <p>{medical.insurance_provider}</p>
            </div>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Uniform</h2>
              <Link href="/registration/uniform" className="text-sm font-semibold text-[#123E74]">Edit</Link>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <p>{uniform.jersey_size} · {uniform.pants_size} · {uniform.hat_size}</p>
            </div>
          </section>
        </div>
      );
    }

    if (step === "complete") {
      return (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Your registration was submitted.</h2>
          </div>
          <p className="mt-3 text-sm leading-6">A draft record has been moved to submitted status and is ready for the 501 Elite OS team to review.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-full bg-[#123E74] px-5 py-3 text-sm font-semibold text-white">Return to dashboard</Link>
            <Link href="/registration/parent" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">Start a new draft</Link>
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,_#f3f7ff,_#eef4ff)] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_30px_120px_rgba(18,62,116,0.12)] sm:p-6 lg:flex-row lg:p-8">
        <aside className="w-full rounded-[24px] bg-[#123E74] p-5 text-white lg:max-w-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-blue-100">501 Elite OS</p>
              <h1 className="text-xl font-semibold">Family registration</h1>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/15 bg-white/10 p-4">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className="font-semibold">{stepConfig[step].number}/8</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/20">
              <div className="h-2 rounded-full bg-[#D7193F]" style={{ width: `${Math.min((stepConfig[step].number / 8) * 100, 100)}%` }} />
            </div>
            <p className="mt-4 text-sm leading-6 text-blue-50">{stepConfig[step].description}</p>
          </div>

          <div className="mt-6 space-y-2 text-sm">
            {stepOrder.map((item) => {
              const config = stepConfig[item];
              const active = item === step;
              const done = stepConfig[step].number > config.number;
              return (
                <div key={item} className={`flex items-center justify-between rounded-2xl px-3 py-2 ${active ? "bg-white/15" : "bg-transparent"}`}>
                  <span className="flex items-center gap-2">
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                    {config.title}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="flex-1">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#123E74]">Step {stepConfig[step].number}</p>
                <h2 className="text-2xl font-semibold text-slate-950">{stepConfig[step].title}</h2>
              </div>
              <div className="rounded-full bg-[#123E74]/10 px-3 py-2 text-sm font-semibold text-[#123E74]">{autosaveText}</div>
            </div>

            {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            {loading ? (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading your registration draft…</div>
            ) : (
              <div className="mt-6 space-y-6">
                {renderFormFields()}

                {step !== "complete" ? (
                  <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-between">
                    <button type="button" onClick={() => void saveStep(getPreviousStep(step), false)} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#123E74] hover:text-[#123E74] disabled:cursor-not-allowed disabled:opacity-60">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    {step === "review" ? (
                      <button type="button" onClick={() => void saveStep(null, true)} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D7193F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b61435] disabled:cursor-not-allowed disabled:opacity-60">
                        Submit registration
                        <ShieldCheck className="h-4 w-4" />
                      </button>
                    ) : (
                      <button type="button" onClick={() => void saveStep(getNextStep(step), false)} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#123E74] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f335f] disabled:cursor-not-allowed disabled:opacity-60">
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
