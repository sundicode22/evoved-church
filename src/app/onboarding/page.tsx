"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { BrandMark } from "@/features/auth/components/brand-mark"
import { CampusStep } from "@/features/onboarding/components/campus-step"
import { ChurchStep } from "@/features/onboarding/components/church-step"
import { InviteStep } from "@/features/onboarding/components/invite-step"
import { TerminologyStep } from "@/features/onboarding/components/terminology-step"
import { WizardStepper } from "@/features/onboarding/components/wizard-stepper"
import {
  useCompleteOnboarding,
  useOnboardingStatus,
} from "@/features/onboarding/hooks/use-onboarding"
import { setOnboardingCompletedCookie } from "@/features/onboarding/cookie"
import {
  ONBOARDING_DEFAULT_VALUES,
  ONBOARDING_STEP_FIELDS,
  ONBOARDING_STEP_FORM_ID,
  onboardingFormSchema,
  type OnboardingFormValues,
} from "@/features/onboarding/schemas"

const STEPS = ["Church", "Location", "Terminology", "Team"]

const STEP_COPY: { title: string; description: string }[] = [
  { title: "Tell us about your church", description: "This personalizes your workspace." },
  { title: "Set up your first location", description: "Every church starts with one location." },
  { title: "Choose your terminology", description: "Evolve speaks your church's language." },
  { title: "Invite your team", description: "Bring your leaders on board." },
]

export default function OnboardingPage() {
  return (
    <React.Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
          Checking your workspace…
        </main>
      }
    >
      <OnboardingWizard />
    </React.Suspense>
  )
}

function OnboardingWizard() {
  const router = useRouter()
  const creatingAnother = useSearchParams().get("new") === "1"
  const [step, setStep] = React.useState(0)
  const status = useOnboardingStatus()
  const complete = useCompleteOnboarding()

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: ONBOARDING_DEFAULT_VALUES,
    mode: "onSubmit",
  })

  const isLastStep = step === STEPS.length - 1
  const pending = complete.isPending

  React.useEffect(() => {
    if (creatingAnother) return
    if (!status.isSuccess || !status.data?.completed) return
    setOnboardingCompletedCookie()
    router.replace("/dashboard")
  }, [creatingAnother, status.isSuccess, status.data?.completed, router])

  async function onContinue() {
    const fields = ONBOARDING_STEP_FIELDS[step]
    if (fields?.length) {
      const valid = await form.trigger(fields)
      if (!valid) return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function onFinish(values: OnboardingFormValues) {
    complete.mutate(values)
  }

  const copy = STEP_COPY[step]

  if (!creatingAnother && (status.isLoading || status.data?.completed)) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 font-sans">
        <BrandMark />
        <p className="mt-6 text-sm text-muted-foreground">Checking your workspace…</p>
      </main>
    )
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 font-sans">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(100,149,237,0.12),_transparent_55%)]"
      />
      <div className="relative z-10 flex w-full max-w-xl flex-col items-center gap-8">
        <BrandMark />
        <WizardStepper steps={STEPS} current={step} />
        <Card className="w-full gap-0 rounded-2xl border border-border/60 bg-card py-0 shadow-xs ring-0">
          <CardHeader className="space-y-2 px-6 pt-6 pb-2 sm:px-8">
            <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
              {copy.title}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {copy.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-7 px-6 pb-6 sm:px-8">
            <Form {...form}>
              <form
                id={ONBOARDING_STEP_FORM_ID}
                noValidate
                onSubmit={(e) => {
                  e.preventDefault()
                  if (isLastStep) {
                    void form.handleSubmit(onFinish)()
                    return
                  }
                  void onContinue()
                }}
              >
                {step === 0 && <ChurchStep />}
                {step === 1 && <CampusStep />}
                {step === 2 && <TerminologyStep />}
                {step === 3 && <InviteStep />}
              </form>
            </Form>

            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="ghost"
                disabled={step === 0 || pending}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="h-10 gap-1 rounded-lg px-3 text-sm font-medium text-muted-foreground"
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>
              <Button
                type={isLastStep ? "submit" : "button"}
                form={isLastStep ? ONBOARDING_STEP_FORM_ID : undefined}
                variant="default"
                disabled={pending}
                onClick={isLastStep ? undefined : () => void onContinue()}
                className="h-10 gap-1 px-5 text-sm font-medium"
              >
                {isLastStep ? (pending ? "Finishing…" : "Finish setup") : "Continue"}
                {!isLastStep && <ChevronRight className="size-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
