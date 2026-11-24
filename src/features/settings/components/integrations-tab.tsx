"use client"

import * as React from "react"
import { Clock, CreditCard } from "lucide-react"
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
  id: string
  name: string
  description: string
  status: "connect" | "coming_soon" | "configure"
}

const CARDS: IntegrationCard[] = [
  {
    id: "paypal",
    name: "PayPal",
    description: "Streamline giving with PayPal checkout on your portal.",
    status: "coming_soon",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Connect Stripe for secure online donations and recurring gifts.",
    status: "connect",
  },
  {
    id: "resend",
    name: "Resend",
    description: "Church email for drips, alerts, and campaigns (email only — not SMS).",
    status: "configure",
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "SMS for campaigns and reminders. Separate from Resend.",
    status: "configure",
  },
  {
    id: "quickbooks",
    name: "Intuit QuickBooks",
    description: "Sync funds and expenses with QuickBooks Online.",
    status: "coming_soon",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Sync audiences for email marketing outside Evolve campaigns.",
    status: "coming_soon",
  },
  {
    id: "checkr",
    name: "Checkr",
    description: "Volunteer background screening for kids and safety ministries.",
    status: "coming_soon",
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
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Integrations</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Enhance Evolve by connecting third-party services to your account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CARDS.map((card) => (
          <div
            key={card.id}
            className="flex flex-col rounded-xl border bg-white p-5 shadow-xs"
          >
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-[#eaf5ea] text-[#1b5e20]">
              <CreditCard className="size-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">{card.name}</h3>
            <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-500">{card.description}</p>
            <div className="mt-4">
              {card.status === "coming_soon" ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
                  <Clock className="size-3.5" />
                  Coming Soon
                </div>
              ) : card.id === "stripe" ? (
                <Button
                  disabled={!canEdit}
                  onClick={() => setSheet("stripe")}
                  className="h-9 w-full rounded-lg bg-[#16a34a] text-xs text-white hover:bg-[#15803d]"
                >
                  {stripeConnected ? "Manage Stripe" : "Connect your account"}
                </Button>
              ) : (
                <Button
                  disabled={!canEdit}
                  variant="outline"
                  onClick={() => setSheet(card.id as "resend" | "twilio")}
                  className="h-9 w-full rounded-lg text-xs"
                >
                  Configure
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border bg-[#fbfcfb] p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-zinc-900">Missing an integration? Let us know</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Tell us which tool you need and we will consider it for a future update.
          </p>
        </div>
        <Button
          className="h-9 shrink-0 rounded-lg bg-[#16a34a] text-xs text-white hover:bg-[#15803d]"
          onClick={() => toast.success("Thanks — request noted (demo)")}
        >
          Request an Integration
        </Button>
      </div>

      <Sheet open={sheet === "stripe"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent className="sm:max-w-md">
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
              className="bg-[#16a34a] text-white hover:bg-[#15803d]"
              onClick={() => void connectStripe()}
            >
              Connect your account
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "resend"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent className="sm:max-w-md">
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
              className="bg-[#16a34a] text-white hover:bg-[#15803d]"
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
        <SheetContent className="sm:max-w-md">
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
              className="bg-[#16a34a] text-white hover:bg-[#15803d]"
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
