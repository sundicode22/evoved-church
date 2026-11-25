import { z } from "zod"

export const DEPARTMENTS = [
  "Executive Leadership",
  "Pastoral Care",
  "Creative Arts",
  "Discipleship",
  "Operations",
  "Kids & Youth",
  "Outreach",
  "Other",
] as const

export const updateNodeParentSchema = z.object({
  parentId: z.string().min(1).nullable(),
  orderIndex: z.number().int().nonnegative().optional(),
})

export const createOrgNodeSchema = z.object({
  title: z.string().min(2, "Role title is required"),
  name: z.string().min(2, "Person name is required"),
  department: z.string().min(2, "Department is required").default("Other"),
  parentId: z.string().min(1).nullable().optional(),
  spanOfCare: z.number().int().nonnegative().default(0),
  campusId: z.string().optional(),
  orderIndex: z.number().int().nonnegative().optional(),
})

export const updateOrgNodeSchema = z.object({
  title: z.string().min(2).optional(),
  name: z.string().min(2).optional(),
  department: z.string().min(2).optional(),
  parentId: z.string().min(1).nullable().optional(),
  spanOfCare: z.number().int().nonnegative().optional(),
  orderIndex: z.number().int().nonnegative().optional(),
})

export type UpdateNodeParentInput = z.infer<typeof updateNodeParentSchema>
export type CreateOrgNodeInput = z.infer<typeof createOrgNodeSchema>
export type UpdateOrgNodeInput = z.infer<typeof updateOrgNodeSchema>

export type OrgNode = {
  id: string
  title: string
  name: string
  department: string | null
  parentId: string | null
  spanOfCare: number
  orderIndex: number
  campusId?: string
}
