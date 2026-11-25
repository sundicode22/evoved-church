import { z } from "zod"

export const BLOG_STATUSES = ["draft", "published", "archived"] as const
export type BlogStatus = (typeof BLOG_STATUSES)[number]

export const createBlogPostSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2).optional(),
  excerpt: z.string().max(400).optional().or(z.literal("")),
  coverImageUrl: z
    .string()
    .refine(
      (v) =>
        !v ||
        v.startsWith("data:image/") ||
        /^https?:\/\//i.test(v) ||
        v.startsWith("/"),
      "Cover image must be a valid URL or upload"
    )
    .optional()
    .or(z.literal("")),
  bodyHtml: z.string().min(1, "Body is required"),
  authorName: z.string().max(150).optional().or(z.literal("")),
  status: z.enum(BLOG_STATUSES).default("draft"),
  campusId: z.string().optional(),
})

export const updateBlogPostSchema = createBlogPostSchema.partial()

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>

export type BlogPost = {
  id: string
  campusId: string
  title: string
  slug: string
  excerpt: string
  coverImageUrl: string | null
  bodyHtml: string
  authorName: string
  status: BlogStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type PortalBlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImageUrl: string | null
  authorName: string
  publishedAt: string | null
}
