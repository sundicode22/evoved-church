/**
 * First-release API/domain smoke (no HTTP server required).
 * Run: bun scripts/smoke-first-release.ts
 */
import { churchServicesService } from "../src/features/services/service"
import { calendarService } from "../src/features/calendar/service"
import { importService } from "../src/features/import/service"
import { campaignService } from "../src/features/campaigns/service"
import { policiesService } from "../src/features/policies/service"
import { accountingService } from "../src/features/accounting/service"

const results: { name: string; ok: boolean; detail?: string }[] = []

async function check(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push({ name, ok: true })
    console.log(`PASS  ${name}`)
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e)
    results.push({ name, ok: false, detail })
    console.error(`FAIL  ${name}: ${detail}`)
  }
}

await check("services.list", async () => {
  const list = await churchServicesService.list()
  if (list.length < 1) throw new Error("expected seeded services")
  if (!list.some((s) => s.type !== "sunday_worship")) {
    throw new Error("expected non-Sunday service types")
  }
})

await check("services.create midweek", async () => {
  const s = await churchServicesService.create({
    name: "Smoke Midweek",
    type: "midweek",
    recurrence: "weekly",
    defaultDayOfWeek: 2,
    defaultStartTime: "19:00",
  })
  if (!s.id) throw new Error("missing id")
})

await check("calendar.occurrences", async () => {
  const occ = await calendarService.listOccurrences()
  if (occ.length < 1) throw new Error("expected seeded occurrences")
  if (!occ[0].assignees) throw new Error("assignees missing")
})

await check("calendar.create with assignee", async () => {
  const p = await calendarService.createProgram({
    title: "Smoke Outreach",
    type: "outreach",
  })
  const o = await calendarService.createOccurrence({
    programId: p.id,
    startsAt: new Date().toISOString(),
    allDay: false,
    status: "scheduled",
    assignees: [{ displayName: "Smoke Lead", roleLabel: "lead" }],
  })
  if (o.assignees.length !== 1) throw new Error("assignee not saved")
})

await check("import.members dry_run", async () => {
  const r = await importService.importMembers({
    mode: "dry_run",
    rows: [
      {
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.org",
        phone: "",
        householdName: "Lovelace",
        householdRole: "head",
      },
      {
        firstName: "",
        lastName: "Bad",
        email: "x",
        phone: "",
        householdName: "",
        householdRole: "",
      },
    ],
  })
  if (r.valid !== 1) throw new Error(`expected 1 valid, got ${r.valid}`)
  if (r.errors.length < 1) throw new Error("expected row errors")
})

await check("import.members apply", async () => {
  const r = await importService.importMembers({
    mode: "apply",
    rows: [
      {
        firstName: "Grace",
        lastName: "Hopper",
        email: "grace@example.org",
        phone: "",
        householdName: "Hopper",
        householdRole: "head",
      },
    ],
  })
  if (r.imported !== 1) throw new Error("apply did not import")
})

await check("import.giving dry_run", async () => {
  const r = await importService.importGiving({
    mode: "dry_run",
    rows: [
      {
        email: "ada@example.org",
        memberName: "Ada Lovelace",
        amount: 25,
        contributionDate: "2024-06-01",
        fundCode: "GEN-100",
        method: "cash",
        reference: "",
      },
    ],
  })
  if (r.valid !== 1) throw new Error("giving dry_run failed")
})

await check("campaigns.list", async () => {
  const list = await campaignService.list()
  if (!Array.isArray(list)) throw new Error("campaigns not array")
})

await check("policies.list", async () => {
  const list = await policiesService.list()
  if (list.length < 1) throw new Error("expected policies")
})

await check("accounting.funds", async () => {
  const funds = await accountingService.getFunds()
  if (!Array.isArray(funds) || funds.length < 1) throw new Error("expected funds")
})

await check("accounting.budgetLines", async () => {
  const lines = await accountingService.listBudgetLines()
  if (!Array.isArray(lines)) throw new Error("budget lines missing")
})

const failed = results.filter((r) => !r.ok)
console.log("\n---")
console.log(`${results.length - failed.length}/${results.length} passed`)
if (failed.length) {
  process.exitCode = 1
}
