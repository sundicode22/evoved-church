import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { organization, twoFactor, bearer } from "better-auth/plugins"
import { db } from "@/lib/db"
import * as schema from "@/lib/db/schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: false, // Managed by Church Super Admins / Central Office
    }),
    twoFactor({
      issuer: "Evolve Church Management",
    }),
    bearer(),
  ],
  user: {
    additionalFields: {
      campusId: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "member",
      },
    },
  },
})
