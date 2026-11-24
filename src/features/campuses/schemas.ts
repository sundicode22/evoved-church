import { z } from "zod"

export const createCampusSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  city: z.string().optional().default(""),
  type: z
    .enum(["main", "regional", "satellite", "church_plant", "online"])
    .default("main"),
})

export type CreateCampusInput = z.infer<typeof createCampusSchema>
