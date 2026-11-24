import { z } from "zod"

export const RESOURCE_CATEGORIES = [
  { value: "equipment", label: "Equipment" },
  { value: "supply", label: "Supply" },
  { value: "other", label: "Other" },
] as const

export const createRoomSchema = z.object({
  name: z.string().min(2, "Name is required"),
  campusId: z.string().optional(),
  capacity: z.number().int().min(0).optional(),
  locationNote: z.string().optional(),
  requiresApproval: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export const updateRoomSchema = createRoomSchema.partial()

export const createResourceSchema = z.object({
  name: z.string().min(2, "Name is required"),
  campusId: z.string().optional(),
  category: z.enum(["equipment", "supply", "other"]).default("equipment"),
  description: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  requiresApproval: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export const updateResourceSchema = createResourceSchema.partial()

export type CreateRoomInput = z.infer<typeof createRoomSchema>
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>
export type CreateResourceInput = z.infer<typeof createResourceSchema>
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>

export type Room = {
  id: string
  campusId: string
  name: string
  capacity: number | null
  locationNote: string
  requiresApproval: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Resource = {
  id: string
  campusId: string
  name: string
  category: "equipment" | "supply" | "other"
  description: string
  quantity: number
  requiresApproval: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}
