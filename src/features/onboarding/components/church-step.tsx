"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DENOMINATIONS } from "@/features/onboarding/presets"

interface ChurchStepProps {
  churchName: string
  denomination: string
  onChange: (patch: { churchName?: string; denomination?: string }) => void
}

export function ChurchStep({ churchName, denomination, onChange }: ChurchStepProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="churchName" className="text-sm font-medium text-slate-800">
          Church name
        </Label>
        <Input
          id="churchName"
          placeholder="Grace Community Church"
          value={churchName}
          onChange={(e) => onChange({ churchName: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-800">Denomination</Label>
        <Select value={denomination} onValueChange={(v) => onChange({ denomination: v ?? "" })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a denomination" />
          </SelectTrigger>
          <SelectContent>
            {DENOMINATIONS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
