"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { GoogleIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { signIn } from "@/features/auth/auth-client"

interface GoogleButtonProps {
  callbackURL?: string
  onError?: (message: string) => void
}

export function GoogleButton({ callbackURL = "/onboarding", onError }: GoogleButtonProps) {
  const [pending, setPending] = React.useState(false)

  async function handleClick() {
    setPending(true)
    try {
      const res = await signIn.social({ provider: "google", callbackURL })
      if (res?.error) {
        onError?.(res.error.message ?? "Google sign-in is unavailable.")
        setPending(false)
      }
    } catch {
      onError?.("Google sign-in is unavailable.")
      setPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={handleClick}
      className="h-10 w-full gap-2 rounded-lg border-zinc-200 bg-white text-sm text-slate-800 shadow-xs hover:bg-zinc-50"
    >
      <HugeiconsIcon icon={GoogleIcon} strokeWidth={2} className="size-4" />
      Continue with Google
    </Button>
  )
}
