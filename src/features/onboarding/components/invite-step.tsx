"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface InviteStepProps {
  emails: string[]
  onChange: (emails: string[]) => void
}

export function InviteStep({ emails, onChange }: InviteStepProps) {
  const [draft, setDraft] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  function add() {
    const value = draft.trim().toLowerCase()
    if (!value) return
    if (!EMAIL_RE.test(value)) return setError("Enter a valid email address.")
    if (emails.includes(value)) return setError("That email is already added.")
    onChange([...emails, value])
    setDraft("")
    setError(null)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="invite" className="text-slate-700">Invite your team</Label>
        <div className="flex gap-2">
          <Input
            id="invite"
            type="email"
            placeholder="teammate@yourchurch.org"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                add()
              }
            }}
            className="h-10 rounded-lg bg-white"
          />
          <Button type="button" variant="outline" onClick={add} className="h-10 gap-1 rounded-lg px-3">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
            Add
          </Button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      {emails.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {emails.map((email) => (
            <li
              key={email}
              className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 py-1 pr-1.5 pl-3 text-xs text-emerald-700"
            >
              {email}
              <button
                type="button"
                aria-label={`Remove ${email}`}
                onClick={() => onChange(emails.filter((e) => e !== email))}
                className="rounded-full p-0.5 hover:bg-emerald-100"
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-400">Optional — you can invite people any time from Settings.</p>
      )}
    </div>
  )
}
