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
import { signIn } from "@/features/auth/auth-client"
import { loginSchema, type LoginInput } from "@/features/auth/schemas"
import { AuthCard, AuthCardHeader } from "@/features/auth/components/auth-card"
import { AuthFormField } from "@/features/auth/components/auth-field"
import { GoogleButton } from "@/features/auth/components/google-button"
import { OrDivider } from "@/features/auth/components/or-divider"

function workspacePath(redirectTo: string) {
  if (redirectTo.startsWith("/dashboard") && redirectTo !== "/dashboard") {
    return `/workspaces?redirect=${encodeURIComponent(redirectTo)}`
  }
  return "/workspaces"
}

function LoginForm() {
  const router = useRouter()
  const search = useSearchParams()
  const redirectTo = search.get("redirect") || "/dashboard"

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  React.useEffect(() => {
    if (search.get("reset") === "1") {
      toast.success("Password updated. Sign in with your new password.")
    }
  }, [search])

  async function onSubmit(values: LoginInput) {
    try {
      const { data, error } = await signIn.email(values)
      if (error) {
        toast.error(error.message ?? "Invalid email or password.")
        return
      }
      if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
        router.push("/two-factor")
        return
      }
      toast.success("Signed in")
      router.push(workspacePath(redirectTo))
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title="Welcome back"
        description="Sign in to continue to your church dashboard."
      />
      <div className="space-y-5">
        <GoogleButton callbackURL={workspacePath(redirectTo)} />
        <OrDivider />
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
              <AuthFormField
                control={form.control}
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                hint={
                  <Link
                    href="/forgot-password"
                    className="text-[12px] font-medium text-brand hover:underline"
                  >
                    Forgot password?
                  </Link>
                }
              />
            </FieldGroup>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-10 w-full rounded-lg text-sm"
            >
              {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Form>
        <p className="text-center text-xs text-zinc-500">
          New to Evolve?{" "}
          <Link href="/signup" className="font-medium text-brand hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<AuthSearchParamsFallback />}>
      <LoginForm />
    </React.Suspense>
  )
}
