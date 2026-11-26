"use client"

import { useFormContext } from "react-hook-form"
import { FieldGroup } from "@/components/ui/field"
import { SelectFormField, TextFormField } from "@/components/form-fields"
import { DENOMINATIONS } from "@/features/onboarding/presets"
import type { OnboardingFormValues } from "@/features/onboarding/schemas"

const DENOMINATION_OPTIONS = DENOMINATIONS.map((d) => ({ value: d, label: d }))

export function ChurchStep() {
  const { control } = useFormContext<OnboardingFormValues>()

  return (
    <FieldGroup>
      <TextFormField
        control={control}
        name="churchName"
        label="Church name"
        placeholder="Grace Community Church"
        autoFocus
      />
      <SelectFormField
        control={control}
        name="denomination"
        label="Denomination"
        placeholder="Select a denomination"
        options={DENOMINATION_OPTIONS}
      />
    </FieldGroup>
  )
}
