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
      organization: schema.organizations,
      member: schema.organizationMembers,
      invitation: schema.invitations,
      twoFactor: schema.twoFactors,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
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

export type Session = typeof auth.$Infer.Session
