import { defineConfig } from "drizzle-kit"

/**
 * Neon’s pooled host drops session state between statements, which breaks
 * drizzle-kit’s advisory lock. Migrations use the direct host instead.
 * The app runtime still connects through DATABASE_URL (the pooler).
 */
function migrationUrl(url: string) {
  const parsed = new URL(url)
  parsed.hostname = parsed.hostname.replace("-pooler", "")
  return parsed.toString()
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for Drizzle Kit")
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationUrl(databaseUrl),
  },
})
