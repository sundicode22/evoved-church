"use client"

import * as React from "react"
import { CreditCard, Mail, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { apiClient } from "@/lib/axios"

type IntegrationCard = {
  id: "stripe" | "resend" | "twilio"
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const CARDS: IntegrationCard[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Connect Stripe for secure online donations and recurring gifts.",
    icon: CreditCard,
  },
  {
    id: "resend",
    name: "Resend",
    description: "Church email for drips, alerts, and campaigns. Email only.",
    icon: Mail,
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "SMS for campaigns and reminders. Separate from Resend.",
    icon: MessageSquare,
  },
]

export function IntegrationsTab({ canEdit }: { canEdit: boolean }) {
  const [sheet, setSheet] = React.useState<"stripe" | "resend" | "twilio" | null>(null)
  const [stripeConnected, setStripeConnected] = React.useState(false)
  const [pk, setPk] = React.useState("")
  const [sk, setSk] = React.useState("")
  const [resendKey, setResendKey] = React.useState("")
  const [fromEmail, setFromEmail] = React.useState("")
  const [twilioSid, setTwilioSid] = React.useState("")
  const [twilioToken, setTwilioToken] = React.useState("")
  const [twilioFrom, setTwilioFrom] = React.useState("")

  async function connectStripe() {
    try {
      await apiClient.post("/portal/main/activate-giving")
      setStripeConnected(true)
      toast.success("Stripe connected (demo) — online giving enabled on portal")
      setSheet(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not connect Stripe")
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-base text-zinc-700">
        Connect Stripe for giving, Resend for email, and Twilio for SMS.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CARDS.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.id}
              className="flex flex-col rounded-lg border bg-white p-5 shadow-xs"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
                <Icon className="size-5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">{card.name}</h3>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-zinc-600">{card.description}</p>
              <div className="mt-4">
                {card.id === "stripe" ? (
                  <Button
                    disabled={!canEdit}
                    onClick={() => setSheet("stripe")}
                    className="h-9 w-full rounded-lg bg-accent-cta text-sm text-white hover:bg-accent-cta-hover"
                  >
                    {stripeConnected ? "Manage Stripe" : "Connect your account"}
                  </Button>
                ) : (
                  <Button
                    disabled={!canEdit}
                    variant="outline"
                    onClick={() => setSheet(card.id)}
                    className="h-9 w-full rounded-lg text-sm"
                  >
                    Configure
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Sheet open={sheet === "stripe"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side="right" inset size="sm" className="p-0">
          <SheetHeader>
            <SheetTitle>Connect Stripe</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Publishable key</FieldLabel>
                <Input value={pk} onChange={(e) => setPk(e.target.value)} placeholder="pk_live_…" />
              </Field>
              <Field>
                <FieldLabel>Secret key</FieldLabel>
                <Input
                  type="password"
                  value={sk}
                  onChange={(e) => setSk(e.target.value)}
                  placeholder="sk_live_…"
                />
              </Field>
              <p className="text-xs text-zinc-500">
                Keys stay local in this demo. Connect marks online giving active on your portal.
              </p>
            </FieldGroup>
          </SheetBody>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheet(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => void connectStripe()}
            >
              Connect your account
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "resend"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side="right" inset size="sm" className="p-0">
          <SheetHeader>
            <SheetTitle>Configure Resend</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>API key</FieldLabel>
                <Input
                  type="password"
                  value={resendKey}
                  onChange={(e) => setResendKey(e.target.value)}
                  placeholder="re_…"
                />
              </Field>
              <Field>
                <FieldLabel>From email</FieldLabel>
                <Input
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="hello@yourchurch.org"
                />
              </Field>
            </FieldGroup>
          </SheetBody>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheet(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Resend settings saved locally (demo)")
                setSheet(null)
              }}
            >
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "twilio"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side="right" inset size="sm" className="p-0">
          <SheetHeader>
            <SheetTitle>Configure Twilio</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Account SID</FieldLabel>
                <Input value={twilioSid} onChange={(e) => setTwilioSid(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>Auth token</FieldLabel>
                <Input
                  type="password"
                  value={twilioToken}
                  onChange={(e) => setTwilioToken(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>From number</FieldLabel>
                <Input
                  value={twilioFrom}
                  onChange={(e) => setTwilioFrom(e.target.value)}
                  placeholder="+15551234567"
                />
              </Field>
            </FieldGroup>
          </SheetBody>
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheet(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Twilio settings saved locally (demo)")
                setSheet(null)
              }}
            >
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
