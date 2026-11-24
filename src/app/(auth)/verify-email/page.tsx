"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { AuthSearchParamsFallback } from "@/components/auth-search-params"
import { sendVerificationEmail } from "@/features/auth/auth-client"
import { AuthCard, AuthCardHeader } from "@/features/auth/components/auth-card"

function VerifyEmailForm() {
  const search = useSearchParams()
  const email = search.get("email") || ""
  const [pending, setPending] = React.useState(false)

  async function resend() {
    if (!email) {
      toast.error("Missing email address.")
      return
    }
    setPending(true)
    try {
      const { error: authError } = await sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/onboarding`,
      })
      if (authError) {
        toast.error(authError.message ?? "Could not resend verification email.")
        return
      }
      toast.success("Verification email sent. Check your inbox.")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title="Check your email"
        description={
          email
            ? `We sent a verification link to ${email}. Open it to continue.`
            : "We sent a verification link to your email. Open it to continue."
        }
      />
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          disabled={pending || !email}
          onClick={resend}
          className="h-10 w-full rounded-lg border-zinc-200 bg-white text-sm shadow-xs"
        >
          {pending ? "Sending…" : "Resend verification email"}
        </Button>
        <p className="text-center text-xs text-zinc-500">
          Already verified?{" "}
          <Link href="/login" className="font-medium text-[#16a34a] hover:underline">
            Sign in
          </Link>
          {" · "}
          <Link href="/onboarding" className="font-medium text-[#16a34a] hover:underline">
            Continue setup
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<AuthSearchParamsFallback />}>
      <VerifyEmailForm />
    </React.Suspense>
  )
}
