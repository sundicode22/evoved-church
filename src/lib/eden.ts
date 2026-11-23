import { treaty } from "@elysiajs/eden"
import type { App } from "@/server"

// Browser & server typed RPC client
const baseUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const api = treaty<App>(baseUrl)
