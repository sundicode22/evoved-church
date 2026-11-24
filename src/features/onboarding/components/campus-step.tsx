"use client"

import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { slugify } from "@/features/onboarding/presets"

interface CampusStepProps {
  campusName: string
  city: string
  slug: string
  onChange: (patch: { campusName?: string; city?: string; slug?: string }) => void
}

export function CampusStep({ campusName, city, slug, onChange }: CampusStepProps) {
  return (
    <div className="space-y-5">
      <Field>
        <FieldLabel htmlFor="campusName">Location name</FieldLabel>
        <Input
          id="campusName"
          placeholder="Main Location"
          value={campusName}
          onChange={(e) => onChange({ campusName: e.target.value, slug: slugify(e.target.value) })}
          className="h-10 rounded-lg bg-white"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="city">City</FieldLabel>
        <Input
          id="city"
          placeholder="Lagos"
          value={city}
          onChange={(e) => onChange({ city: e.target.value })}
          className="h-10 rounded-lg bg-white"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="slug">Connection card URL</FieldLabel>
        <div className="flex items-center overflow-hidden rounded-lg border border-input bg-white focus-within:ring-2 focus-within:ring-[#22c55e]/30">
          <span className="border-r border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-500">
            /welcome/
          </span>
          <input
            id="slug"
            value={slug}
            onChange={(e) => onChange({ slug: slugify(e.target.value) })}
            placeholder="main-location"
            className="h-10 w-full bg-transparent px-3 text-sm outline-none"
          />
        </div>
        <p className="text-xs text-zinc-400">Visitors scan your QR code to land here.</p>
      </Field>
    </div>
  )
}
