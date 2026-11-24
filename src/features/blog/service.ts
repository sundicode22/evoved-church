import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  type BlogPost,
  type CreateBlogPostInput,
  type UpdateBlogPostInput,
} from "./schemas"

const DEMO_CAMPUS = "campus-demo-main"
const now = () => new Date().toISOString()

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 140)
}

const store: BlogPost[] = []

function find(id: string) {
  const row = store.find((x) => x.id === id)
  if (!row) throw new NotFoundError("Blog post", id)
  return row
}

function uniqueSlug(base: string, excludeId?: string) {
  let slug = slugify(base) || "post"
  let i = 2
  while (store.some((p) => p.slug === slug && p.id !== excludeId)) {
    slug = `${slugify(base)}-${i}`
    i += 1
  }
  return slug
}

export const blogService = {
  async list(): Promise<BlogPost[]> {
    return [...store].sort((a, b) => {
      const da = a.publishedAt || a.updatedAt
      const db = b.publishedAt || b.updatedAt
      return db.localeCompare(da)
    })
  },

  async listPublished(): Promise<BlogPost[]> {
    return (await this.list()).filter((p) => p.status === "published")
  },

  async getById(id: string): Promise<BlogPost> {
    return { ...find(id) }
  },

  async getPublishedBySlug(slug: string): Promise<BlogPost> {
    const row = store.find((p) => p.slug === slug && p.status === "published")
    if (!row) throw new NotFoundError("Blog post", slug)
    return { ...row }
  },

  async create(input: CreateBlogPostInput): Promise<BlogPost> {
    const parsed = createBlogPostSchema.parse(input)
    const ts = now()
    const status = parsed.status ?? "draft"
    const row: BlogPost = {
      id: `blog-${crypto.randomUUID()}`,
      campusId: parsed.campusId || DEMO_CAMPUS,
      title: parsed.title,
      slug: uniqueSlug(parsed.slug || parsed.title),
      excerpt: parsed.excerpt || "",
      coverImageUrl: parsed.coverImageUrl || null,
      bodyHtml: parsed.bodyHtml,
      authorName: parsed.authorName || "Staff",
      status,
      publishedAt: status === "published" ? ts : null,
      createdAt: ts,
      updatedAt: ts,
    }
    store.unshift(row)
    return { ...row }
  },

  async update(id: string, input: UpdateBlogPostInput): Promise<BlogPost> {
    const row = find(id)
    const parsed = updateBlogPostSchema.parse(input)
    if (Object.keys(parsed).length === 0) throw new ValidationError("No changes provided")
    if (parsed.title !== undefined) row.title = parsed.title
    if (parsed.slug !== undefined || parsed.title !== undefined) {
      row.slug = uniqueSlug(parsed.slug || parsed.title || row.title, row.id)
    }
    if (parsed.excerpt !== undefined) row.excerpt = parsed.excerpt || ""
    if (parsed.coverImageUrl !== undefined) {
      row.coverImageUrl = parsed.coverImageUrl || null
    }
    if (parsed.bodyHtml !== undefined) row.bodyHtml = parsed.bodyHtml
    if (parsed.authorName !== undefined) row.authorName = parsed.authorName || "Staff"
    if (parsed.status !== undefined) {
      row.status = parsed.status
      if (parsed.status === "published" && !row.publishedAt) row.publishedAt = now()
    }
    row.updatedAt = now()
    return { ...row }
  },

  async publish(id: string): Promise<BlogPost> {
    const row = find(id)
    if (row.status === "published") throw new ValidationError("Already published")
    row.status = "published"
    row.publishedAt = now()
    row.updatedAt = row.publishedAt
    return { ...row }
  },

  async remove(id: string): Promise<{ ok: true }> {
    const idx = store.findIndex((p) => p.id === id)
    if (idx < 0) throw new NotFoundError("Blog post", id)
    store.splice(idx, 1)
    return { ok: true }
  },
}
