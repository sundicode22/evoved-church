"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { TextFormField } from "@/components/form-fields"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { apiClient } from "@/lib/axios"
import {
  resendIntegrationSchema,
  stripeIntegrationSchema,
  twilioIntegrationSchema,
} from "@/features/settings/schemas"

type StripeValues = z.infer<typeof stripeIntegrationSchema>
type ResendValues = z.infer<typeof resendIntegrationSchema>
type TwilioValues = z.infer<typeof twilioIntegrationSchema>

type IntegrationCard = {
  id: "stripe" | "resend" | "twilio"
  name: string
  description: string
  /** Official Simple Icons CDN marks */
  logoSrc: string
  logoAlt: string
}

const CARDS: IntegrationCard[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Connect Stripe for secure online donations and recurring gifts.",
    logoSrc: "https://cdn.simpleicons.org/stripe/635BFF",
    logoAlt: "Stripe",
  },
  {
    id: "resend",
    name: "Resend",
    description: "Church email for drips, alerts, and campaigns. Email only.",
    logoSrc: "https://cdn.simpleicons.org/resend/000000",
    logoAlt: "Resend",
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "SMS for campaigns and reminders. Separate from Resend.",
    logoSrc: "https://cdn.simpleicons.org/twilio/F22F46",
    logoAlt: "Twilio",
  },
]

export function IntegrationsTab({ canEdit }: { canEdit: boolean }) {
  const [sheet, setSheet] = React.useState<"stripe" | "resend" | "twilio" | null>(null)
  const [stripeConnected, setStripeConnected] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const stripeForm = useForm<StripeValues>({
    resolver: zodResolver(stripeIntegrationSchema),
    defaultValues: { publishableKey: "", secretKey: "" },
  })
  const resendForm = useForm<ResendValues>({
    resolver: zodResolver(resendIntegrationSchema),
    defaultValues: { apiKey: "", fromEmail: "" },
  })
  const twilioForm = useForm<TwilioValues>({
    resolver: zodResolver(twilioIntegrationSchema),
    defaultValues: { accountSid: "", authToken: "", fromNumber: "" },
  })

  async function connectStripe() {
    setSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 400))
      setStripeConnected(true)
      stripeForm.reset()
      toast.success("Stripe connected — online giving enabled")
      setSheet(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not connect Stripe")
    } finally {
      setSaving(false)
    }
  }

  async function saveResend() {
    setSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 400))
      toast.success("Resend settings saved")
      resendForm.reset()
      setSheet(null)
    } finally {
      setSaving(false)
    }
  }

  async function saveTwilio() {
    setSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 400))
      toast.success("Twilio settings saved")
      twilioForm.reset()
      setSheet(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full space-y-6 text-left">
      <p className="max-w-2xl text-sm text-zinc-600">
        Connect Stripe for giving, Resend for email, and Twilio for SMS.
      </p>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CARDS.map((card) => (
          <div
            key={card.id}
            className="flex flex-col rounded-lg border border-border bg-card p-5 text-left shadow-xs"
          >
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-border bg-card p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.logoSrc} alt={card.logoAlt} className="size-6 object-contain" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{card.name}</h3>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-zinc-600">{card.description}</p>
            <div className="mt-4">
              <Button
                disabled={!canEdit}
                onClick={() => setSheet(card.id)}
                variant={card.id === "stripe" ? "primary" : "outline"}
                className="h-9 w-full rounded-lg text-sm"
              >
                {card.id === "stripe"
                  ? stripeConnected
                    ? "Manage Stripe"
                    : "Connect your account"
                  : "Configure"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={sheet === "stripe"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side="right" inset size="sm" className="p-0">
          <form
            onSubmit={stripeForm.handleSubmit(() => void connectStripe())}
            className="flex h-full flex-col"
          >
            <SheetHeader>
              <SheetTitle>Connect Stripe</SheetTitle>
            </SheetHeader>
            <SheetBody>
              <Form {...stripeForm}>
                <FieldGroup className="gap-4">
                  <TextFormField
                    control={stripeForm.control}
                    name="publishableKey"
                    label="Publishable key"
                    placeholder="pk_live_…"
                  />
                  <TextFormField
                    control={stripeForm.control}
                    name="secretKey"
                    label="Secret key"
                    type="password"
                    placeholder="sk_live_…"
                  />
                </FieldGroup>
              </Form>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setSheet(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? (
                  <>
                    <Spinner className="size-3.5" />
                    Connecting…
                  </>
                ) : (
                  "Connect your account"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "resend"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side="right" inset size="sm" className="p-0">
          <form
            onSubmit={resendForm.handleSubmit(() => void saveResend())}
            className="flex h-full flex-col"
          >
            <SheetHeader>
              <SheetTitle>Configure Resend</SheetTitle>
            </SheetHeader>
            <SheetBody>
              <Form {...resendForm}>
                <FieldGroup className="gap-4">
                  <TextFormField
                    control={resendForm.control}
                    name="apiKey"
                    label="API key"
                    type="password"
                    placeholder="re_…"
                  />
                  <TextFormField
                    control={resendForm.control}
                    name="fromEmail"
                    label="From email"
                    type="email"
                    placeholder="hello@yourchurch.org"
                  />
                </FieldGroup>
              </Form>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setSheet(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? (
                  <>
                    <Spinner className="size-3.5" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "twilio"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side="right" inset size="sm" className="p-0">
          <form
            onSubmit={twilioForm.handleSubmit(() => void saveTwilio())}
            className="flex h-full flex-col"
          >
            <SheetHeader>
              <SheetTitle>Configure Twilio</SheetTitle>
            </SheetHeader>
            <SheetBody>
              <Form {...twilioForm}>
                <FieldGroup className="gap-4">
                  <TextFormField
                    control={twilioForm.control}
                    name="accountSid"
                    label="Account SID"
                  />
                  <TextFormField
                    control={twilioForm.control}
                    name="authToken"
                    label="Auth token"
                    type="password"
                  />
                  <TextFormField
                    control={twilioForm.control}
                    name="fromNumber"
                    label="From number"
                    placeholder="+15551234567"
                  />
                </FieldGroup>
              </Form>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setSheet(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? (
                  <>
                    <Spinner className="size-3.5" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
