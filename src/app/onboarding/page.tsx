"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { BrandMark } from "@/features/auth/components/brand-mark"
import { CampusStep } from "@/features/onboarding/components/campus-step"
import { ChurchStep } from "@/features/onboarding/components/church-step"
import { InviteStep } from "@/features/onboarding/components/invite-step"
import { TerminologyStep } from "@/features/onboarding/components/terminology-step"
import { WizardStepper } from "@/features/onboarding/components/wizard-stepper"
import { NOMENCLATURE_PRESETS, type NomenclaturePresetKey } from "@/features/onboarding/presets"
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
  const [churchName, setChurchName] = React.useState("")
  const [denomination, setDenomination] = React.useState("")
  const [campusName, setCampusName] = React.useState("")
  const [city, setCity] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [preset, setPreset] = React.useState<NomenclaturePresetKey>("nondenom")
  const [invites, setInvites] = React.useState<string[]>([])
  const [pending, setPending] = React.useState(false)

  const canContinue =
    (step === 0 && churchName.trim().length >= 2 && denomination !== "") ||
    (step === 1 && campusName.trim().length >= 2 && slug.length >= 2) ||
    step === 2 ||
    step === 3

  async function finish() {
    setPending(true)
    try {
      const selected = NOMENCLATURE_PRESETS.find((p) => p.key === preset)
      await apiClient.patch("/settings/nomenclature", {
        churchName: churchName.trim(),
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
        name: campusName.trim(),
        slug: slug.trim(),
        city: city.trim(),
        type: "main",
      })

      const campus = campusRes.data.data
      if (campus) {
        const normalized = {
          id: campus.id,
          name: campus.name,
          slug: campus.slug,
          type: campus.type,
          city: campus.city || city.trim() || "",
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

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1)
    else void finish()
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
            <FieldGroup>
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
            </FieldGroup>

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
                type="button"
                disabled={!canContinue || pending}
                onClick={next}
                className="h-10 gap-1 rounded-lg bg-accent-cta px-5 text-sm font-medium text-white shadow-xs hover:bg-accent-cta-hover"
              >
                {step === STEPS.length - 1 ? (pending ? "Finishing…" : "Finish setup") : "Continue"}
                {step < STEPS.length - 1 && <ChevronRight className="size-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
