import { z } from "zod"
import { NOMENCLATURE_PRESETS, type NomenclaturePresetKey } from "@/features/onboarding/presets"

export const ONBOARDING_STEP_FORM_ID = "onboarding-step-form"

const PRESET_KEYS = NOMENCLATURE_PRESETS.map((p) => p.key) as [
  NomenclaturePresetKey,
  ...NomenclaturePresetKey[],
]

export const onboardingFormSchema = z.object({
  churchName: z.string().trim().min(2, "Enter your church name (at least 2 characters)."),
  denomination: z.string().min(1, "Select a denomination."),
  campusName: z.string().trim().min(2, "Enter a location name (at least 2 characters)."),
  city: z.string(),
  slug: z.string().min(2, "URL must be at least 2 characters."),
  preset: z.enum(PRESET_KEYS),
  invites: z.array(z.string().email()),
})

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>

export const ONBOARDING_DEFAULT_VALUES: OnboardingFormValues = {
  churchName: "",
  denomination: "",
  campusName: "",
  city: "",
  slug: "",
  preset: "nondenom",
  invites: [],
}

/** Fields validated when advancing past each step (0–2). Last step submits the form. */
export const ONBOARDING_STEP_FIELDS: (keyof OnboardingFormValues)[][] = [
  ["churchName", "denomination"],
  ["campusName", "city", "slug"],
  ["preset"],
]

export const inviteDraftSchema = z.object({
  email: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Enter a valid email address."
    ),
})

export type InviteDraftValues = z.infer<typeof inviteDraftSchema>

export function orgSlugFrom(name: string, fallback: string) {
  const base = (name || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
  return base || fallback || `church-${Date.now().toString(36)}`
}
