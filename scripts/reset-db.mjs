#!/usr/bin/env node
/**
 * Wipe all application data and re-apply migrations.
 * Usage: node scripts/reset-db.mjs
 */
import pg from "pg"
import dns from "dns"
import { spawn } from "child_process"
import { config } from "dotenv"

config()
dns.setDefaultResultOrder("ipv4first")

const raw = process.env.DATABASE_URL
if (!raw) {
  console.error("DATABASE_URL is required")
  process.exit(1)
}

const u = new URL(raw)
u.searchParams.delete("channel_binding")
u.searchParams.delete("options")
u.searchParams.set("sslmode", "require")
u.searchParams.set("uselibpqcompat", "true")

console.log(`resetting database on ${u.hostname}`)

const client = new pg.Client({
  connectionString: u.toString(),
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 60_000,
})

await client.connect()

await client.query("DROP SCHEMA IF EXISTS public CASCADE")
await client.query("CREATE SCHEMA public")
await client.query("GRANT ALL ON SCHEMA public TO public")
await client.query("GRANT ALL ON SCHEMA public TO CURRENT_USER")

const tables = await client.query(
  `SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'`
)
console.log(`public schema cleared (${tables.rows[0].n} tables remaining)`)
await client.end()

console.log("re-applying migrations…")
const child = spawn("node", ["scripts/migrate-all.mjs"], {
  stdio: "inherit",
  env: process.env,
})
child.on("exit", (code) => process.exit(code ?? 1))
