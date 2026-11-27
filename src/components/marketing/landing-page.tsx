"use client"

import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Check,
  HeartHandshake,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Users,
} from "lucide-react"
import { ChurchLogo } from "@/components/church-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "#product", label: "Product" },
  { href: "#modules", label: "Modules" },
  { href: "#pricing", label: "Pricing" },
]

const MODULES = [
  {
    title: "People & families",
    body: "Members, households, and household roles in one directory—not five spreadsheets.",
    icon: Users,
  },
  {
    title: "Visitor follow-up",
    body: "List-first pipeline with optional board view so guests never fall through the cracks.",
    icon: HeartHandshake,
  },
  {
    title: "Calendar & services",
    body: "Month grid and agenda for programs, assignees, and multi-type services.",
    icon: CalendarDays,
  },
  {
    title: "Giving & funds",
    body: "Contributions, pledges, and fund accounting with a clear audit trail.",
    icon: LayoutDashboard,
  },
  {
    title: "Multi-location",
    body: "Every location gets its own workspace. Plans limit seats and campuses—not features.",
    icon: MapPin,
  },
  {
    title: "Campaigns",
    body: "Email via Resend and SMS via Twilio—kept separate so messaging stays reliable.",
    icon: MessageSquare,
  },
]

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    detail: "1 location · 3 seats",
    features: ["Members & families", "Visitor CRM", "Forms + QR check-in", "Calendar"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$49",
    detail: "3 locations · 15 seats",
    features: [
      "Everything in Starter",
      "Campaigns (email + SMS)",
      "Reports & exports",
      "Priority support",
    ],
    cta: "Choose Growth",
    highlighted: true,
  },
  {
    name: "Campus",
    price: "$129",
    detail: "50 locations · 50 seats",
    features: [
      "Everything in Growth",
      "Fund accounting & ledger",
      "CSV migration tools",
      "Dedicated onboarding",
    ],
    cta: "Choose Campus",
    highlighted: false,
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f3f5f4] text-zinc-900 antialiased">
      <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-[#f3f5f4]/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <ChurchLogo size="sm" showName nameClassName="text-base font-medium" />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Sign in
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/signup" />}>
              Start free
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero — brand first, one promise, one CTA, product visual */}
        <section className="relative overflow-hidden border-b border-zinc-200/70">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(100,149,237,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(22,163,74,0.08),_transparent_45%)]"
          />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:pt-24 lg:pb-24">
            <div className="max-w-xl">
              <p className="text-sm font-medium tracking-wide text-[#4f7fd4]">Evolve Church</p>
              <h1 className="mt-3 text-4xl font-medium tracking-tight text-zinc-950 sm:text-5xl sm:leading-[1.08]">
                Your whole church, in one calm workspace.
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-600 sm:text-lg">
                People, visitors, giving, calendar, and multi-location ops—without the five logins
                and the Sunday scramble.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" nativeButton={false} render={<Link href="/signup" />}>
                  Start free — no card needed
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/80"
                  nativeButton={false}
                  render={<Link href="#product" />}
                >
                  See the product
                </Button>
              </div>
              <p className="mt-4 text-xs text-zinc-500">
                Finish church + location setup once, then land in your workspace.
              </p>
            </div>

            <div id="product" className="relative">
              <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)]">
                <div className="flex items-center gap-1.5 border-b border-zinc-100 bg-zinc-50 px-4 py-2.5">
                  <span className="size-2.5 rounded-full bg-zinc-300" />
                  <span className="size-2.5 rounded-full bg-zinc-300" />
                  <span className="size-2.5 rounded-full bg-zinc-300" />
                  <span className="ml-3 text-xs text-zinc-400">Workspace · Main Location</span>
                </div>
                <div className="grid gap-3 bg-[#f7f8f7] p-4 sm:p-5">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Fund net", value: "$12.4k" },
                      { label: "Giving", value: "$2.1k" },
                      { label: "Visitors", value: "18" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-xl border border-zinc-200/80 bg-white px-3 py-3"
                      >
                        <p className="text-[11px] text-zinc-500">{s.label}</p>
                        <p className="mt-1 text-lg font-medium tracking-tight text-zinc-950">
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-200/80 bg-white p-3">
                      <p className="text-xs font-medium text-zinc-800">Attendance</p>
                      <div className="mt-3 flex h-20 items-end gap-1.5">
                        {[40, 55, 48, 70, 62, 88, 76].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-sm bg-[#6495ed]/80"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-zinc-200/80 bg-white p-3">
                      <p className="text-xs font-medium text-zinc-800">Visitor stages</p>
                      <ul className="mt-3 space-y-2">
                        {[
                          { name: "First visit", n: 6 },
                          { name: "Welcome call", n: 5 },
                          { name: "Connected", n: 7 },
                        ].map((row) => (
                          <li key={row.name} className="flex items-center justify-between text-xs">
                            <span className="text-zinc-600">{row.name}</span>
                            <span className="font-medium text-zinc-900 tabular-nums">{row.n}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-200/70 bg-white py-10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
            <p className="text-sm text-zinc-500">Built for multi-location churches that outgrew tools.</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-zinc-700">
              <span>Members</span>
              <span>Visitors</span>
              <span>Giving</span>
              <span>Calendar</span>
              <span>Campaigns</span>
            </div>
          </div>
        </section>

        <section id="modules" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-medium tracking-tight text-zinc-950">
              One Sunday workflow. Every module included.
            </h2>
            <p className="mt-3 text-base text-zinc-600">
              Evolve is a premium ChMS—people, money, calendar, and communications—scoped by
              location and protected by dynamic roles.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((mod) => (
              <article
                key={mod.title}
                className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#eef3fc] text-[#4f7fd4]">
                  <mod.icon className="size-4" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-base font-medium text-zinc-950">{mod.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{mod.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-zinc-200/70 bg-white py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-medium tracking-tight text-zinc-950">
                Onboard once. Work from the right location.
              </h2>
              <p className="mt-3 text-base text-zinc-600">
                Sign up, set church details and your first location, invite your team—then open the
                workspace. Families can add members now or skip until later.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Church + location onboarding before the dashboard",
                  "Active location shown in the shell so staff stay oriented",
                  "Plans limit seats and campuses—not which modules you get",
                ].map((line) => (
                  <li key={line} className="flex gap-2 text-sm text-zinc-700">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#16a34a]" strokeWidth={2} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-zinc-200/80 bg-[#f7f8f7] p-6">
              <ol className="space-y-4">
                {[
                  { step: "01", title: "Create account", body: "Email or Google — then verify." },
                  { step: "02", title: "Church & location", body: "Name, city, connection card URL." },
                  { step: "03", title: "Invite team", body: "Bring leaders into the same tenant." },
                  { step: "04", title: "Workspace", body: "People, giving, calendar—ready to use." },
                ].map((item) => (
                  <li key={item.step} className="flex gap-4 rounded-xl border border-zinc-200/80 bg-white p-4">
                    <span className="text-sm font-medium tabular-nums text-[#6495ed]">{item.step}</span>
                    <div>
                      <p className="text-sm font-medium text-zinc-950">{item.title}</p>
                      <p className="mt-0.5 text-sm text-zinc-600">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-medium tracking-tight text-zinc-950">
              Clear pricing by size
            </h2>
            <p className="mt-3 text-base text-zinc-600">
              Every plan includes the same modules. You pay for locations and staff seats.
            </p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={cn(
                  "flex flex-col rounded-2xl border bg-white p-6 shadow-xs",
                  plan.highlighted
                    ? "border-[#6495ed] ring-1 ring-[#6495ed]/30"
                    : "border-zinc-200/80"
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-zinc-950">{plan.name}</h3>
                  {plan.highlighted ? (
                    <span className="text-[11px] font-medium text-[#4f7fd4]">Popular</span>
                  ) : null}
                </div>
                <p className="mt-4 text-3xl font-medium tracking-tight text-zinc-950">
                  {plan.price}
                  {plan.price !== "Free" ? (
                    <span className="text-sm font-normal text-zinc-500"> /mo</span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-zinc-500">{plan.detail}</p>
                <ul className="mt-6 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-zinc-700">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-[#16a34a]" strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  nativeButton={false}
                  render={<Link href="/signup" />}
                >
                  {plan.cta}
                </Button>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-200/70 bg-zinc-950 px-4 py-16 text-white sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
                Ready for a quieter Sunday ops stack?
              </h2>
              <p className="mt-2 max-w-lg text-sm text-zinc-400">
                Start free, set your location, and open the workspace in minutes.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-white text-zinc-950 hover:bg-zinc-100"
              nativeButton={false}
              render={<Link href="/signup" />}
            >
              Create your church account
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/70 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <ChurchLogo size="sm" showName nameClassName="text-sm font-medium" />
          <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
            <Link href="/login" className="hover:text-zinc-900">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-zinc-900">
              Sign up
            </Link>
            <a href="#pricing" className="hover:text-zinc-900">
              Pricing
            </a>
          </div>
          <p className="text-xs text-zinc-400">© {new Date().getFullYear()} Evolve Church</p>
        </div>
      </footer>
    </div>
  )
}
