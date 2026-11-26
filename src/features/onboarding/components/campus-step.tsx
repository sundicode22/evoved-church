"use client"

import * as React from "react"
import { useFormContext, useWatch } from "react-hook-form"
import {
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
import type { OnboardingFormValues } from "@/features/onboarding/schemas"

export function CampusStep() {
  const form = useFormContext<OnboardingFormValues>()
  const campusName = useWatch({ control: form.control, name: "campusName" })
  const lastName = React.useRef(form.getValues("campusName"))

  React.useEffect(() => {
    if (campusName === lastName.current) return
    lastName.current = campusName
    form.setValue("slug", slugify(campusName), {
      shouldValidate: form.formState.isSubmitted,
    })
  }, [campusName, form])

  return (
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
              <div className="flex h-10 items-center overflow-hidden rounded-lg border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
                <span className="border-r border-border bg-muted px-3.5 text-sm text-muted-foreground">
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
  )
}
