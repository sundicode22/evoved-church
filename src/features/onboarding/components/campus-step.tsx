"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
      <div className="space-y-1.5">
        <Label htmlFor="campusName" className="text-slate-700">Campus name</Label>
        <Input
          id="campusName"
          placeholder="Main Campus"
          value={campusName}
          onChange={(e) => onChange({ campusName: e.target.value, slug: slugify(e.target.value) })}
          className="h-10 rounded-lg bg-white"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="city" className="text-slate-700">City</Label>
        <Input
          id="city"
          placeholder="Lagos"
          value={city}
          onChange={(e) => onChange({ city: e.target.value })}
          className="h-10 rounded-lg bg-white"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug" className="text-slate-700">Connection card URL</Label>
        <div className="flex items-center overflow-hidden rounded-lg border border-input bg-white focus-within:ring-2 focus-within:ring-[#22c55e]/30">
          <span className="border-r border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-500">/welcome/</span>
          <input
            id="slug"
            value={slug}
            onChange={(e) => onChange({ slug: slugify(e.target.value) })}
            placeholder="main-campus"
            className="h-10 w-full bg-transparent px-3 text-sm outline-none"
          />
        </div>
        <p className="text-xs text-zinc-400">Visitors scan your QR code to land here.</p>
      </div>
    </div>
  )
}
