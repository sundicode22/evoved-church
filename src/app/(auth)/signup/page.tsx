"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { signUp } from "@/features/auth/auth-client"
import { signupSchema, type SignupInput } from "@/features/auth/schemas"
import { AuthCard, AuthCardHeader } from "@/features/auth/components/auth-card"
import { AuthFormField } from "@/features/auth/components/auth-field"
import { GoogleButton } from "@/features/auth/components/google-button"
import { OrDivider } from "@/features/auth/components/or-divider"

export default function SignupPage() {
  const router = useRouter()
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  })

  async function onSubmit(values: SignupInput) {
    try {
      const { error } = await signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      })
      if (error) {
        toast.error(error.message ?? "Could not create your account.")
        return
      }
      toast.success("Account created — check your email to verify.")
      router.push("/verify-email?email=" + encodeURIComponent(values.email))
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title="Create your account"
        description="Set up your church in a few minutes."
      />
      <div className="space-y-5">
        <GoogleButton callbackURL="/onboarding" />
        <OrDivider />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="gap-4">
              <AuthFormField
                control={form.control}
                name="name"
                label="Full name"
                autoComplete="name"
                placeholder="Pastor Jane Doe"
              />
              <AuthFormField
                control={form.control}
                name="email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="pastor@yourchurch.org"
              />
              <AuthFormField
                control={form.control}
                name="password"
                label="Password"
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
              disabled={form.formState.isSubmitting}
              className="h-10 w-full rounded-lg bg-[#16a34a] text-sm text-white shadow-xs hover:bg-[#15803d]"
            >
              {form.formState.isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </Form>
        <p className="text-center text-xs text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#16a34a] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}
