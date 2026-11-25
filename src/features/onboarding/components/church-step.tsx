"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { SelectFormField, TextFormField } from "@/components/form-fields"
import { DENOMINATIONS } from "@/features/onboarding/presets"

export const ONBOARDING_STEP_FORM_ID = "onboarding-step-form"

export const churchStepSchema = z.object({
  churchName: z.string().trim().min(2, "Enter your church name (at least 2 characters)."),
  denomination: z.string().min(1, "Select a denomination."),
})

export type ChurchStepValues = z.infer<typeof churchStepSchema>

interface ChurchStepProps {
  defaultValues: ChurchStepValues
  onContinue: (values: ChurchStepValues) => void
}

const DENOMINATION_OPTIONS = DENOMINATIONS.map((d) => ({ value: d, label: d }))

export function ChurchStep({ defaultValues, onContinue }: ChurchStepProps) {
  const form = useForm<ChurchStepValues>({
    resolver: zodResolver(churchStepSchema),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form
        id={ONBOARDING_STEP_FORM_ID}
        noValidate
        onSubmit={form.handleSubmit((values) =>
          onContinue({ ...values, churchName: values.churchName.trim() })
        )}
      >
        <FieldGroup>
          <TextFormField
            control={form.control}
            name="churchName"
            label="Church name"
            placeholder="Grace Community Church"
            autoFocus
          />
          <SelectFormField
            control={form.control}
            name="denomination"
            label="Denomination"
            placeholder="Select a denomination"
            options={DENOMINATION_OPTIONS}
          />
        </FieldGroup>
      </form>
    </Form>
  )
}
