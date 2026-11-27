import { BrandMark } from "@/features/auth/components/brand-mark"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 font-sans">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-emerald-50/70 dark:from-emerald-950/30 to-transparent"
      />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        <BrandMark />
        {children}
        <p className="text-center text-xs text-muted-foreground">
          &copy; Evolve ChMS &middot; One platform for your whole church.
        </p>
      </div>
    </main>
  )
}
