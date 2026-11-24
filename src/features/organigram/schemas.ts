import { z } from "zod"

export const updateNodeParentSchema = z.object({
  parentId: z.string().min(1).nullable(),
  orderIndex: z.number().int().nonnegative().optional(),
})

export type UpdateNodeParentInput = z.infer<typeof updateNodeParentSchema>
