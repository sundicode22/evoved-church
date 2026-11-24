"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const PROVIDERS = [
  {
    id: "resend",
    name: "Resend (Email)",
    description: "All church email — drips, alerts, and campaign HTML. Not used for SMS.",
    fields: [
      { key: "apiKey", label: "API key", placeholder: "re_...", secret: true },
      { key: "fromEmail", label: "From email", placeholder: "hello@yourchurch.org" },
    ],
  },
  {
    id: "twilio",
    name: "Twilio (SMS)",
    description: "Separate SMS provider for campaigns and reminders. Never goes through Resend.",
    fields: [
      { key: "accountSid", label: "Account SID", placeholder: "AC..." },
      { key: "authToken", label: "Auth token", placeholder: "••••••••", secret: true },
      { key: "fromNumber", label: "From number", placeholder: "+15551234567" },
    ],
  },
  {
    id: "cloudinary",
    name: "Cloudinary",
    description: "Media and document storage for the vault.",
    fields: [
      { key: "cloudName", label: "Cloud name", placeholder: "my-church" },
      { key: "apiKey", label: "API key", placeholder: "123456789" },
      { key: "apiSecret", label: "API secret", placeholder: "••••••••", secret: true },
    ],
  },
] as const

export function IntegrationsTab({ canEdit }: { canEdit: boolean }) {
  // Local-only placeholder state; secrets are never persisted from this screen.
  const [values, setValues] = React.useState<Record<string, string>>({})

  const set = (provider: string, key: string, v: string) =>
    setValues((prev) => ({ ...prev, [`${provider}.${key}`]: v }))

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {PROVIDERS.map((p) => (
        <Card key={p.id} className="rounded-lg border-zinc-200/80 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-900">{p.name}</CardTitle>
            <CardDescription className="text-xs">{p.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {p.fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-700">{f.label}</Label>
                <Input
                  type={"secret" in f && f.secret ? "password" : "text"}
                  value={values[`${p.id}.${f.key}`] ?? ""}
                  placeholder={f.placeholder}
                  disabled={!canEdit}
                  onChange={(e) => set(p.id, f.key, e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            ))}
            <Button
              disabled={!canEdit}
              onClick={() => toast.success(`${p.name} settings saved locally (demo)`)}
              className="mt-2 h-9 w-full rounded-lg bg-[#22c55e] text-xs font-normal text-white hover:bg-[#16a34a]"
            >
              Save {p.name}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
