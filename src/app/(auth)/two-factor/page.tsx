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
import { authClient } from "@/features/auth/auth-client"
import { twoFactorSchema, type TwoFactorInput } from "@/features/auth/schemas"
import { AuthCard, AuthCardHeader } from "@/features/auth/components/auth-card"
import { AuthFormField } from "@/features/auth/components/auth-field"

export default function TwoFactorPage() {
  const router = useRouter()
  const [useBackup, setUseBackup] = React.useState(false)
  const form = useForm<TwoFactorInput>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: { code: "" },
  })

  async function onSubmit(values: TwoFactorInput) {
    try {
      const result = useBackup
        ? await authClient.twoFactor.verifyBackupCode({ code: values.code })
        : await authClient.twoFactor.verifyTotp({ code: values.code })
      if (result.error) {
        toast.error(result.error.message ?? "Invalid code.")
        return
      }
      toast.success("Verified")
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title="Two-factor authentication"
        description={
          useBackup
            ? "Enter one of your backup codes."
            : "Enter the 6-digit code from your authenticator app."
        }
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="gap-4">
            <AuthFormField
              control={form.control}
              name="code"
              label={useBackup ? "Backup code" : "Authentication code"}
              autoComplete="one-time-code"
              placeholder={useBackup ? "xxxx-xxxx" : "123456"}
            />
          </FieldGroup>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="h-10 w-full rounded-lg bg-[var(--accent-cta)] text-sm text-white shadow-xs hover:bg-[var(--accent-cta-hover)]"
          >
            {form.formState.isSubmitting ? "Verifying…" : "Verify"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setUseBackup((v) => !v)
              form.reset({ code: "" })
            }}
            className="w-full text-center text-xs font-medium text-[var(--brand)] hover:underline"
          >
            {useBackup ? "Use authenticator code instead" : "Use a backup code instead"}
          </button>
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
