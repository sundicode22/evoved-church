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
import { setOnboardingCompletedCookie } from "@/features/onboarding/cookie"
import { NOMENCLATURE_PRESETS } from "@/features/onboarding/presets"
import { authClient } from "@/features/auth/auth-client"
import { apiClient } from "@/lib/axios"
import { useBranchStore } from "@/store/use-branch-store"

function orgSlugFrom(name: string, fallback: string) {
  const base = (name || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
  return base || fallback || `church-${Date.now().toString(36)}`
}

const STEPS = ["Church", "Location", "Terminology", "Team"]

const STEP_COPY: { title: string; description: string }[] = [
  { title: "Tell us about your church", description: "This personalizes your workspace." },
  { title: "Set up your first location", description: "Every church starts with one location." },
  { title: "Choose your terminology", description: "Evolve speaks your church's language." },
  { title: "Invite your team", description: "Bring your leaders on board." },
]

type CampusPayload = {
  id: string
  name: string
  slug: string
  type: "main" | "regional" | "satellite" | "church_plant" | "online"
  city: string
  isMainCampus: boolean
}

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
  const [checking, setChecking] = React.useState(true)

  const isLastStep = step === STEPS.length - 1

  // If this account already finished setup, sync the gate cookie and skip the wizard.
  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const status = await apiClient.get<{
          success: boolean
          data: { completed: boolean }
        }>("/settings/onboarding")
        if (cancelled) return
        if (status.data.data?.completed) {
          setOnboardingCompletedCookie()
          router.replace("/dashboard")
          return
        }
      } catch {
        /* show wizard */
      }
      if (!cancelled) setChecking(false)
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  async function resolveCampus(): Promise<CampusPayload | null> {
    try {
      const campusRes = await apiClient.post<{ success: boolean; data: CampusPayload }>(
        "/campuses",
        {
          name: campus.campusName.trim(),
          slug: campus.slug.trim(),
          city: campus.city.trim(),
          type: "main",
        }
      )
      return campusRes.data.data ?? null
    } catch {
      // Prior attempt may have already created the location — reuse it.
      const listed = await apiClient
        .get<{ success: boolean; data: CampusPayload[] }>("/campuses")
        .catch(() => null)
      const rows = listed?.data.data ?? []
      return rows.find((c) => c.slug === campus.slug.trim()) ?? rows[0] ?? null
    }
  }

  async function finish() {
    setPending(true)
    try {
      const churchName = church.churchName.trim()
      const locationSlug = campus.slug.trim() || orgSlugFrom(campus.campusName, "main")
      const organizationSlug = orgSlugFrom(churchName, locationSlug)

      // Organization = tenant. Location workspace is created under it.
      let organizationId: string | null = null
      try {
        const createdOrg = await authClient.organization.create({
          name: churchName || "My Church",
          slug: organizationSlug,
        })
        organizationId =
          (createdOrg.data as { id?: string } | null | undefined)?.id ??
          (createdOrg as { data?: { id?: string } }).data?.id ??
          null
        if (organizationId) {
          await authClient.organization.setActive({ organizationId })
        }
      } catch {
        /* org may already exist — keep going with session tenant */
      }

      const selected = NOMENCLATURE_PRESETS.find((p) => p.key === terminology.preset)
      const tenantParams = organizationId ? { tenantId: organizationId } : undefined
      await apiClient.patch(
        "/settings/nomenclature",
        {
          churchName,
          campusTermSingular: "Location",
          campusTermPlural: "Locations",
          ...selected?.terms,
        },
        { params: tenantParams }
      )

      const created = await resolveCampus()
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
      }

      // Starter plan for this tenant (locations/seats gated by billing)
      await apiClient
        .post("/billing/subscription", { planSlug: "starter" })
        .catch(() => null)

      if (invites.length > 0) {
        await apiClient.post("/settings/invites", { emails: invites }).catch(() => null)
        toast.success(
          `Workspace ready · ${invites.length} invite${invites.length === 1 ? "" : "s"} queued`
        )
      } else {
        toast.success("Church workspace ready")
      }

      await apiClient.post("/settings/onboarding/complete", null, { params: tenantParams })
      setOnboardingCompletedCookie()

      router.replace("/dashboard")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not finish setup. Please try again."
      )
      setPending(false)
    }
  }

  const copy = STEP_COPY[step]

  if (checking) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#fbfcfb] px-4 py-10 font-sans">
        <BrandMark />
        <p className="mt-6 text-sm text-zinc-500">Checking your workspace…</p>
      </main>
    )
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#fbfcfb] px-4 py-10 font-sans">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(100,149,237,0.12),_transparent_55%)]"
      />
      <div className="relative z-10 flex w-full max-w-xl flex-col items-center gap-8">
        <BrandMark />
        <WizardStepper steps={STEPS} current={step} />
        <Card className="w-full gap-0 rounded-2xl border border-zinc-200/60 bg-white py-0 shadow-xs ring-0">
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
                variant="default"
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
