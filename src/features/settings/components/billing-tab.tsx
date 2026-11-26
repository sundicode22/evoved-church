"use client"

import * as React from "react"
import { Check, CreditCard, Sparkles } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { StatusPill } from "@/components/table-panel"
import {
  useSaasPlans,
  useSelectPlan,
  useTenantSubscription,
} from "@/features/billing/hooks/use-billing"
import { cn } from "@/lib/utils"

function money(cents: number, currency = "USD") {
  if (cents <= 0) return "Free"
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(cents / 100)
  } catch {
    return `$${(cents / 100).toFixed(0)}`
  }
}

export function BillingTab({ canEdit }: { canEdit: boolean }) {
  const { data: plans = [], isLoading: plansLoading } = useSaasPlans()
  const { data: sub, isLoading: subLoading } = useTenantSubscription()
  const selectPlan = useSelectPlan()

  const loading = plansLoading || subLoading

  return (
    <div className="max-w-4xl space-y-6 text-left">
      <Alert className="items-start gap-x-3 border-border bg-card px-4 py-3.5 text-sm shadow-xs has-[>svg]:grid-cols-[auto_1fr] *:[svg]:size-4">
        <CreditCard className="text-brand" strokeWidth={1.75} />
        <AlertTitle className="text-sm font-medium text-foreground">
          Multi-tenant pricing
        </AlertTitle>
        <AlertDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Each church organization is a tenant. Inside it, every location has its own workspace
          (members, visitors, giving, attendance). Plans limit how many locations and staff seats
          you can add.
        </AlertDescription>
      </Alert>

      {loading || !sub ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" /> Loading billing…
        </div>
      ) : (
        <>
          <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-brand">Current plan</p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">{sub.plan.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{sub.plan.description}</p>
              </div>
              <StatusPill tone={sub.status === "active" ? "success" : "warning"}>
                {sub.status}
              </StatusPill>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background px-3 py-2.5">
                <dt className="text-xs text-muted-foreground">Locations</dt>
                <dd className="text-sm font-medium text-foreground tabular-nums">
                  {sub.usage.locations} / {sub.plan.maxLocations}
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-background px-3 py-2.5">
                <dt className="text-xs text-muted-foreground">Staff seats</dt>
                <dd className="text-sm font-medium text-foreground tabular-nums">
                  {sub.usage.seats} / {sub.plan.maxSeats}
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-background px-3 py-2.5">
                <dt className="text-xs text-muted-foreground">Price</dt>
                <dd className="text-sm font-medium text-foreground">
                  {money(sub.plan.priceMonthlyCents, sub.plan.currencyCode)}
                  {sub.plan.priceMonthlyCents > 0 ? (
                    <span className="text-muted-foreground"> / mo</span>
                  ) : null}
                </dd>
              </div>
            </dl>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const current = sub.plan.slug === plan.slug
              const recommending = plan.slug === "growth"
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "flex flex-col rounded-xl border bg-card p-4 shadow-xs",
                    current ? "border-brand ring-1 ring-brand/30" : "border-border",
                    recommending && !current ? "border-brand/40" : null
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                    {recommending ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand">
                        <Sparkles className="size-3" /> Popular
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    {money(plan.priceMonthlyCents, plan.currencyCode)}
                    {plan.priceMonthlyCents > 0 ? (
                      <span className="text-sm font-normal text-muted-foreground"> /mo</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
                  <ul className="mt-4 flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2 text-xs text-foreground">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-brand" strokeWidth={2} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    className="mt-4 w-full"
                    variant={current ? "outline" : "primary"}
                    disabled={!canEdit || current || selectPlan.isPending}
                    onClick={() =>
                      selectPlan.mutate({
                        planSlug: plan.slug as "starter" | "growth" | "campus",
                      })
                    }
                  >
                    {selectPlan.isPending ? (
                      <Spinner className="size-3.5" />
                    ) : current ? (
                      "Current plan"
                    ) : (
                      `Choose ${plan.name}`
                    )}
                  </Button>
                </div>
              )
            })}
          </section>
        </>
      )}
    </div>
  )
}
