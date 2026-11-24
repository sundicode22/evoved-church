"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { AuthSearchParamsFallback } from "@/components/auth-search-params"
import { resetPassword } from "@/features/auth/auth-client"
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/features/auth/schemas"
import { AuthCard, AuthCardHeader } from "@/features/auth/components/auth-card"
import { AuthFormField } from "@/features/auth/components/auth-field"

function ResetPasswordForm() {
  const router = useRouter()
  const search = useSearchParams()
  const token = search.get("token") || ""

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  })

  React.useEffect(() => {
    if (!token) toast.error("This reset link is missing a token. Request a new one.")
  }, [token])

  async function onSubmit(values: ResetPasswordInput) {
    if (!token) {
      toast.error("This reset link is invalid or expired.")
      return
    }
    try {
      const { error } = await resetPassword({
        newPassword: values.password,
        token,
      })
      if (error) {
        toast.error(error.message ?? "Could not reset password.")
        return
      }
      toast.success("Password updated")
      router.push("/login?reset=1")
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title="Choose a new password"
        description="Enter a new password for your account."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="gap-4">
            <AuthFormField
              control={form.control}
              name="password"
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
            <AuthFormField
              control={form.control}
              name="confirm"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
            />
          </FieldGroup>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !token}
            className="h-10 w-full rounded-lg bg-[var(--brand)] text-sm text-white shadow-xs hover:bg-[var(--brand-hover)]"
          >
            {form.formState.isSubmitting ? "Saving…" : "Update password"}
          </Button>
          <p className="text-center text-xs text-zinc-500">
            <Link href="/login" className="font-medium text-[var(--brand)] hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      </Form>
    </AuthCard>
  )
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<AuthSearchParamsFallback />}>
      <ResetPasswordForm />
    </React.Suspense>
  )
}
