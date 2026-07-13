import { notFound } from "next/navigation";

import RegistrationWizard from "@/components/registration/RegistrationWizard";

const validSteps = [
  "parent",
  "family",
  "player",
  "emergency",
  "medical",
  "uniform",
  "review",
  "complete",
] as const;

type RegistrationStep = (typeof validSteps)[number];

type RegistrationStepPageProps = {
  params: Promise<{
    step: string;
  }>;
};

export default async function RegistrationStepPage({
  params,
}: RegistrationStepPageProps) {
  const { step } = await params;

  if (!validSteps.includes(step as RegistrationStep)) {
    notFound();
  }

  return <RegistrationWizard step={step as RegistrationStep} />;
}
