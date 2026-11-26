import { z } from "zod"

export const selectPlanSchema = z.object({
  planSlug: z.enum(["starter", "growth", "campus"]),
  organizationId: z.string().min(1).optional(),
})

export type SelectPlanInput = z.infer<typeof selectPlanSchema>

export type SaasPlan = {
  id: string
  slug: string
  name: string
  description: string
  priceMonthlyCents: number
  currencyCode: string
  maxLocations: number
  maxSeats: number
  features: string[]
  isActive: boolean
  sortOrder: number
}

export type TenantSubscription = {
  id: string
  organizationId: string
  planId: string
  status: string
  billingInterval: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  trialEndsAt: string | null
  plan: SaasPlan
  usage: {
    locations: number
    seats: number
  }
}
