import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "./schema"

const connectionString =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/evolve_church"

/** node-postgres pool — works with Neon’s pooled connection string. */
export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 10_000,
  ssl:
    process.env.DATABASE_SSL === "false"
      ? false
      : connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false },
})

export const db = drizzle(pool, { schema })
export * from "./schema"
