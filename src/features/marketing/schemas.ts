import { z } from "zod"

export const demoInterestSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Valid email required"),
  churchName: z.string().trim().min(2, "Church name is required"),
  phone: z.string().trim().optional(),
  interest: z.enum(["demo", "subscribe", "pricing", "migration"]).default("demo"),
  message: z.string().trim().max(2000).optional(),
  locationsCount: z.string().trim().optional(),
})

export type DemoInterestInput = z.infer<typeof demoInterestSchema>
