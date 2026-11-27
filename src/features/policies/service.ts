import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  createPolicySchema,
  updatePolicySchema,
  type ChurchPolicy,
  type CreatePolicyInput,
  type UpdatePolicyInput,
} from "./schemas"
import type { z } from "zod"

const store: ChurchPolicy[] = []

function find(id: string) {
  const p = store.find((x) => x.id === id)
  if (!p) throw new NotFoundError("Policy", id)
  return p
}

export const policiesService = {
  async list(module?: string): Promise<ChurchPolicy[]> {
    const rows = module ? store.filter((p) => p.module === module) : [...store]
    return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },

  async getById(id: string): Promise<ChurchPolicy> {
    return { ...find(id) }
  },

  async create(input: CreatePolicyInput, userName = "Staff"): Promise<ChurchPolicy> {
    const parsed = createPolicySchema.parse(input) as z.output<typeof createPolicySchema>
    const now = new Date().toISOString()
    const policy: ChurchPolicy = {
      id: `pol-${crypto.randomUUID()}`,
      title: parsed.title,
      module: parsed.module,
      summary: parsed.summary ?? "",
      bodyHtml: parsed.bodyHtml,
      involvedRoles: parsed.involvedRoles ?? [],
      status: parsed.status ?? "draft",
      version: 1,
      updatedByName: userName,
      createdAt: now,
      updatedAt: now,
      publishedAt: parsed.status === "published" ? now : null,
    }
    store.unshift(policy)
    return policy
  },

  async update(id: string, input: UpdatePolicyInput, userName = "Staff"): Promise<ChurchPolicy> {
    const p = find(id)
    const parsed = updatePolicySchema.parse(input)
    if (Object.keys(parsed).length === 0) throw new ValidationError("No changes provided")

    Object.assign(p, {
      ...(parsed.title !== undefined && { title: parsed.title }),
      ...(parsed.module !== undefined && { module: parsed.module }),
      ...(parsed.summary !== undefined && { summary: parsed.summary }),
      ...(parsed.bodyHtml !== undefined && { bodyHtml: parsed.bodyHtml }),
      ...(parsed.involvedRoles !== undefined && { involvedRoles: parsed.involvedRoles }),
      ...(parsed.status !== undefined && { status: parsed.status }),
      version: p.version + 1,
      updatedByName: userName,
      updatedAt: new Date().toISOString(),
    })

    if (parsed.status === "published") p.publishedAt = new Date().toISOString()
    if (parsed.status === "archived" || parsed.status === "draft") {
      /* keep publishedAt history */
    }

    return { ...p }
  },

  async publish(id: string, userName = "Staff"): Promise<ChurchPolicy> {
    return this.update(id, { status: "published" }, userName)
  },

  async archive(id: string, userName = "Staff"): Promise<ChurchPolicy> {
    return this.update(id, { status: "archived" }, userName)
  },

  async remove(id: string): Promise<void> {
    const idx = store.findIndex((p) => p.id === id)
    if (idx < 0) throw new NotFoundError("Policy", id)
    store.splice(idx, 1)
  },
}
