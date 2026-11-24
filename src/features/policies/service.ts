import { NotFoundError, ValidationError } from "@/lib/errors"
import {
  createPolicySchema,
  updatePolicySchema,
  type ChurchPolicy,
  type CreatePolicyInput,
  type UpdatePolicyInput,
} from "./schemas"
import type { z } from "zod"

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()

const store: ChurchPolicy[] = [
  {
    id: "pol-demo-1",
    title: "Expense Requisition & Multi-Tier Approval",
    module: "accounting",
    summary:
      "How staff request spending, encumber funds, and advance through pastoral approval tiers.",
    bodyHtml: `<h2>Purpose</h2><p>Protect church funds with transparent requisitions and recorded approvals.</p><h2>Rules</h2><ul><li>Every expense needs a fund, COA account, vendor, and purpose.</li><li>Amounts over available (unencumbered) balance are blocked.</li><li>Approve / reject decisions store the actor and tier.</li><li>Journal posting is never silent — creator and poster are always recorded.</li></ul>`,
    involvedRoles: ["Finance Director", "Treasurer", "Campus Pastor"],
    status: "published",
    version: 2,
    updatedByName: "Finance Director",
    createdAt: daysAgo(40),
    updatedAt: daysAgo(3),
    publishedAt: daysAgo(3),
  },
  {
    id: "pol-demo-2",
    title: "Child Safety & Background Checks",
    module: "safety",
    summary: "Who must be screened before serving with minors.",
    bodyHtml: `<h2>Scope</h2><p>Applies to volunteers and staff working with children or youth.</p><ul><li>Background check status is tracked on the member record.</li><li>Expired checks block assignment to children's ministry.</li></ul>`,
    involvedRoles: ["Children's Ministry", "Volunteer", "Executive Pastor"],
    status: "published",
    version: 1,
    updatedByName: "Executive Pastor",
    createdAt: daysAgo(90),
    updatedAt: daysAgo(20),
    publishedAt: daysAgo(20),
  },
  {
    id: "pol-demo-3",
    title: "Visitor Follow-up Cadence",
    module: "visitors",
    summary: "Expected outreach timeline from first visit to group integration.",
    bodyHtml: `<p>Welcome call within 48 hours. Pastoral visit within two weeks when appropriate. Foundations class invitation after second visit.</p>`,
    involvedRoles: ["Connections Lead", "Pastor"],
    status: "draft",
    version: 1,
    updatedByName: "Connections Lead",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
    publishedAt: null,
  },
]

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
