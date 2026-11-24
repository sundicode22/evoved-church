import { z } from "zod"

export const createRoleSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9_]+$/).optional(),
  description: z.string().optional(),
  permissionKeys: z.array(z.string()).default([]),
})

export const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  isAdmin: z.boolean().optional(),
})

export const setRolePermissionsSchema = z.object({
  permissionKeys: z.array(z.string()),
})

export const assignUserRoleSchema = z.object({
  roleId: z.string().min(1),
  campusId: z.string().uuid().optional(),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
