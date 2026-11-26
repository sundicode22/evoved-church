"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/features/auth/auth-client"
import {
  orgSlugFrom,
  type OnboardingFormValues,
} from "@/features/onboarding/schemas"
import { setOnboardingCompletedCookie } from "@/features/onboarding/cookie"
import { NOMENCLATURE_PRESETS } from "@/features/onboarding/presets"
import { apiClient, type ApiResponse } from "@/lib/axios"
import { useBranchStore, type Campus } from "@/store/use-branch-store"

export const ONBOARDING_KEYS = {
  status: ["settings", "onboarding"] as const,
}

type CampusPayload = {
  id: string
  name: string
  slug: string
  type: Campus["type"]
  city: string
  isMainCampus: boolean
}

async function ensureCampus(input: {
  name: string
  slug: string
  city: string
}): Promise<CampusPayload | null> {
  try {
    const campusRes = await apiClient.post<ApiResponse<CampusPayload>>("/campuses", {
      name: input.name,
      slug: input.slug,
      city: input.city,
      type: "main",
    })
    return campusRes.data.data ?? null
  } catch {
    const listed = await apiClient
      .get<ApiResponse<CampusPayload[]>>("/campuses")
      .catch(() => null)
    const rows = listed?.data.data ?? []
    return rows.find((c) => c.slug === input.slug) ?? rows[0] ?? null
  }
}

export function useOnboardingStatus() {
  return useQuery({
    queryKey: ONBOARDING_KEYS.status,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ completed: boolean }>>(
        "/settings/onboarding"
      )
      return res.data.data
    },
    retry: false,
  })
}

export function useCompleteOnboarding() {
  const router = useRouter()
  const setAvailableCampuses = useBranchStore((s) => s.setAvailableCampuses)
  const setActiveCampus = useBranchStore((s) => s.setActiveCampus)

  return useMutation({
    mutationFn: async (values: OnboardingFormValues) => {
      const churchName = values.churchName.trim()
      const locationSlug = values.slug.trim() || orgSlugFrom(values.campusName, "main")
      const organizationSlug = orgSlugFrom(churchName, locationSlug)

      let organizationId: string | null = null
      try {
        const createdOrg = await authClient.organization.create({
          name: churchName || "My Church",
          slug: organizationSlug,
        })
        organizationId =
          (createdOrg.data as { id?: string } | null | undefined)?.id ?? null
        if (organizationId) {
          await authClient.organization.setActive({ organizationId })
        }
      } catch {
        /* org may already exist — continue with session tenant */
      }

      const selected = NOMENCLATURE_PRESETS.find((p) => p.key === values.preset)
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

      const created = await ensureCampus({
        name: values.campusName.trim(),
        slug: locationSlug,
        city: values.city.trim(),
      })

      if (created) {
        const normalized: Campus = {
          id: created.id,
          name: created.name,
          slug: created.slug,
          type: created.type,
          city: created.city || values.city.trim() || "",
          isMainCampus: true,
        }
        setAvailableCampuses([normalized])
        setActiveCampus(normalized)
      }

      await apiClient
        .post("/billing/subscription", { planSlug: "starter" })
        .catch(() => null)

      if (values.invites.length > 0) {
        await apiClient
          .post("/settings/invites", { emails: values.invites })
          .catch(() => null)
      }

      await apiClient.post("/settings/onboarding/complete", null, { params: tenantParams })
      setOnboardingCompletedCookie()

      return { inviteCount: values.invites.length }
    },
    onSuccess: ({ inviteCount }) => {
      if (inviteCount > 0) {
        toast.success(
          `Workspace ready · ${inviteCount} invite${inviteCount === 1 ? "" : "s"} queued`
        )
      } else {
        toast.success("Church workspace ready")
      }
      router.replace("/dashboard")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not finish setup. Please try again.")
    },
  })
}
