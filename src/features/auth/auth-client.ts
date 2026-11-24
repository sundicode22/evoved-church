"use client"

import { createAuthClient } from "better-auth/react"
import { organizationClient, twoFactorClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL,
  plugins: [organizationClient(), twoFactorClient()],
})

export const { signIn, signUp, signOut, useSession } = authClient
