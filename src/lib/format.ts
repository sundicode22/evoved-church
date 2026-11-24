/** Shared display helpers for dashboard tables. */

export function formatMoney(n: number, currency = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0)
}

export function formatDate(iso?: string | Date | null) {
  if (!iso) return "—"
  const d = typeof iso === "string" ? new Date(iso) : iso
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatCompact(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Number(n) || 0)
}
