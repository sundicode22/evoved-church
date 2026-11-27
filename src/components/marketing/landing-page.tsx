"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Check,
  Coins,
  FileSpreadsheet,
  HeartHandshake,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { EvolveLogo } from "@/components/evolve-logo"
import { LandingScreenshots } from "@/components/marketing/landing-screenshots"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"

function EvolveMark({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)}>
      <EvolveLogo />
      <span
        className={cn(
          "font-display text-lg font-semibold tracking-normal",
          light ? "text-white" : "text-foreground"
        )}
      >
        Evolve
      </span>
    </Link>
  )
}

const PRODUCT_MEGA = [
  {
    href: "#tour",
    title: "Workspace home",
    description: "Funds, giving, and visitor pulse on one calm canvas.",
    icon: LayoutDashboard,
  },
  {
    href: "#modules",
    title: "People & families",
    description: "Households with roles—not flat contact lists.",
    icon: Users,
  },
  {
    href: "#modules",
    title: "Visitor care",
    description: "List-first follow-up with an optional kanban board.",
    icon: HeartHandshake,
  },
  {
    href: "#modules",
    title: "Accounting & funds",
    description: "Journal entries, COA, fund transfers, and audited posting.",
    icon: Coins,
  },
  {
    href: "#modules",
    title: "Calendar & services",
    description: "Month + agenda for worship, midweek, youth, and more.",
    icon: CalendarDays,
  },
  {
    href: "#modules",
    title: "Campaigns",
    description: "Email via Resend, SMS via Twilio—kept separate.",
    icon: MessageSquare,
  },
]

const SOLUTIONS_MEGA = [
  {
    href: "#modules",
    title: "Multi-location churches",
    description: "Each location keeps its own people, books, and calendar.",
    icon: MapPin,
  },
  {
    href: "#modules",
    title: "Guest experience teams",
    description: "Capture visitors, assign follow-up, and close the loop.",
    icon: HeartHandshake,
  },
  {
    href: "/demo",
    title: "Migrating from spreadsheets",
    description: "CSV import for members and giving with dry-run first.",
    icon: FileSpreadsheet,
  },
  {
    href: "#modules",
    title: "Finance & stewards",
    description: "Journal entries and fund books—never silent auto-post.",
    icon: ShieldCheck,
  },
]

const MODULES = [
  {
    title: "People & families",
    body: "Members and household roles—create a family, add members now or skip.",
    icon: Users,
  },
  {
    title: "Visitor follow-up",
    body: "List-first pipeline with optional board view so guests stay in care.",
    icon: HeartHandshake,
  },
  {
    title: "Calendar & services",
    body: "Month and agenda for worship, midweek, youth, kids, and special gatherings.",
    icon: CalendarDays,
  },
  {
    title: "Accounting & funds",
    body: "Chart of accounts, journal entries, fund transfers, batches & pledges—always who created and who posted.",
    icon: Coins,
  },
  {
    title: "Multi-location",
    body: "Each location is its own workspace. Plans limit seats and campuses.",
    icon: MapPin,
  },
  {
    title: "Campaigns",
    body: "Email with Resend, SMS with Twilio—never the same provider.",
    icon: MessageSquare,
  },
]

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    detail: "1 location · 3 seats",
    blurb: "Get your church online without a card.",
    features: [
      "Members & household roles",
      "Visitor CRM (list + board)",
      "Forms + QR check-in",
      "Calendar (month + agenda)",
      "Services & programs",
      "Giving intake (simple)",
      "Basic reports",
      "Email support",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$49",
    detail: "3 locations · 15 seats",
    blurb: "Multi-site ops plus real books for stewards.",
    features: [
      "Everything in Starter",
      "Chart of accounts (location-scoped)",
      "Location ledger + account balances",
      "Journal entries (draft → post)",
      "Fund balances & transfers",
      "Giving batches & pledges",
      "Who-created / who-posted audit trail",
      "Campaigns — email (Resend) + SMS (Twilio)",
      "Projects kanban",
      "Groups & appointments",
      "Advanced reports & CSV export",
      "Priority support",
    ],
    cta: "Choose Growth",
    highlighted: true,
  },
  {
    name: "Campus",
    price: "$129",
    detail: "50 locations · 50 seats",
    blurb: "Full fund accounting for multi-location churches.",
    features: [
      "Everything in Growth",
      "Full fund accounting (audited ledger)",
      "General ledger across all locations",
      "Location ledgers + consolidated trial balance",
      "Multi-line journal entries & period close",
      "Expense requisitions & encumbrances",
      "Budget lines by fund",
      "COA by account class (assets → equity)",
      "Giving → ledger posting controls",
      "CSV migration for members & giving",
      "Custom roles & RBAC matrix",
      "Policies & documents",
      "Dedicated onboarding",
      "Named owner channel",
    ],
    cta: "Choose Campus",
    highlighted: false,
  },
]

const FAQS = [
  {
    q: "Do I need a card to start?",
    a: "No. Starter is free. Create an account, finish church and location setup, then open the workspace.",
  },
  {
    q: "Can we run more than one location?",
    a: "Yes. Growth and Campus plans raise location and seat limits. Every location keeps its own books and people.",
  },
  {
    q: "How do demos and interest requests work?",
    a: "Open Book a demo from the nav. We send your note to Evolve owners over Resend and confirm to your inbox.",
  },
  {
    q: "How is email different from SMS?",
    a: "Email goes through Resend. SMS uses Twilio. They never share the same provider so campaigns stay reliable.",
  },
]

function MegaLink({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}) {
  return (
    <NavigationMenuLink
      href={href}
      className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
    >
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{description}</span>
      </span>
    </NavigationMenuLink>
  )
}

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground antialiased">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(ellipse_at_20%_0%,rgba(100,149,237,0.22),transparent_50%),radial-gradient(ellipse_at_90%_10%,rgba(22,163,74,0.12),transparent_45%)] dark:bg-[radial-gradient(ellipse_at_20%_0%,rgba(100,149,237,0.18),transparent_50%),radial-gradient(ellipse_at_90%_10%,rgba(22,163,74,0.08),transparent_45%)]"
      />

      <header
        className={cn(
          "sticky top-0 z-50 transition-colors duration-300",
          scrolled
            ? "bg-background/75 backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <EvolveMark />

          <NavigationMenu className="hidden lg:flex" align="center">
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-sm data-open:bg-muted data-popup-open:bg-muted">
                  Product
                </NavigationMenuTrigger>
                <NavigationMenuContent className="p-3 md:w-[640px]">
                  <div className="mb-2 px-3 pt-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Application sections
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Everything your team opens after Sunday setup.
                    </p>
                  </div>
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {PRODUCT_MEGA.map((item) => (
                      <li key={item.title}>
                        <MegaLink {...item} />
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-sm data-open:bg-muted data-popup-open:bg-muted">
                  Solutions
                </NavigationMenuTrigger>
                <NavigationMenuContent className="p-3 md:w-[520px]">
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {SOLUTIONS_MEGA.map((item) => (
                      <li key={item.title}>
                        <MegaLink {...item} />
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#pricing"
                  className="rounded-lg bg-transparent px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/demo"
                  className="rounded-lg bg-transparent px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Book demo
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ModeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="hidden bg-transparent sm:inline-flex"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Sign in
            </Button>
            <Button size="sm" className="hidden sm:inline-flex" nativeButton={false} render={<Link href="/signup" />}>
              Start free
              <ArrowRight className="size-3.5" />
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button variant="outline" size="icon-sm" className="border-border bg-background/60 lg:hidden" aria-label="Open menu" />
                }
              >
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <SheetHeader className="border-b border-border">
                  <SheetTitle>
                    <EvolveMark />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 p-4">
                  {[
                    { href: "#tour", label: "Product tour" },
                    { href: "#modules", label: "Modules" },
                    { href: "#pricing", label: "Pricing" },
                    { href: "/demo", label: "Book a demo" },
                    { href: "#faq", label: "FAQ" },
                  ].map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      {l.label}
                    </a>
                  ))}
                  <Separator className="my-3" />
                  <Button nativeButton={false} render={<Link href="/login" />} variant="outline" className="w-full">
                    Sign in
                  </Button>
                  <Button nativeButton={false} render={<Link href="/signup" />} className="w-full">
                    Start free
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero — brand first, one composition */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#4f7fd4]">
                Church management
              </p>
              <h1 className="mt-4 font-display text-5xl font-semibold tracking-normal text-foreground sm:text-6xl sm:leading-[1.05]">
                Evolve
              </h1>
              <p className="mt-4 text-xl font-medium tracking-tight text-foreground/80 sm:text-2xl">
                Your whole church, in one calm workspace.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                People, visitors, giving, calendar, and campaigns—without five logins or the Sunday
                scramble.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" nativeButton={false} render={<Link href="/signup" />}>
                  Start free — no card needed
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border bg-background/70"
                  nativeButton={false}
                  render={<Link href="/demo" />}
                >
                  Book a demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Sliding product screenshots */}
        <section id="tour" className="relative scroll-mt-24 bg-background py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <LandingScreenshots />
          </div>
          {/* Soft fade into the white canvas below */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-background/80 to-background"
          />
        </section>

        {/* Modules */}
        <section id="modules" className="scroll-mt-24 bg-background py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="rounded-md font-normal">
                Modules
              </Badge>
              <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground">
                One Sunday workflow. Every module included.
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Premium ChMS for people, money, calendar, and communications—scoped by location.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map((mod) => (
                <div
                  key={mod.title}
                  className="rounded-2xl border border-border bg-card p-5 shadow-xs"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <mod.icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 text-base font-medium text-foreground">{mod.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{mod.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-start gap-3 rounded-2xl border border-border bg-brand-soft/50 p-5">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" strokeWidth={1.75} />
              <div>
                <p className="text-sm font-medium text-foreground">Dynamic roles, not cookie clutter</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Permissions load from your church matrix. Admins see everything; custom roles stay
                  scoped to what each leader needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Onboarding */}
        <section className="border-y border-border bg-muted/30 py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="secondary" className="rounded-md font-normal">
                Onboarding
              </Badge>
              <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground">
                Set up the space. Then open the workspace.
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Sign up → church details → first location → terminology → team invites → workspace.
              </p>
            </div>
            <ol className="space-y-3">
              {[
                { step: "01", title: "Create account", body: "Email or Google, then verify." },
                { step: "02", title: "Church & location", body: "Name, city, connection card URL." },
                { step: "03", title: "Invite team", body: "Bring leaders into the same tenant." },
                { step: "04", title: "Workspace", body: "People, giving, calendar—ready." },
              ].map((item) => (
                <li
                  key={item.step}
                  className="flex gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <span className="text-sm font-medium tabular-nums text-brand">{item.step}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-24 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="rounded-md font-normal">
                Pricing
              </Badge>
              <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground">
                Clear pricing by size
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Same modules on every plan. You pay for locations and staff seats.
              </p>
            </div>
            <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
              {PLANS.map((plan) => (
                <Card
                  key={plan.name}
                  className={cn(
                    "relative flex h-full flex-col overflow-hidden border-border bg-card shadow-xs",
                    plan.highlighted &&
                      "border-[#6495ed] shadow-[0_24px_60px_-28px_rgba(100,149,237,0.55)] ring-1 ring-[#6495ed]/35 lg:-mt-2 lg:mb-[-8px]"
                  )}
                >
                  {plan.highlighted ? (
                    <div
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6495ed] via-[#7aa6f0] to-[#16a34a]"
                    />
                  ) : null}
                  <CardHeader className="gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {plan.highlighted ? (
                        <Badge className="rounded-md bg-brand-soft text-brand-ink hover:bg-brand-soft">
                          Most popular
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-4xl font-semibold tracking-tight text-foreground">
                      {plan.price}
                      {plan.price !== "Free" ? (
                        <span className="text-sm font-normal text-muted-foreground"> /mo</span>
                      ) : null}
                    </p>
                    <CardDescription className="text-sm">{plan.detail}</CardDescription>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {plan.blurb}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Included
                    </p>
                    <ul className="space-y-2.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex gap-2.5 text-sm text-foreground/85">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-[#16a34a]" strokeWidth={2.25} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto flex flex-col gap-2 border-t border-border pt-5">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      nativeButton={false}
                      render={<Link href="/signup" />}
                    >
                      {plan.cta}
                    </Button>
                    <Button
                      className="w-full"
                      variant="ghost"
                      size="sm"
                      nativeButton={false}
                      render={<Link href="/demo" />}
                    >
                      Or talk to us
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="relative scroll-mt-24 bg-background py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <Badge variant="secondary" className="rounded-md font-normal">
                FAQ
              </Badge>
              <h2 className="mt-3 text-3xl font-medium tracking-tight text-foreground">
                Questions before you start
              </h2>
            </div>
            <Accordion className="mt-10 rounded-2xl border border-border bg-card shadow-xs">
              {FAQS.map((item, i) => (
                <AccordionItem key={item.q} value={`faq-${i}`}>
                  <AccordionTrigger className="px-4 py-3 text-sm sm:px-5">{item.q}</AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground sm:px-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background"
          />
        </section>

        {/* Final CTA — soft fade from white canvas */}
        <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent"
          />
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-brand-soft px-6 py-12 shadow-xs sm:px-10">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                  Ready for a quieter Sunday ops stack?
                </h2>
                <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                  Start free, or book a demo—we&apos;ll meet you where you are.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" nativeButton={false} render={<Link href="/signup" />}>
                  Create account
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-background/80"
                  nativeButton={false}
                  render={<Link href="/demo" />}
                >
                  Book a demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/25">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
            <div className="space-y-3 md:pr-6">
              <EvolveMark />
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Premium church management for multi-location teams—people, giving, calendar, and
                campaigns in one workspace.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <p className="font-medium text-foreground">Product</p>
              <a href="#tour" className="block text-muted-foreground hover:text-foreground">
                Product tour
              </a>
              <a href="#modules" className="block text-muted-foreground hover:text-foreground">
                Modules
              </a>
              <a href="#pricing" className="block text-muted-foreground hover:text-foreground">
                Pricing
              </a>
              <a href="#faq" className="block text-muted-foreground hover:text-foreground">
                FAQ
              </a>
            </div>

            <div className="space-y-3 text-sm">
              <p className="font-medium text-foreground">Get started</p>
              <Link href="/signup" className="block text-muted-foreground hover:text-foreground">
                Start free
              </Link>
              <Link href="/login" className="block text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
              <Link href="/demo" className="block text-muted-foreground hover:text-foreground">
                Book a demo
              </Link>
            </div>

            <div className="space-y-3 text-sm">
              <p className="font-medium text-foreground">Workspace</p>
              <Link href="/dashboard" className="block text-muted-foreground hover:text-foreground">
                Open dashboard
              </Link>
              <Link href="/dashboard/settings" className="block text-muted-foreground hover:text-foreground">
                Settings
              </Link>
              <Link
                href="/dashboard/settings?tab=billing"
                className="block text-muted-foreground hover:text-foreground"
              >
                Billing
              </Link>
            </div>

            <div className="space-y-3 text-sm">
              <p className="font-medium text-foreground">Trust</p>
              <p className="text-muted-foreground">Dynamic RBAC</p>
              <p className="text-muted-foreground">Audited fund ledger</p>
              <p className="text-muted-foreground">Resend + Twilio split</p>
            </div>
          </div>

          <Separator className="my-8 bg-border" />

          <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Evolve Church. All rights reserved.</p>
            <p>Built for multi-location ops · evolvechms.org</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
