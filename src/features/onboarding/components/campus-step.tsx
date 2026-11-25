"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { TextFormField } from "@/components/form-fields"
import { slugify } from "@/features/onboarding/presets"
import { ONBOARDING_STEP_FORM_ID } from "@/features/onboarding/components/church-step"

export const campusStepSchema = z.object({
  campusName: z.string().trim().min(2, "Enter a location name (at least 2 characters)."),
  city: z.string(),
  slug: z.string().min(2, "URL must be at least 2 characters."),
})

export type CampusStepValues = z.infer<typeof campusStepSchema>

interface CampusStepProps {
  defaultValues: CampusStepValues
  onContinue: (values: CampusStepValues) => void
}

export function CampusStep({ defaultValues, onContinue }: CampusStepProps) {
  const form = useForm<CampusStepValues>({
    resolver: zodResolver(campusStepSchema),
    defaultValues,
  })

  // Keep the connection-card slug following the location name (as before),
  // without clobbering a previously saved slug on mount.
  const campusName = useWatch({ control: form.control, name: "campusName" })
  const lastName = React.useRef(defaultValues.campusName)
  React.useEffect(() => {
    if (campusName === lastName.current) return
    lastName.current = campusName
    form.setValue("slug", slugify(campusName), { shouldValidate: form.formState.isSubmitted })
  }, [campusName, form])

  return (
    <Form {...form}>
      <form
        id={ONBOARDING_STEP_FORM_ID}
        noValidate
        onSubmit={form.handleSubmit((values) =>
          onContinue({ ...values, campusName: values.campusName.trim(), city: values.city.trim() })
        )}
      >
        <FieldGroup>
          <TextFormField
            control={form.control}
            name="campusName"
            label="Location name"
            placeholder="Main Location"
            autoFocus
          />
          <TextFormField control={form.control} name="city" label="City" placeholder="Lagos" />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Connection card URL</FormLabel>
                <FormControl>
                  <div className="flex h-10 items-center overflow-hidden rounded-lg border border-input bg-white shadow-xs focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
                    <span className="border-r border-zinc-200 bg-zinc-50 px-3.5 text-sm text-zinc-500">
                      /welcome/
                    </span>
                    <input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(slugify(e.target.value))}
                      placeholder="main-location"
                      className="h-full w-full bg-transparent px-3.5 text-sm outline-none"
                    />
                  </div>
                </FormControl>
                <FormDescription>Visitors scan your QR code to land here.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FieldGroup>
      </form>
    </Form>
  )
}
