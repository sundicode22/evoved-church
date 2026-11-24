"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { requestPasswordReset } from "@/features/auth/auth-client"
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/features/auth/schemas"
import { AuthCard, AuthCardHeader } from "@/features/auth/components/auth-card"
import { AuthFormField } from "@/features/auth/components/auth-field"

export default function ForgotPasswordPage() {
  const [sentEmail, setSentEmail] = React.useState<string | null>(null)
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: ForgotPasswordInput) {
    try {
      const { error } = await requestPasswordReset({
        email: values.email,
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) {
        toast.error(error.message ?? "Could not send reset email.")
        return
      }
      setSentEmail(values.email)
      toast.success("If that email exists, we sent a reset link.")
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title="Forgot password"
        description="Enter your email and we’ll send a link to reset your password."
      />
      {sentEmail ? (
        <p className="text-center text-xs text-zinc-500">
          Check <span className="font-medium text-zinc-700">{sentEmail}</span> for the reset
          link.{" "}
          <Link href="/login" className="font-medium text-[#16a34a] hover:underline">
            Back to sign in
          </Link>
        </p>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="gap-4">
              <AuthFormField
                control={form.control}
                name="email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="pastor@yourchurch.org"
              />
            </FieldGroup>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-10 w-full rounded-lg bg-[#16a34a] text-sm text-white shadow-xs hover:bg-[#15803d]"
            >
              {form.formState.isSubmitting ? "Sending…" : "Send reset link"}
            </Button>
            <p className="text-center text-xs text-zinc-500">
              <Link href="/login" className="font-medium text-[#16a34a] hover:underline">
                Back to sign in
              </Link>
            </p>
          </form>
        </Form>
      )}
    </AuthCard>
  )
}
