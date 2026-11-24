"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AbilityProvider } from "@/features/auth/ability-context"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={client}>
      <AbilityProvider>{children}</AbilityProvider>
    </QueryClientProvider>
  )
}
