"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CreditCard, Mail, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
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
    try {
      await apiClient.post("/portal/main/activate-giving")
      setStripeConnected(true)
      stripeForm.reset()
      toast.success("Stripe connected (demo) — online giving enabled on portal")
      setSheet(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not connect Stripe")
    }
  }

  function saveResend() {
    toast.success("Resend settings saved locally (demo)")
    resendForm.reset()
    setSheet(null)
  }

  function saveTwilio() {
    toast.success("Twilio settings saved locally (demo)")
    twilioForm.reset()
    setSheet(null)
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
                    variant="accent"
                    className="h-9 w-full rounded-lg text-sm"
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
                  <p className="text-xs text-zinc-500">
                    Keys stay local in this demo. Connect marks online giving active on your
                    portal.
                  </p>
                </FieldGroup>
              </Form>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setSheet(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" disabled={stripeForm.formState.isSubmitting}>
                Connect your account
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "resend"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side="right" inset size="sm" className="p-0">
          <form
            onSubmit={resendForm.handleSubmit(saveResend)}
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
              <Button type="submit" variant="accent">Save</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "twilio"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side="right" inset size="sm" className="p-0">
          <form
            onSubmit={twilioForm.handleSubmit(saveTwilio)}
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
              <Button type="submit" variant="accent">Save</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
