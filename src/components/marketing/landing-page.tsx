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
  Sparkles,
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
import { LandingDemoForm } from "@/components/marketing/landing-demo-form"
import { LandingScreenshots } from "@/components/marketing/landing-screenshots"
import { cn } from "@/lib/utils"

function EvolveMark({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-[#6495ed] text-sm font-semibold text-white shadow-sm">
        E
      </span>
      <span
        className={cn(
          "text-lg font-semibold tracking-tight",
          light ? "text-white" : "text-zinc-950"
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
    title: "Giving & funds",
    description: "Batches, pledges, and audited fund accounting.",
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
    href: "#demo",
    title: "Migrating from spreadsheets",
    description: "CSV import for members and giving with dry-run first.",
    icon: FileSpreadsheet,
  },
  {
    href: "#modules",
    title: "Finance & stewards",
    description: "Never silent auto-post—always who created and who posted.",
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
    title: "Giving & funds",
    body: "Batches, pledges, and fund accounting with a clear who-posted trail.",
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
    features: ["Members & families", "Visitor CRM", "Forms + QR check-in", "Calendar"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$49",
    detail: "3 locations · 15 seats",
    features: ["Everything in Starter", "Campaigns email + SMS", "Reports & exports", "Priority support"],
    cta: "Choose Growth",
    highlighted: true,
  },
  {
    name: "Campus",
    price: "$129",
    detail: "50 locations · 50 seats",
    features: ["Everything in Growth", "Fund accounting", "CSV migration", "Dedicated onboarding"],
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
    a: "Use the Book a demo form. We send your note to Evolve owners over Resend and confirm to your inbox.",
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
      className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-[#f3f6fb]"
    >
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#eef3fc] text-[#4f7fd4]">
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-zinc-950">{title}</span>
        <span className="mt-0.5 block text-xs leading-snug text-zinc-500">{description}</span>
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

  // Portaled mega-menus inherit <html> theme — keep marketing chrome light.
  React.useEffect(() => {
    const root = document.documentElement
    const hadDark = root.classList.contains("dark")
    root.classList.remove("dark")
    root.classList.add("light")
    return () => {
      root.classList.remove("light")
      if (hadDark) root.classList.add("dark")
    }
  }, [])

  return (
    <div className="light relative min-h-screen overflow-x-hidden bg-[#fbfcfb] text-zinc-900 antialiased">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(ellipse_at_20%_0%,rgba(100,149,237,0.22),transparent_50%),radial-gradient(ellipse_at_90%_10%,rgba(22,163,74,0.12),transparent_45%),linear-gradient(180deg,#fbfcfb_0%,#f4f7f5_55%,#fbfcfb_100%)]"
      />

      <header
        className={cn(
          "sticky top-0 z-50 transition-colors duration-300",
          scrolled
            ? "border-b border-zinc-200/50 bg-transparent backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <EvolveMark />

          <NavigationMenu className="hidden lg:flex" align="center">
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-sm data-open:bg-white/70 data-popup-open:bg-white/70">
                  Product
                </NavigationMenuTrigger>
                <NavigationMenuContent className="p-3 md:w-[640px]">
                  <div className="mb-2 px-3 pt-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Application sections
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
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
                <NavigationMenuTrigger className="bg-transparent text-sm data-open:bg-white/70 data-popup-open:bg-white/70">
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
                  className="rounded-lg bg-transparent px-3 py-2 text-sm font-medium hover:bg-white/60"
                >
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="#demo"
                  className="rounded-lg bg-transparent px-3 py-2 text-sm font-medium hover:bg-white/60"
                >
                  Book demo
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-2">
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
                  <Button variant="outline" size="icon-sm" className="border-zinc-200/80 bg-white/50 lg:hidden" aria-label="Open menu" />
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
                    { href: "#demo", label: "Book a demo" },
                    { href: "#faq", label: "FAQ" },
                  ].map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-muted"
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
              <h1 className="mt-4 text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl sm:leading-[1.05]">
                Evolve
              </h1>
              <p className="mt-4 text-xl font-medium tracking-tight text-zinc-700 sm:text-2xl">
                Your whole church, in one calm workspace.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
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
                  className="border-zinc-200/90 bg-white/70"
                  nativeButton={false}
                  render={<a href="#demo" />}
                >
                  Book a demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Sliding product screenshots */}
        <section id="tour" className="scroll-mt-24 border-y border-zinc-200/60 bg-white/70 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <LandingScreenshots />
          </div>
        </section>

        {/* Modules */}
        <section id="modules" className="scroll-mt-24 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="rounded-md font-normal">
                Modules
              </Badge>
              <h2 className="mt-3 text-3xl font-medium tracking-tight text-zinc-950">
                One Sunday workflow. Every module included.
              </h2>
              <p className="mt-3 text-base text-zinc-600">
                Premium ChMS for people, money, calendar, and communications—scoped by location.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map((mod) => (
                <div
                  key={mod.title}
                  className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#eef3fc] text-[#4f7fd4]">
                    <mod.icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 text-base font-medium text-zinc-950">{mod.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{mod.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-start gap-3 rounded-2xl border border-zinc-200/70 bg-[#f0f5ff]/60 p-5">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#6495ed]" strokeWidth={1.75} />
              <div>
                <p className="text-sm font-medium text-zinc-950">Dynamic roles, not cookie clutter</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Permissions load from your church matrix. Admins see everything; custom roles stay
                  scoped to what each leader needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Onboarding */}
        <section className="border-y border-zinc-200/60 bg-white/60 py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="secondary" className="rounded-md font-normal">
                Onboarding
              </Badge>
              <h2 className="mt-3 text-3xl font-medium tracking-tight text-zinc-950">
                Set up the space. Then open the workspace.
              </h2>
              <p className="mt-3 text-base text-zinc-600">
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
                  className="flex gap-4 rounded-xl border border-zinc-200/80 bg-white p-4"
                >
                  <span className="text-sm font-medium tabular-nums text-[#6495ed]">{item.step}</span>
                  <div>
                    <p className="text-sm font-medium text-zinc-950">{item.title}</p>
                    <p className="mt-0.5 text-sm text-zinc-600">{item.body}</p>
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
              <h2 className="mt-3 text-3xl font-medium tracking-tight text-zinc-950">
                Clear pricing by size
              </h2>
              <p className="mt-3 text-base text-zinc-600">
                Same modules on every plan. You pay for locations and staff seats.
              </p>
            </div>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {PLANS.map((plan) => (
                <Card
                  key={plan.name}
                  className={cn(
                    "border-zinc-200/80 bg-white/90 shadow-xs",
                    plan.highlighted && "border-[#6495ed] ring-1 ring-[#6495ed]/30"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      {plan.highlighted ? (
                        <Badge className="rounded-md bg-[#eef3fc] text-[#2b4c8c] hover:bg-[#eef3fc]">
                          Popular
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-3xl font-medium tracking-tight text-zinc-950">
                      {plan.price}
                      {plan.price !== "Free" ? (
                        <span className="text-sm font-normal text-muted-foreground"> /mo</span>
                      ) : null}
                    </p>
                    <CardDescription>{plan.detail}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex gap-2 text-sm text-zinc-700">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-[#16a34a]" strokeWidth={2} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
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
                      render={<a href="#demo" />}
                    >
                      Or talk to us
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Demo / interest */}
        <section id="demo" className="scroll-mt-24 border-y border-zinc-200/60 bg-white/70 py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <Badge className="rounded-md border-transparent bg-[#eef3fc] text-[#2b4c8c] hover:bg-[#eef3fc]">
                <Sparkles className="size-3" />
                Talk to Evolve
              </Badge>
              <h2 className="mt-3 text-3xl font-medium tracking-tight text-zinc-950">
                Book a demo or show interest
              </h2>
              <p className="mt-3 text-base text-zinc-600">
                Tell us about your church. We route the message to system owners with Resend—no
                third-party form tool.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-zinc-600">
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-[#16a34a]" />
                  Live walkthrough of dashboard, people, giving, and calendar
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-[#16a34a]" />
                  Migration advice from CSV or another ChMS
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-[#16a34a]" />
                  Pricing fit for your locations and seats
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] sm:p-6">
              <LandingDemoForm />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <Badge variant="secondary" className="rounded-md font-normal">
                FAQ
              </Badge>
              <h2 className="mt-3 text-3xl font-medium tracking-tight text-zinc-950">
                Questions before you start
              </h2>
            </div>
            <Accordion className="mt-10 rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
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
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden px-4 py-16 sm:px-6">
          <div className="absolute inset-0 bg-zinc-950" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(100,149,237,0.35),transparent_55%)]"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-medium tracking-tight text-white sm:text-3xl">
                Ready for a quieter Sunday ops stack?
              </h2>
              <p className="mt-2 max-w-lg text-sm text-zinc-400">
                Start free, or book a demo—we&apos;ll meet you where you are.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-white text-zinc-950 hover:bg-zinc-100"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                Create account
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                nativeButton={false}
                render={<a href="#demo" />}
              >
                Book a demo
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/70 bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
            <div className="space-y-3 md:pr-6">
              <EvolveMark />
              <p className="max-w-xs text-sm leading-relaxed text-zinc-600">
                Premium church management for multi-location teams—people, giving, calendar, and
                campaigns in one workspace.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <p className="font-medium text-zinc-900">Product</p>
              <a href="#tour" className="block text-zinc-600 hover:text-zinc-950">
                Product tour
              </a>
              <a href="#modules" className="block text-zinc-600 hover:text-zinc-950">
                Modules
              </a>
              <a href="#pricing" className="block text-zinc-600 hover:text-zinc-950">
                Pricing
              </a>
              <a href="#faq" className="block text-zinc-600 hover:text-zinc-950">
                FAQ
              </a>
            </div>

            <div className="space-y-3 text-sm">
              <p className="font-medium text-zinc-900">Get started</p>
              <Link href="/signup" className="block text-zinc-600 hover:text-zinc-950">
                Start free
              </Link>
              <Link href="/login" className="block text-zinc-600 hover:text-zinc-950">
                Sign in
              </Link>
              <a href="#demo" className="block text-zinc-600 hover:text-zinc-950">
                Book a demo
              </a>
              <a href="#demo" className="block text-zinc-600 hover:text-zinc-950">
                Show interest
              </a>
            </div>

            <div className="space-y-3 text-sm">
              <p className="font-medium text-zinc-900">Workspace</p>
              <Link href="/dashboard" className="block text-zinc-600 hover:text-zinc-950">
                Open dashboard
              </Link>
              <Link href="/dashboard/settings" className="block text-zinc-600 hover:text-zinc-950">
                Settings
              </Link>
              <Link
                href="/dashboard/settings?tab=billing"
                className="block text-zinc-600 hover:text-zinc-950"
              >
                Billing
              </Link>
            </div>

            <div className="space-y-3 text-sm">
              <p className="font-medium text-zinc-900">Trust</p>
              <p className="text-zinc-600">Dynamic RBAC</p>
              <p className="text-zinc-600">Audited fund ledger</p>
              <p className="text-zinc-600">Resend + Twilio split</p>
            </div>
          </div>

          <Separator className="my-8 bg-zinc-200/80" />

          <div className="flex flex-col gap-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Evolve Church. All rights reserved.</p>
            <p>Built for multi-location ops · evolvechms.org</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
