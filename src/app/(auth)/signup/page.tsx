"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/features/auth/auth-client"
import { GoogleButton } from "@/features/auth/components/google-button"
import { OrDivider } from "@/features/auth/components/or-divider"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setPending(true)
    try {
      const { error: authError } = await signUp.email({ name, email, password })
      if (authError) {
        setError(authError.message ?? "Could not create your account.")
        return
      }
      router.push("/onboarding")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="w-full rounded-2xl border border-zinc-200/60 bg-white shadow-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">Create your account</CardTitle>
        <CardDescription className="text-sm text-zinc-500">
          Set up your church in a few minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <GoogleButton callbackURL="/onboarding" onError={setError} />
        <OrDivider />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-slate-700">Full name</Label>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Pastor Jane Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-lg bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="pastor@yourchurch.org"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-lg bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-700">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 rounded-lg bg-white"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={pending}
            className="h-10 w-full rounded-lg bg-[#16a34a] text-sm text-white shadow-sm hover:bg-[#15803d]"
          >
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <p className="text-center text-xs text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#16a34a] hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
