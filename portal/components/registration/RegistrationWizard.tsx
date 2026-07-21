"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, ShieldCheck } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { notifyExecutivesOfRegistration } from "@/lib/registration/registration-notifications";
import BrandHeader from "@/components/registration/experience/BrandHeader";
import SectionCompletePrompt from "@/components/registration/requirements/SectionCompletePrompt";
import RegistrationProgress from "@/components/registration/experience/RegistrationProgress";
import {
  saveEmergencyContact,
  saveFamily,
  saveMedicalProfile,
  savePlayer,
  saveProfile,
  saveUniformProfile,
} from "@/lib/registration/registration-service";
import FamilyStep, {
  type FamilyForm,
} from "@/components/registration/steps/FamilyStep";
import PlayerStep, {
  type PlayerForm,
} from "@/components/registration/steps/PlayerStep";
import EmergencyStep, {
  type EmergencyForm,
} from "@/components/registration/steps/EmergencyStep";
import MedicalStep, {
  type MedicalForm,
} from "@/components/registration/steps/MedicalStep";
import UniformStep, {
  type UniformForm,
} from "@/components/registration/steps/UniformStep";
import ReviewStep from "@/components/registration/steps/ReviewStep";

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

const totalRegistrationSteps = stepOrder.length - 1;

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

  const [loading, setLoading] = useState(step !== "complete");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autosaveText, setAutosaveText] = useState(
    step === "complete"
      ? "Registration submitted."
      : "Preparing your draft registration…",
  );
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
  const [parentQuestion, setParentQuestion] = useState(0);
  const [familyQuestion, setFamilyQuestion] = useState(0);
  const [playerQuestion, setPlayerQuestion] = useState(0);
  const [emergencyQuestion, setEmergencyQuestion] = useState(0);
  const [medicalQuestion, setMedicalQuestion] = useState(0);
  const [uniformQuestion, setUniformQuestion] = useState(0);
  const autosaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (step !== "complete") {
      void initializeRegistration();
    }
    // Initialization is intentionally keyed to route-step changes. Including the
    // function itself would recreate the draft on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function initializeRegistration() {
    try {
      setLoading(true);
      setError(null);
      setFormErrors({});

      const {
        data: { session },
        error: sessionError,
      } = await supabaseBrowser.auth.getSession();

      if (sessionError || !session?.user) {
        router.replace("/login");
        return;
      }

      const user = session.user;

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
        await notifyExecutivesOfRegistration({
          registrationId: insertedRegistration.id,
          event: "started",
        });
      }

      setRegistration(draftRegistration as RegistrationRecord | null);

      const draftStep = Number(draftRegistration?.current_step ?? 1);
      const currentStep = stepConfig[step].number;

      if (
        draftRegistration &&
        draftStep > currentStep &&
        draftStep <= stepOrder.length
      ) {
        router.replace(stepConfig[stepOrder[draftStep - 1]].route);
        return;
      }

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
  useEffect(() => {
    if (loading || saving || step !== "parent") {
      return;
    }

    if (autosaveTimeout.current) {
      clearTimeout(autosaveTimeout.current);
    }

    autosaveTimeout.current = setTimeout(async () => {
      try {
        setAutosaveText("Saving parent information…");

        const {
          data: { user },
          error: userError,
        } = await supabaseBrowser.auth.getUser();

        if (userError || !user) {
          return;
        }

        await saveProfile({
          userId: user.id,
          authEmail: user.email ?? null,
          profile,
        });

        setAutosaveText("Parent information saved.");
      } catch (autosaveError) {
        setError(
          autosaveError instanceof Error
            ? autosaveError.message
            : "Parent information could not be autosaved.",
        );
        setAutosaveText("Autosave paused.");
      }
    }, 1000);

    return () => {
      if (autosaveTimeout.current) {
        clearTimeout(autosaveTimeout.current);
      }
    };
  }, [loading, profile, saving, step]);

  useEffect(() => {
    if (loading || saving || step !== "family" || !familyId) {
      return;
    }

    if (autosaveTimeout.current) {
      clearTimeout(autosaveTimeout.current);
    }

    autosaveTimeout.current = setTimeout(async () => {
      try {
        setAutosaveText("Saving family information…");

        const {
          data: { user },
          error: userError,
        } = await supabaseBrowser.auth.getUser();

        if (userError || !user) {
          return;
        }

        await saveFamily({
          userId: user.id,
          familyId,
          family,
        });

        setAutosaveText("Family information saved.");
      } catch (autosaveError) {
        setError(
          autosaveError instanceof Error
            ? autosaveError.message
            : "Family information could not be autosaved.",
        );
        setAutosaveText("Autosave paused.");
      }
    }, 1000);

    return () => {
      if (autosaveTimeout.current) {
        clearTimeout(autosaveTimeout.current);
      }
    };
  }, [family, familyId, loading, saving, step]);

  useEffect(() => {
    const registrationId = registration?.id ?? null;
    const registrationPlayerId = registration?.player_id ?? null;

    if (
      loading ||
      saving ||
      step !== "player" ||
      !familyId ||
      !registrationId
    ) {
      return;
    }

    if (autosaveTimeout.current) {
      clearTimeout(autosaveTimeout.current);
    }

    autosaveTimeout.current = setTimeout(async () => {
      try {
        setAutosaveText("Saving player profile…");

        const savedPlayerId = await savePlayer({
          familyId,
          playerId: playerId ?? registrationPlayerId,
          player,
        });

        if (savedPlayerId !== playerId) {
          setPlayerId(savedPlayerId);
        }

        if (registrationPlayerId !== savedPlayerId) {
          const { error: registrationError } = await supabaseBrowser
            .from("registrations")
            .update({ player_id: savedPlayerId })
            .eq("id", registrationId);

          if (registrationError) {
            throw registrationError;
          }

          setRegistration((current) =>
            current
              ? {
                  ...current,
                  player_id: savedPlayerId,
                }
              : current,
          );
        }

        setAutosaveText("Player profile saved.");
      } catch (autosaveError) {
        setError(
          autosaveError instanceof Error
            ? autosaveError.message
            : "Player profile could not be autosaved.",
        );
        setAutosaveText("Autosave paused.");
      }
    }, 1000);

    return () => {
      if (autosaveTimeout.current) {
        clearTimeout(autosaveTimeout.current);
      }
    };
  }, [
    familyId,
    loading,
    player,
    playerId,
    registration?.id,
    registration?.player_id,
    saving,
    step,
  ]);

  useEffect(() => {
    const currentPlayerId = playerId ?? registration?.player_id ?? null;

    if (
      loading ||
      saving ||
      step !== "emergency" ||
      !currentPlayerId
    ) {
      return;
    }

    if (autosaveTimeout.current) {
      clearTimeout(autosaveTimeout.current);
    }

    autosaveTimeout.current = setTimeout(async () => {
      try {
        setAutosaveText("Saving emergency contact…");

        await saveEmergencyContact({
          playerId: currentPlayerId,
          emergency,
        });

        setAutosaveText("Emergency contact saved.");
      } catch (autosaveError) {
        setError(
          autosaveError instanceof Error
            ? autosaveError.message
            : "Emergency contact could not be autosaved.",
        );
        setAutosaveText("Autosave paused.");
      }
    }, 1000);

    return () => {
      if (autosaveTimeout.current) {
        clearTimeout(autosaveTimeout.current);
      }
    };
  }, [
    emergency,
    loading,
    playerId,
    registration?.player_id,
    saving,
    step,
  ]);

  useEffect(() => {
    const currentPlayerId = playerId ?? registration?.player_id ?? null;

    if (
      loading ||
      saving ||
      step !== "medical" ||
      !currentPlayerId
    ) {
      return;
    }

    if (autosaveTimeout.current) {
      clearTimeout(autosaveTimeout.current);
    }

    autosaveTimeout.current = setTimeout(async () => {
      try {
        setAutosaveText("Saving medical information…");

        await saveMedicalProfile({
          playerId: currentPlayerId,
          medical,
        });

        setAutosaveText("Medical information saved.");
      } catch (autosaveError) {
        setError(
          autosaveError instanceof Error
            ? autosaveError.message
            : "Medical information could not be autosaved.",
        );
        setAutosaveText("Autosave paused.");
      }
    }, 1000);

    return () => {
      if (autosaveTimeout.current) {
        clearTimeout(autosaveTimeout.current);
      }
    };
  }, [
    loading,
    medical,
    playerId,
    registration?.player_id,
    saving,
    step,
  ]);

  useEffect(() => {
    const currentPlayerId = playerId ?? registration?.player_id ?? null;
    const registrationId = registration?.id ?? null;

    if (
      loading ||
      saving ||
      step !== "uniform" ||
      !currentPlayerId ||
      !registrationId
    ) {
      return;
    }

    if (autosaveTimeout.current) {
      clearTimeout(autosaveTimeout.current);
    }

    autosaveTimeout.current = setTimeout(async () => {
      try {
        setAutosaveText("Saving uniform sizing…");

        await saveUniformProfile({
          registrationId,
          playerId: currentPlayerId,
          uniform,
        });

        setAutosaveText("Uniform sizing saved.");
      } catch (autosaveError) {
        setError(
          autosaveError instanceof Error
            ? autosaveError.message
            : "Uniform sizing could not be autosaved.",
        );
        setAutosaveText("Autosave paused.");
      }
    }, 1000);

    return () => {
      if (autosaveTimeout.current) {
        clearTimeout(autosaveTimeout.current);
      }
    };
  }, [
    loading,
    playerId,
    registration?.id,
    registration?.player_id,
    saving,
    step,
    uniform,
  ]);

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

  async function saveStep(
  destinationStep?: StepKey | null,
  shouldSubmit = false,
  shouldNavigate = true,
) {

    if (saving) {
      return;
    }

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

      if (
        !currentPlayerId &&
        (step === "emergency" ||
          step === "medical" ||
          step === "uniform" ||
          step === "review")
      ) {
        throw new Error("A player must be saved before continuing.");
      }

      if (
        currentPlayerId &&
        (step === "emergency" ||
          step === "medical" ||
          step === "uniform" ||
          step === "review")
      ) {
        await saveEmergencyContact({
          playerId: currentPlayerId,
          emergency,
        });
      }

      if (
        currentPlayerId &&
        (step === "medical" || step === "uniform" || step === "review")
      ) {
        await saveMedicalProfile({
          playerId: currentPlayerId,
          medical,
        });
      }

      if (
        currentPlayerId &&
        (step === "uniform" || step === "review")
      ) {
        await saveUniformProfile({
          registrationId: currentRegistration.id,
          playerId: currentPlayerId,
          uniform,
        });
      }

      const currentStepNumber = stepConfig[step].number;
      const completedSteps = Array.isArray(currentRegistration?.completed_steps) ? [...currentRegistration.completed_steps] : [];
      if (!completedSteps.includes(currentStepNumber)) completedSteps.push(currentStepNumber);

      if (shouldSubmit) {
        const { error: submitError } = await supabaseBrowser
          .from("registrations")
          .update({
            status: "submitted",
            submitted_at: new Date().toISOString(),
            current_step: stepConfig.review.number,
            completed_steps: completedSteps,
          })
          .eq("id", currentRegistration.id);

        if (submitError) throw submitError;

        await notifyExecutivesOfRegistration({
          registrationId: currentRegistration.id,
          event: "completed",
        });
        setAutosaveText("Registration submitted. Redirecting…");
        router.replace("/registration/complete");
        return;
      }

      const nextStep = destinationStep ?? getNextStep(step);

await supabaseBrowser
  .from("registrations")
  .update({
    current_step: shouldNavigate
      ? stepConfig[nextStep].number
      : stepConfig[step].number,
    completed_steps: completedSteps,
  })
  .eq("id", currentRegistration.id);

setAutosaveText("Draft saved.");

if (shouldNavigate) {
  router.push(`/registration/${nextStep}`);
}
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
        "w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-4 text-3xl font-semibold tracking-[-0.025em] text-slate-950 outline-none transition-all duration-300 placeholder:text-slate-300 focus:border-[#D7193F] sm:text-4xl";

      function advanceParentQuestion() {
        const errors: Record<string, string> = {};

        if (parentQuestion === 1 && !profile.first_name.trim()) {
          errors.first_name = "Tell us what you would like us to call you.";
        }

        if (parentQuestion === 2 && !profile.last_name.trim()) {
          errors.last_name = "Please enter your last name.";
        }

        if (parentQuestion === 3 && !profile.phone.trim()) {
          errors.phone = "Please enter the best phone number to reach you.";
        }

        if (Object.keys(errors).length > 0) {
          setFormErrors(errors);
          return;
        }

        setFormErrors({});
        setParentQuestion((current) => Math.min(current + 1, 4));
      }

      const firstName = profile.first_name.trim() || "there";

      return (
        <div className="mx-auto flex min-h-[570px] max-w-2xl flex-col">
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map((index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index <= parentQuestion
                      ? "w-9 bg-[linear-gradient(90deg,#FF5B7C,#D7193F)] shadow-[0_0_12px_rgba(215,25,63,0.28)]"
                      : "w-4 bg-slate-200"
                  }`}
                />
              ))}
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              About 5 minutes
            </p>
          </div>

          <div
            key={parentQuestion}
            className="flex flex-1 animate-in flex-col fade-in slide-in-from-right-5 duration-500"
          >
            {parentQuestion === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center pb-12 text-center">
                <Image
                  src="/brand/501-elite-wordmark.png"
                  alt="501 Elite Baseball"
                  width={520}
                  height={340}
                  priority
                  className="h-auto w-[310px] object-contain drop-shadow-[0_18px_28px_rgba(18,62,116,0.16)] sm:w-[390px]"
                />

                <p className="mt-8 text-sm font-bold uppercase tracking-[0.28em] text-[#D7193F]">
                  Welcome to the family
                </p>

                <h3 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                  Let’s get ready for the 2026–2027 season.
                </h3>

                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500">
                  We’ll guide you through registration one simple question at a
                  time. Everything saves automatically.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-slate-500">
                  <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 shadow-sm">
                    About 5 minutes
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700 shadow-sm">
                    Secure autosave
                  </span>
                </div>
              </div>
            ) : null}

            {parentQuestion === 1 ? (
              <div className="flex flex-1 flex-col justify-center pb-12">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#D7193F]">
                  First, let’s meet
                </p>

                <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                  What should we call you?
                </h3>

                <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                  Enter your first name. We’ll use it throughout your 501 Elite
                  experience.
                </p>

                <div className="mt-12 max-w-xl">
                  <label
                    htmlFor="parent-first-name"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    First name
                  </label>
                  <input
                    id="parent-first-name"
                    type="text"
                    autoComplete="given-name"
                    autoFocus
                    value={profile.first_name}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        first_name: event.target.value,
                      })
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        advanceParentQuestion();
                      }
                    }}
                    placeholder="Adam"
                    className={inputClassName}
                  />
                  {formErrors.first_name ? (
                    <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                      {formErrors.first_name}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {parentQuestion === 2 ? (
              <div className="flex flex-1 flex-col justify-center pb-12">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
                  Nice to meet you, {firstName}
                </p>

                <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                  What’s your last name?
                </h3>

                <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                  This helps us keep your family and player records organized.
                </p>

                <div className="mt-12 max-w-xl">
                  <label
                    htmlFor="parent-last-name"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Last name
                  </label>
                  <input
                    id="parent-last-name"
                    type="text"
                    autoComplete="family-name"
                    autoFocus
                    value={profile.last_name}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        last_name: event.target.value,
                      })
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        advanceParentQuestion();
                      }
                    }}
                    placeholder="Thomas"
                    className={inputClassName}
                  />
                  {formErrors.last_name ? (
                    <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                      {formErrors.last_name}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {parentQuestion === 3 ? (
              <div className="flex flex-1 flex-col justify-center pb-12">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
                  Perfect
                </p>

                <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                  What’s the best number for Coach Chase to reach you?
                </h3>

                <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                  We’ll use it for schedule changes, weather alerts, and
                  important team communication.
                </p>

                <div className="mt-12 max-w-xl">
                  <label
                    htmlFor="parent-phone"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Mobile phone
                  </label>
                  <input
                    id="parent-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    autoFocus
                    value={profile.phone}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        phone: event.target.value,
                      })
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        advanceParentQuestion();
                      }
                    }}
                    placeholder="(501) 555-0123"
                    className={inputClassName}
                  />
                  {formErrors.phone ? (
                    <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                      {formErrors.phone}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {parentQuestion === 4 ? (
              <div className="flex flex-1 flex-col justify-center pb-12">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-[0_12px_30px_rgba(16,185,129,0.16)]">
                  <CheckCircle2 className="h-7 w-7" />
                </div>

                <p className="mt-8 text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
                  You’re all set, {firstName}
                </p>

                <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                  We’ll keep you connected.
                </h3>

                <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                  Schedules, tournament information, and registration updates
                  will be sent to your secure account email.
                </p>

                <div className="mt-10 max-w-xl rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Verified account email
                  </p>
                  <p className="mt-2 break-all text-lg font-semibold text-slate-900">
                    {profile.email}
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Connected to your 501 Elite OS account
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => {
                setFormErrors({});
                setParentQuestion((current) => Math.max(current - 1, 0));
              }}
              disabled={parentQuestion === 0}
              className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#123E74] disabled:invisible"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {parentQuestion < 4 ? (
              <button
                type="button"
                onClick={advanceParentQuestion}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[linear-gradient(145deg,#173F73,#0B2954)] px-8 text-sm font-bold text-white shadow-[0_16px_34px_rgba(18,62,116,0.30)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(18,62,116,0.38)] active:translate-y-0"
              >
                {parentQuestion === 0 ? "Let’s go" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <p className="text-right text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                Parent details complete
              </p>
            )}
          </div>
        </div>
      );
    }

    if (step === "family") {
      return (
        <FamilyStep
          family={family}
          setFamily={setFamily}
          question={familyQuestion}
          setQuestion={setFamilyQuestion}
        />
      );
    }

    if (step === "player") {
      return (
        <PlayerStep
          player={player}
          setPlayer={setPlayer}
          question={playerQuestion}
          setQuestion={setPlayerQuestion}
        />
      );
    }

    if (step === "emergency") {
      return (
        <EmergencyStep
          emergency={emergency}
          setEmergency={setEmergency}
          question={emergencyQuestion}
          setQuestion={setEmergencyQuestion}
          playerName={
            player.preferred_name.trim() ||
            player.first_name.trim() ||
            "your athlete"
          }
        />
      );
    }

    if (step === "medical") {
      return (
        <MedicalStep
          medical={medical}
          setMedical={setMedical}
          question={medicalQuestion}
          setQuestion={setMedicalQuestion}
          playerName={
            player.preferred_name.trim() ||
            player.first_name.trim() ||
            "your athlete"
          }
        />
      );
    }

    if (step === "uniform") {
      return (
        <UniformStep
          uniform={uniform}
          setUniform={setUniform}
          question={uniformQuestion}
          setQuestion={setUniformQuestion}
          playerName={
            player.preferred_name.trim() ||
            player.first_name.trim() ||
            "your athlete"
          }
        />
      );
    }

    if (step === "review") {
      return (
        <ReviewStep
          profile={profile}
          family={family}
          player={player}
          emergency={emergency}
          medical={medical}
          uniform={uniform}
        />
      );
    }

    if (step === "complete") {
      return (
        <SectionCompletePrompt
          eyebrow="Player information complete"
          title="The registration form is saved."
          description="Next, complete six short release forms. You can continue now or safely return with this account later."
          continueHref="/registration/releases"
          continueLabel="Continue to release forms"
        />
      );
    }

    return null;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F4F7FC] px-3 py-4 text-slate-950 sm:px-6 sm:py-8 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-40 h-[30rem] w-[30rem] rounded-full bg-[#123E74]/10 blur-3xl" />
        <div className="absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[#D7193F]/8 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-blue-200/30 blur-3xl" />
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col gap-4 rounded-[36px] border border-white/80 bg-white/65 p-3 shadow-[0_40px_140px_rgba(18,62,116,0.18)] backdrop-blur-2xl sm:gap-6 sm:p-5 lg:min-h-[760px] lg:flex-row lg:p-6">
        <aside className="relative w-full overflow-hidden rounded-[30px] bg-[linear-gradient(155deg,#173F73_0%,#0B2548_58%,#081C36_100%)] p-5 text-white shadow-[0_24px_70px_rgba(8,28,54,0.34)] sm:p-6 lg:max-w-[340px]">
          <div aria-hidden="true" className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#D7193F]/20 blur-3xl" />
          <div className="relative">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-100/70">
              501 Elite OS
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-white">
              Getting started
            </h1>
            <p className="mt-2 text-sm leading-6 text-blue-100/75">
              Everything saves automatically as you go.
            </p>
          </div>

          <div className="mt-7 rounded-[26px] border border-white/15 bg-white/10 p-5 shadow-inner shadow-white/5 backdrop-blur-md">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className="font-semibold">{stepConfig[step].number}/8</span>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#FF5B7C,#D7193F)] shadow-[0_0_18px_rgba(255,91,124,0.7)] transition-all duration-700 ease-out"
                style={{ width: `${Math.min((stepConfig[step].number / 8) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-blue-50">{stepConfig[step].description}</p>
          </div>

          <div className="mt-6 space-y-2 text-sm">
            {stepOrder.map((item) => {
              const config = stepConfig[item];
              const active = item === step;
              const done = stepConfig[step].number > config.number;
              return (
                <div
                  key={item}
                  className={`flex items-center justify-between rounded-2xl border px-3.5 py-3 transition-all duration-300 ${
                    active
                      ? "border-white/20 bg-white/15 shadow-lg shadow-black/10"
                      : done
                        ? "border-transparent bg-white/[0.06] text-white"
                        : "border-transparent bg-transparent text-blue-100/70"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                    {config.title}
                  </span>
                </div>
              );
            })}
          </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="flex min-h-full flex-col rounded-[30px] border border-white/90 bg-white/85 p-4 shadow-[0_20px_70px_rgba(18,62,116,0.10)] backdrop-blur-xl sm:p-7 lg:p-9">
            {!(step === "parent" && parentQuestion === 0) ? (
              <BrandHeader />
            ) : null}

            <div className="flex items-start justify-between gap-3">
              <RegistrationProgress
               current={stepConfig[step].number}
                total={totalRegistrationSteps}
                title={stepConfig[step].title}
                description={stepConfig[step].description}
              />
              <div className="inline-flex max-w-[220px] items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/90 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm sm:text-sm">
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.12)]" />
                <span className="truncate">{autosaveText}</span>
              </div>
            </div>

            {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            {loading ? (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading your registration draft…</div>
            ) : (
              <div className="mt-6 space-y-6">
                {renderFormFields()}

                {step !== "complete" &&
                (step !== "parent" || parentQuestion === 4) &&
                (step !== "family" || familyQuestion === 3) &&
                (step !== "player" || playerQuestion === 7) &&
                (step !== "emergency" || emergencyQuestion === 4) &&
                (step !== "medical" || medicalQuestion === 6) &&
                (step !== "uniform" || uniformQuestion === 5) ? (
                  <div className="sticky bottom-3 z-20 -mx-1 flex flex-col gap-3 rounded-[24px] border border-white/90 bg-white/90 p-3 shadow-[0_16px_50px_rgba(18,62,116,0.18)] backdrop-blur-xl sm:static sm:mx-0 sm:flex-row sm:justify-between sm:rounded-none sm:border-x-0 sm:border-b-0 sm:border-t sm:border-slate-200 sm:bg-transparent sm:p-0 sm:pt-5 sm:shadow-none">
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
