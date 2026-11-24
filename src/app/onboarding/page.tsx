"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BrandMark } from "@/features/auth/components/brand-mark"
import { CampusStep } from "@/features/onboarding/components/campus-step"
import { ChurchStep } from "@/features/onboarding/components/church-step"
import { InviteStep } from "@/features/onboarding/components/invite-step"
import { TerminologyStep } from "@/features/onboarding/components/terminology-step"
import { WizardStepper } from "@/features/onboarding/components/wizard-stepper"
import { NOMENCLATURE_PRESETS, type NomenclaturePresetKey } from "@/features/onboarding/presets"
import { apiClient } from "@/lib/axios"

const STEPS = ["Church", "Campus", "Terminology", "Team"]

const STEP_COPY: { title: string; description: string }[] = [
  { title: "Tell us about your church", description: "This personalizes your workspace." },
  { title: "Set up your first campus", description: "Every church starts with one location." },
  { title: "Choose your terminology", description: "Evolve speaks your church's language." },
  { title: "Invite your team", description: "Bring your leaders on board." },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = React.useState(0)
  const [churchName, setChurchName] = React.useState("")
  const [denomination, setDenomination] = React.useState("")
  const [campusName, setCampusName] = React.useState("")
  const [city, setCity] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [preset, setPreset] = React.useState<NomenclaturePresetKey>("nondenom")
  const [invites, setInvites] = React.useState<string[]>([])
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const canContinue =
    (step === 0 && churchName.trim().length >= 2 && denomination !== "") ||
    (step === 1 && campusName.trim().length >= 2 && slug.length >= 2) ||
    step === 2 ||
    step === 3

  async function finish() {
    setPending(true)
    setError(null)
    try {
      const selected = NOMENCLATURE_PRESETS.find((p) => p.key === preset)
      await apiClient.patch("/settings/nomenclature", {
        churchName: churchName.trim(),
        ...selected?.terms,
      })
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not finish setup. Please try again.")
      setPending(false)
    }
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1)
    else void finish()
  }

  const copy = STEP_COPY[step]

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-white px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-emerald-50/70 to-transparent"
      />
      <div className="relative z-10 flex w-full max-w-xl flex-col gap-8">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <WizardStepper steps={STEPS} current={step} />
        <Card className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">{copy.title}</CardTitle>
            <CardDescription className="text-sm text-zinc-500">{copy.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 0 && (
              <ChurchStep
                churchName={churchName}
                denomination={denomination}
                onChange={(p) => {
                  if (p.churchName !== undefined) setChurchName(p.churchName)
                  if (p.denomination !== undefined) setDenomination(p.denomination)
                }}
              />
            )}
            {step === 1 && (
              <CampusStep
                campusName={campusName}
                city={city}
                slug={slug}
                onChange={(p) => {
                  if (p.campusName !== undefined) setCampusName(p.campusName)
                  if (p.city !== undefined) setCity(p.city)
                  if (p.slug !== undefined) setSlug(p.slug)
                }}
              />
            )}
            {step === 2 && <TerminologyStep value={preset} onChange={setPreset} />}
            {step === 3 && <InviteStep emails={invites} onChange={setInvites} />}

            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                disabled={step === 0 || pending}
                onClick={() => setStep(step - 1)}
                className="h-10 gap-1 rounded-lg px-3 text-sm text-zinc-600"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
                Back
              </Button>
              <Button
                type="button"
                disabled={!canContinue || pending}
                onClick={next}
                className="h-10 gap-1 rounded-lg bg-[#16a34a] px-5 text-sm text-white shadow-sm hover:bg-[#15803d]"
              >
                {step === STEPS.length - 1 ? (pending ? "Finishing…" : "Finish setup") : "Continue"}
                {step < STEPS.length - 1 && (
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
