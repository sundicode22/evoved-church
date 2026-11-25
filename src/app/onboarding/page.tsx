"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BrandMark } from "@/features/auth/components/brand-mark"
import { CampusStep, type CampusStepValues } from "@/features/onboarding/components/campus-step"
import {
  ChurchStep,
  ONBOARDING_STEP_FORM_ID,
  type ChurchStepValues,
} from "@/features/onboarding/components/church-step"
import { InviteStep } from "@/features/onboarding/components/invite-step"
import {
  TerminologyStep,
  type TerminologyStepValues,
} from "@/features/onboarding/components/terminology-step"
import { WizardStepper } from "@/features/onboarding/components/wizard-stepper"
import { NOMENCLATURE_PRESETS } from "@/features/onboarding/presets"
import { apiClient } from "@/lib/axios"
import { useBranchStore } from "@/store/use-branch-store"

const STEPS = ["Church", "Location", "Terminology", "Team"]

const STEP_COPY: { title: string; description: string }[] = [
  { title: "Tell us about your church", description: "This personalizes your workspace." },
  { title: "Set up your first location", description: "Every church starts with one location." },
  { title: "Choose your terminology", description: "Evolve speaks your church's language." },
  { title: "Invite your team", description: "Bring your leaders on board." },
]

const ONBOARDING_COOKIE = "evolve_onboarding_completed"

export default function OnboardingPage() {
  const router = useRouter()
  const setAvailableCampuses = useBranchStore((s) => s.setAvailableCampuses)
  const setActiveCampus = useBranchStore((s) => s.setActiveCampus)

  const [step, setStep] = React.useState(0)
  const [church, setChurch] = React.useState<ChurchStepValues>({ churchName: "", denomination: "" })
  const [campus, setCampus] = React.useState<CampusStepValues>({ campusName: "", city: "", slug: "" })
  const [terminology, setTerminology] = React.useState<TerminologyStepValues>({ preset: "nondenom" })
  const [invites, setInvites] = React.useState<string[]>([])
  const [pending, setPending] = React.useState(false)

  const isLastStep = step === STEPS.length - 1

  async function finish() {
    setPending(true)
    try {
      const selected = NOMENCLATURE_PRESETS.find((p) => p.key === terminology.preset)
      await apiClient.patch("/settings/nomenclature", {
        churchName: church.churchName.trim(),
        campusTermSingular: "Location",
        campusTermPlural: "Locations",
        ...selected?.terms,
      })

      const campusRes = await apiClient.post<{
        success: boolean
        data: {
          id: string
          name: string
          slug: string
          type: "main" | "regional" | "satellite" | "church_plant" | "online"
          city: string
          isMainCampus: boolean
        }
      }>("/campuses", {
        name: campus.campusName.trim(),
        slug: campus.slug.trim(),
        city: campus.city.trim(),
        type: "main",
      })

      const created = campusRes.data.data
      if (created) {
        const normalized = {
          id: created.id,
          name: created.name,
          slug: created.slug,
          type: created.type,
          city: created.city || campus.city.trim() || "",
          isMainCampus: true,
        }
        setAvailableCampuses([normalized])
        setActiveCampus(normalized)

        // Campus create provisions this location’s General Fund + starter COA
      }

      if (invites.length > 0) {
        await apiClient.post("/settings/invites", { emails: invites }).catch(() => null)
        toast.success(
          `Workspace ready · ${invites.length} invite${invites.length === 1 ? "" : "s"} queued`
        )
      } else {
        toast.success("Church workspace ready")
      }

      await apiClient.post("/settings/onboarding/complete").catch(() => null)
      document.cookie = `${ONBOARDING_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`

      router.replace("/dashboard")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not finish setup. Please try again."
      )
      setPending(false)
    }
  }

  const copy = STEP_COPY[step]

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#fbfcfb] px-4 py-10 font-sans">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(22,163,74,0.08),_transparent_55%)]"
      />
      <div className="relative z-10 flex w-full max-w-xl flex-col items-center gap-8">
        <BrandMark />
        <WizardStepper steps={STEPS} current={step} />
        <Card className="w-full rounded-2xl border border-zinc-200/70 bg-white shadow-xs">
          <CardHeader className="space-y-2 px-6 pt-6 pb-2 sm:px-8">
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              {copy.title}
            </CardTitle>
            <CardDescription className="text-base text-zinc-600">{copy.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-7 px-6 pb-6 sm:px-8">
            {step === 0 && (
              <ChurchStep
                defaultValues={church}
                onContinue={(values) => {
                  setChurch(values)
                  setStep(1)
                }}
              />
            )}
            {step === 1 && (
              <CampusStep
                defaultValues={campus}
                onContinue={(values) => {
                  setCampus(values)
                  setStep(2)
                }}
              />
            )}
            {step === 2 && (
              <TerminologyStep
                defaultValues={terminology}
                onContinue={(values) => {
                  setTerminology(values)
                  setStep(3)
                }}
              />
            )}
            {step === 3 && <InviteStep emails={invites} onChange={setInvites} />}

            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="ghost"
                disabled={step === 0 || pending}
                onClick={() => setStep(step - 1)}
                className="h-10 gap-1 rounded-lg px-3 text-sm font-medium text-zinc-600"
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>
              <Button
                {...(isLastStep
                  ? { type: "button" as const, onClick: () => void finish() }
                  : { type: "submit" as const, form: ONBOARDING_STEP_FORM_ID })}
                variant={isLastStep ? "accent" : "default"}
                disabled={pending}
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
