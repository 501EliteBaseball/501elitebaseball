"use client";

import type { Dispatch, SetStateAction } from "react";

export type FamilyForm = {
  family_name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
};

type FamilyStepProps = {
  family: FamilyForm;
  setFamily: Dispatch<SetStateAction<FamilyForm>>;
  formErrors: Record<string, string>;
};

export default function FamilyStep({
  family,
  setFamily,
  formErrors,
}: FamilyStepProps) {
  const inputClassName =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-[#123E74] focus:bg-white focus:ring-4 focus:ring-[#123E74]/10";

  const getInputClassName = (hasError: boolean) =>
    `${inputClassName} ${
      hasError
        ? "border-[#D7193F] focus:border-[#D7193F] focus:ring-[#D7193F]/10"
        : ""
    }`;

  const errorClassName = "text-sm font-medium text-[#D7193F]";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="family-name"
          className="text-sm font-semibold text-slate-700"
        >
          Family name
        </label>
        <input
          id="family-name"
          name="familyName"
          type="text"
          autoComplete="family-name"
          value={family.family_name}
          onChange={(event) =>
            setFamily({
              ...family,
              family_name: event.target.value,
            })
          }
          aria-invalid={Boolean(formErrors.family_name)}
          aria-describedby={
            formErrors.family_name ? "family-name-error" : undefined
          }
          className={getInputClassName(Boolean(formErrors.family_name))}
        />
        {formErrors.family_name ? (
          <p id="family-name-error" role="alert" className={errorClassName}>
            {formErrors.family_name}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="address-line-1"
          className="text-sm font-semibold text-slate-700"
        >
          Street address
        </label>
        <input
          id="address-line-1"
          name="addressLine1"
          type="text"
          autoComplete="address-line1"
          value={family.address_line_1}
          onChange={(event) =>
            setFamily({
              ...family,
              address_line_1: event.target.value,
            })
          }
          aria-invalid={Boolean(formErrors.address_line_1)}
          aria-describedby={
            formErrors.address_line_1 ? "address-line-1-error" : undefined
          }
          className={getInputClassName(Boolean(formErrors.address_line_1))}
        />
        {formErrors.address_line_1 ? (
          <p id="address-line-1-error" role="alert" className={errorClassName}>
            {formErrors.address_line_1}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="address-line-2"
          className="text-sm font-semibold text-slate-700"
        >
          Apartment, suite, or unit
          <span className="ml-1 font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="address-line-2"
          name="addressLine2"
          type="text"
          autoComplete="address-line2"
          value={family.address_line_2}
          onChange={(event) =>
            setFamily({
              ...family,
              address_line_2: event.target.value,
            })
          }
          className={inputClassName}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="family-city"
            className="text-sm font-semibold text-slate-700"
          >
            City
          </label>
          <input
            id="family-city"
            name="city"
            type="text"
            autoComplete="address-level2"
            value={family.city}
            onChange={(event) =>
              setFamily({
                ...family,
                city: event.target.value,
              })
            }
            aria-invalid={Boolean(formErrors.city)}
            aria-describedby={formErrors.city ? "family-city-error" : undefined}
            className={getInputClassName(Boolean(formErrors.city))}
          />
          {formErrors.city ? (
            <p id="family-city-error" role="alert" className={errorClassName}>
              {formErrors.city}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="family-state"
            className="text-sm font-semibold text-slate-700"
          >
            State
          </label>
          <input
            id="family-state"
            name="state"
            type="text"
            autoComplete="address-level1"
            inputMode="text"
            maxLength={2}
            placeholder="AR"
            value={family.state}
            onChange={(event) =>
              setFamily({
                ...family,
                state: event.target.value.toUpperCase(),
              })
            }
            aria-invalid={Boolean(formErrors.state)}
            aria-describedby={
              formErrors.state ? "family-state-error" : undefined
            }
            className={getInputClassName(Boolean(formErrors.state))}
          />
          {formErrors.state ? (
            <p id="family-state-error" role="alert" className={errorClassName}>
              {formErrors.state}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="family-postal-code"
          className="text-sm font-semibold text-slate-700"
        >
          ZIP code
        </label>
        <input
          id="family-postal-code"
          name="postalCode"
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={10}
          value={family.postal_code}
          onChange={(event) =>
            setFamily({
              ...family,
              postal_code: event.target.value,
            })
          }
          aria-invalid={Boolean(formErrors.postal_code)}
          aria-describedby={
            formErrors.postal_code ? "family-postal-code-error" : undefined
          }
          className={getInputClassName(Boolean(formErrors.postal_code))}
        />
        {formErrors.postal_code ? (
          <p
            id="family-postal-code-error"
            role="alert"
            className={errorClassName}
          >
            {formErrors.postal_code}
          </p>
        ) : null}
      </div>
    </div>
  );
}
