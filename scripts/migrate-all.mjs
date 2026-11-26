#!/usr/bin/env node
/**
 * Apply every drizzle/*.sql migration in order (idempotent).
 * Tracks applied files in public.__evolve_migrations.
 */
import pg from "pg"
import fs from "fs"
import path from "path"
import dns from "dns"
import { promisify } from "util"
import { config } from "dotenv"

config()
dns.setDefaultResultOrder("ipv4first")

const lookup = promisify(dns.lookup)
const IGNORE = new Set(["42P07", "42710", "42701", "42P16", "23505", "42723"])

function ignorable(err) {
  if (IGNORE.has(err?.code)) return true
  const msg = String(err?.message || "")
  return /already exists/i.test(msg) || /duplicate key/i.test(msg)
}

const raw = process.env.DATABASE_URL
if (!raw) {
  console.error("DATABASE_URL is required")
  process.exit(1)
}

const u = new URL(raw)
u.searchParams.delete("channel_binding")
u.searchParams.set("sslmode", "require")

const { address } = await lookup(u.hostname, { family: 4 })
console.log(`host: ${u.hostname} -> ${address}`)

const client = new pg.Client({
  host: address,
  port: Number(u.port || 5432),
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  database: u.pathname.replace(/^\//, "") || "neondb",
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 60_000,
})

await client.connect()
console.log("connected")

await client.query(`
  CREATE TABLE IF NOT EXISTS "__evolve_migrations" (
    id text PRIMARY KEY,
    applied_at timestamp DEFAULT now() NOT NULL
  )
`)

const files = fs
  .readdirSync("drizzle")
  .filter((f) => f.endsWith(".sql"))
  .sort()

for (const file of files) {
  const id = file.replace(/\.sql$/, "")
  const already = await client.query(`SELECT 1 FROM "__evolve_migrations" WHERE id = $1`, [id])
  if (already.rowCount > 0) {
    console.log(`skip ${file}`)
    continue
  }

  const sqlText = fs.readFileSync(path.join("drizzle", file), "utf8")
  const parts = sqlText
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean)

  console.log(`apply ${file} (${parts.length} chunks)`)
  for (let i = 0; i < parts.length; i++) {
    try {
      await client.query(parts[i])
    } catch (err) {
      if (ignorable(err)) {
        console.log(`  warn[${i}] ${err.code || ""} ${String(err.message).split("\n")[0]}`)
        continue
      }
      console.error(`  FAIL[${i}] ${err.code || ""} ${err.message}`)
      await client.end()
      process.exit(1)
    }
  }

  await client.query(
    `INSERT INTO "__evolve_migrations" (id) VALUES ($1) ON CONFLICT DO NOTHING`,
    [id]
  )
  console.log(`  ok ${file}`)
}

const { rows } = await client.query(
  `SELECT id, applied_at FROM "__evolve_migrations" ORDER BY id`
)
console.log("\nApplied migrations:")
for (const r of rows) {
  console.log(`  ${r.id} @ ${r.applied_at?.toISOString?.() || r.applied_at}`)
}

await client.end()
console.log("\nAll migrations complete.")
