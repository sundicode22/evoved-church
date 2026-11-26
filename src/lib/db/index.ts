import dns from "node:dns"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "./schema"

// Prefer IPv4 — Neon AAAA answers often fail with ENETUNREACH on local networks.
dns.setDefaultResultOrder("ipv4first")

const rawUrl =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/evolve_church"

/** node-postgres does not need Neon's channel_binding=require flag. */
function neonFriendlyUrl(url: string) {
  try {
    const parsed = new URL(url)
    parsed.searchParams.delete("channel_binding")
    if (!parsed.searchParams.has("sslmode") && !parsed.hostname.includes("localhost")) {
      parsed.searchParams.set("sslmode", "require")
    }
    return parsed.toString()
  } catch {
    return url
  }
}

const connectionString = neonFriendlyUrl(rawUrl)
const isLocal =
  connectionString.includes("localhost") || connectionString.includes("127.0.0.1")

/** node-postgres pool — Neon pooled host + IPv4-first DNS. */
export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 15_000,
  ssl:
    process.env.DATABASE_SSL === "false"
      ? false
      : isLocal
        ? false
        : { rejectUnauthorized: false },
})

pool.on("error", (err) => {
  console.error("[pg pool]", err.message)
})

export const db = drizzle(pool, { schema })
export * from "./schema"
