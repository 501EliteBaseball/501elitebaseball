"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleUserRound,
  Hash,
  School,
  Sparkles,
} from "lucide-react";

export type PlayerForm = {
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

type PlayerStepProps = {
  player: PlayerForm;
  setPlayer: Dispatch<SetStateAction<PlayerForm>>;
  question: number;
  setQuestion: Dispatch<SetStateAction<number>>;
};

const totalQuestions = 7;

const textInputClassName =
  "w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-4 text-2xl font-semibold tracking-[-0.025em] text-slate-950 outline-none transition-all duration-300 placeholder:text-slate-300 focus:border-[#D7193F] sm:text-3xl";

const choiceClassName =
  "min-h-14 rounded-2xl border px-5 text-left text-base font-semibold transition duration-200";

export default function PlayerStep({
  player,
  setPlayer,
  question,
  setQuestion,
}: PlayerStepProps) {
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const playerName =
    player.preferred_name.trim() ||
    player.first_name.trim() ||
    "your athlete";

  const fullName = [
    player.first_name.trim(),
    player.middle_name.trim(),
    player.last_name.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  const displayName = fullName || "Your athlete";

  const progressQuestion = Math.min(Math.max(question, 1), totalQuestions);
  const progressPercentage =
    question === 0 ? 0 : Math.min((question / totalQuestions) * 100, 100);

  function advance() {
    const errors: Record<string, string> = {};

    if (question === 1 && !player.first_name.trim()) {
      errors.first_name = "Please enter your athlete’s first name.";
    }

    if (question === 2 && !player.last_name.trim()) {
      errors.last_name = "Please enter your athlete’s last name.";
    }

    if (question === 3) {
      if (!player.date_of_birth) {
        errors.date_of_birth = "Please enter the date of birth.";
      }

      if (!player.gender.trim()) {
        errors.gender = "Please select an option.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLocalErrors({});
    setQuestion((current) => Math.min(current + 1, 7));
  }

  function goBack() {
    setLocalErrors({});
    setQuestion((current) => Math.max(current - 1, 0));
  }

  function updatePlayer(values: Partial<PlayerForm>) {
    setLocalErrors({});
    setPlayer((current) => ({
      ...current,
      ...values,
    }));
  }

  function PlayerProfileCard() {
    return (
      <aside className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-[linear-gradient(155deg,#ffffff_0%,#f8fafc_58%,#eef4fb_100%)] p-6 shadow-[0_24px_70px_rgba(18,62,116,0.12)]">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#123E74]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-[#D7193F]/10 blur-3xl"
        />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#123E74]">
                Live player profile
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Updates automatically as you answer.
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#123E74] text-white shadow-[0_12px_26px_rgba(18,62,116,0.22)]">
              <CircleUserRound className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-8">
            <p className="text-2xl font-semibold tracking-[-0.035em] text-slate-950">
              {displayName}
            </p>

            <p className="mt-2 text-sm font-semibold text-[#D7193F]">
              501 Elite Baseball
            </p>
          </div>

          <div className="mt-7 space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/90 bg-white/80 px-4 py-3 shadow-sm">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <School className="h-4 w-4 text-[#123E74]" />
                School
              </span>
              <span className="text-right text-sm font-semibold text-slate-900">
                {player.school.trim() || "—"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/90 bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-xs font-medium text-slate-400">Grade</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {player.grade.trim() || "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/90 bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-xs font-medium text-slate-400">Number</p>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-900">
                  <Hash className="h-3.5 w-3.5 text-[#D7193F]" />
                  {player.jersey_number_preference.trim() || "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/90 bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-xs font-medium text-slate-400">Bats</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {player.bats || "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/90 bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-xs font-medium text-slate-400">Throws</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {player.throws || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-3 w-3" />
            </span>
            Securely saved to your registration
          </div>
        </div>
      </aside>
    );
  }

  return (
    <div className="mx-auto flex min-h-[620px] max-w-5xl flex-col">
      <div className="mb-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#123E74]">
              Player profile
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {question === 0
                ? "Introduction"
                : question === 7
                  ? "Profile complete"
                  : `Question ${progressQuestion} of ${totalQuestions}`}
            </p>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Your athlete
          </p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#FF5B7C,#D7193F)] shadow-[0_0_14px_rgba(215,25,63,0.28)] transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
        <div
          key={question}
          className="flex min-w-0 flex-col animate-in fade-in slide-in-from-right-5 duration-500"
        >
          {question === 0 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#123E74]/10 text-[#123E74]">
                <CircleUserRound className="h-8 w-8" />
              </div>

              <p className="mt-9 text-sm font-bold uppercase tracking-[0.24em] text-[#D7193F]">
                Now for the fun part
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                Let’s meet your athlete.
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                We’ll build their player profile together, one simple question
                at a time.
              </p>
            </div>
          ) : null}

          {question === 1 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#D7193F]">
                First introductions
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                What’s your athlete’s first name?
              </h3>

              <div className="mt-12 max-w-xl">
                <label
                  htmlFor="player-first-name"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                >
                  First name
                </label>

                <input
                  id="player-first-name"
                  type="text"
                  autoComplete="given-name"
                  autoFocus
                  value={player.first_name}
                  onChange={(event) =>
                    updatePlayer({ first_name: event.target.value })
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      advance();
                    }
                  }}
                  placeholder="Jack"
                  className={textInputClassName}
                />

                {localErrors.first_name ? (
                  <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                    {localErrors.first_name}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {question === 2 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
                Great to meet you, {player.first_name || "player"}
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                Finish the name on the roster.
              </h3>

              <div className="mt-10 grid gap-7 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="player-last-name"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Last name
                  </label>

                  <input
                    id="player-last-name"
                    type="text"
                    autoComplete="family-name"
                    autoFocus
                    value={player.last_name}
                    onChange={(event) =>
                      updatePlayer({ last_name: event.target.value })
                    }
                    placeholder="Thomas"
                    className={textInputClassName}
                  />

                  {localErrors.last_name ? (
                    <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                      {localErrors.last_name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="player-middle-name"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Middle name
                    <span className="ml-2 font-medium normal-case tracking-normal">
                      Optional
                    </span>
                  </label>

                  <input
                    id="player-middle-name"
                    type="text"
                    autoComplete="additional-name"
                    value={player.middle_name}
                    onChange={(event) =>
                      updatePlayer({ middle_name: event.target.value })
                    }
                    placeholder="Michael"
                    className={textInputClassName}
                  />
                </div>
              </div>

              <div className="mt-8 max-w-xl">
                <label
                  htmlFor="player-preferred-name"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                >
                  Preferred name
                  <span className="ml-2 font-medium normal-case tracking-normal">
                    Optional
                  </span>
                </label>

                <input
                  id="player-preferred-name"
                  type="text"
                  value={player.preferred_name}
                  onChange={(event) =>
                    updatePlayer({ preferred_name: event.target.value })
                  }
                  placeholder="What should the coaches call them?"
                  className={textInputClassName}
                />
              </div>
            </div>
          ) : null}

          {question === 3 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
                Tell us about {playerName}
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                When is {playerName}’s birthday?
              </h3>

              <div className="mt-10 max-w-xl">
                <label
                  htmlFor="player-date-of-birth"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                >
                  Date of birth
                </label>

                <input
                  id="player-date-of-birth"
                  type="date"
                  value={player.date_of_birth}
                  onChange={(event) =>
                    updatePlayer({ date_of_birth: event.target.value })
                  }
                  className={textInputClassName}
                />

                {localErrors.date_of_birth ? (
                  <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                    {localErrors.date_of_birth}
                  </p>
                ) : null}
              </div>

              <div className="mt-10">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Gender
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {["Male", "Female", "Prefer not to say"].map((option) => {
                    const selected = player.gender === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updatePlayer({ gender: option })}
                        className={`${choiceClassName} ${
                          selected
                            ? "border-[#123E74] bg-[#123E74] text-white shadow-lg shadow-[#123E74]/20"
                            : "border-slate-200 bg-white text-slate-700 hover:border-[#123E74]/40"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {localErrors.gender ? (
                  <p className="mt-3 text-sm font-semibold text-[#D7193F]">
                    {localErrors.gender}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {question === 4 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
                A little more about {playerName}
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                Where does {playerName} go to school?
              </h3>

              <div className="mt-10 grid gap-8 sm:grid-cols-[1.5fr_0.7fr]">
                <div>
                  <label
                    htmlFor="player-school"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    School
                  </label>

                  <input
                    id="player-school"
                    type="text"
                    autoFocus
                    value={player.school}
                    onChange={(event) =>
                      updatePlayer({ school: event.target.value })
                    }
                    placeholder="Fountain Lake"
                    className={textInputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="player-grade"
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                  >
                    Grade
                  </label>

                  <input
                    id="player-grade"
                    type="text"
                    value={player.grade}
                    onChange={(event) =>
                      updatePlayer({ grade: event.target.value })
                    }
                    placeholder="2nd"
                    className={textInputClassName}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {question === 5 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#D7193F]">
                Player profile
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                Tell us how {playerName} plays the game.
              </h3>

              <div className="mt-10 space-y-9">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Bats
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {["Right", "Left", "Switch"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updatePlayer({ bats: option })}
                        className={`${choiceClassName} ${
                          player.bats === option
                            ? "border-[#123E74] bg-[#123E74] text-white shadow-lg shadow-[#123E74]/20"
                            : "border-slate-200 bg-white text-slate-700 hover:border-[#123E74]/40"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Throws
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {["Right", "Left"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updatePlayer({ throws: option })}
                        className={`${choiceClassName} ${
                          player.throws === option
                            ? "border-[#123E74] bg-[#123E74] text-white shadow-lg shadow-[#123E74]/20"
                            : "border-slate-200 bg-white text-slate-700 hover:border-[#123E74]/40"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {question === 6 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
                One last preference
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                Does {playerName} have a favorite jersey number?
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                We cannot guarantee number availability, but we’ll do our best.
                This can be left blank.
              </p>

              <div className="mt-12 max-w-xs">
                <label
                  htmlFor="player-jersey-number"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                >
                  Preferred number
                </label>

                <input
                  id="player-jersey-number"
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={player.jersey_number_preference}
                  onChange={(event) =>
                    updatePlayer({
                      jersey_number_preference: event.target.value,
                    })
                  }
                  placeholder="13"
                  className={textInputClassName}
                />
              </div>
            </div>
          ) : null}

          {question === 7 ? (
            <div className="flex flex-1 flex-col justify-center pb-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-[0_12px_30px_rgba(16,185,129,0.16)]">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <p className="mt-8 text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">
                Player profile complete
              </p>

              <h3 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl">
                {playerName}’s player profile is ready.
              </h3>

              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">
                We’re excited to welcome {playerName} to 501 Elite.
              </p>

              <div className="mt-9 flex max-w-xl items-start gap-4 rounded-[28px] border border-emerald-200/80 bg-emerald-50/70 p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xl font-semibold text-slate-950">
                    {player.first_name} {player.last_name}
                  </p>

                  <p className="mt-2 leading-7 text-slate-500">
                    {player.school || "School not provided"}
                    {player.grade ? ` · ${player.grade}` : ""}
                  </p>

                  <p className="mt-2 text-sm font-semibold text-[#123E74]">
                    Bats: {player.bats || "Not provided"} · Throws:{" "}
                    {player.throws || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={goBack}
              disabled={question === 0}
              className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#123E74] disabled:invisible"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {question < 7 ? (
              <button
                type="button"
                onClick={advance}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[linear-gradient(145deg,#173F73,#0B2954)] px-8 text-sm font-bold text-white shadow-[0_16px_34px_rgba(18,62,116,0.30)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(18,62,116,0.38)]"
              >
                {question === 0 ? "Build the profile" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <p className="text-right text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                Athlete details complete
              </p>
            )}
          </div>
        </div>

        <div className="order-first lg:order-last">
          <div className="lg:sticky lg:top-6">
            <PlayerProfileCard />
          </div>
        </div>
      </div>
    </div>
  );
}
