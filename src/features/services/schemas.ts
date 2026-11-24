import { z } from "zod"

export const SERVICE_TYPES = [
  { value: "sunday_worship", label: "Sunday worship" },
  { value: "midweek", label: "Midweek" },
  { value: "prayer", label: "Prayer" },
  { value: "youth", label: "Youth" },
  { value: "kids", label: "Kids" },
  { value: "special", label: "Special / holiday" },
  { value: "other", label: "Other" },
] as const

export type ServiceType = (typeof SERVICE_TYPES)[number]["value"]

export const serviceTypeSchema = z.enum([
  "sunday_worship",
  "midweek",
  "prayer",
  "youth",
  "kids",
  "special",
  "other",
])

export const serviceSegmentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  leader: z.string().optional(),
  durationMinutes: z.number().int().min(1).max(240).default(10),
  details: z.string().optional(),
  orderIndex: z.number().int().nonnegative().optional(),
})

export const serviceVolunteerSchema = z.object({
  id: z.string().optional(),
  role: z.string().min(2),
  assigneeName: z.string().optional(),
  status: z.enum(["needed", "confirmed", "declined"]).default("needed"),
  orderIndex: z.number().int().nonnegative().optional(),
})

export const createServiceSchema = z.object({
  name: z.string().min(2),
  type: serviceTypeSchema.default("sunday_worship"),
  locationLabel: z.string().optional(),
  defaultDayOfWeek: z.number().int().min(0).max(6).optional(),
  defaultStartTime: z.string().optional(),
  recurrence: z.string().default("weekly"),
  notes: z.string().optional(),
  campusId: z.string().optional(),
  segments: z.array(serviceSegmentSchema).optional(),
  volunteers: z.array(serviceVolunteerSchema).optional(),
})

export const updateServiceSchema = createServiceSchema.partial()

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>

export type ChurchService = {
  id: string
  name: string
  type: ServiceType
  locationLabel: string
  defaultDayOfWeek: number | null
  defaultStartTime: string
  recurrence: string
  isActive: boolean
  notes: string
  segments: {
    id: string
    title: string
    leader: string
    durationMinutes: number
    details: string
    orderIndex: number
  }[]
  volunteers: {
    id: string
    role: string
    assigneeName: string
    status: "needed" | "confirmed" | "declined"
    orderIndex: number
  }[]
  createdAt: string
  updatedAt: string
}

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const
