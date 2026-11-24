"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/features/auth/auth-client"
import { GoogleButton } from "@/features/auth/components/google-button"
import { OrDivider } from "@/features/auth/components/or-divider"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const { error: authError } = await signIn.email({ email, password })
      if (authError) {
        setError(authError.message ?? "Invalid email or password.")
        return
      }
      router.push("/dashboard")
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
        <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">Welcome back</CardTitle>
        <CardDescription className="text-sm text-zinc-500">
          Sign in to continue to your church dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <GoogleButton callbackURL="/dashboard" onError={setError} />
        <OrDivider />
        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
              placeholder="••••••••"
              required
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
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="text-center text-xs text-zinc-500">
          New to Evolve?{" "}
          <Link href="/signup" className="font-medium text-[#16a34a] hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
