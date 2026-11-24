"use client"

import * as React from "react"
import { CheckCircle2, Droplet, Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Can, RequireAbility } from "@/components/auth/can"
import {
  useAddDripStep,
  useCreateDripSequence,
  useDripSequences,
} from "@/features/drips/hooks/use-drips"
import { DRIP_TRIGGERS } from "@/features/drips/schemas"

export default function CommunicationsPage() {
  const { data: sequences, isLoading } = useDripSequences()
  const createSeq = useCreateDripSequence()
  const addStep = useAddDripStep()

  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [seqOpen, setSeqOpen] = React.useState(false)
  const [stepOpen, setStepOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [triggerEvent, setTriggerEvent] = React.useState("first_visit")
  const [delayHours, setDelayHours] = React.useState("24")
  const [channel, setChannel] = React.useState<"email" | "sms">("email")
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("")

  React.useEffect(() => {
    if (!activeId && sequences?.[0]) setActiveId(sequences[0].id)
  }, [sequences, activeId])

  const active = sequences?.find((s) => s.id === activeId) || sequences?.[0]

  function submitSequence(e: React.FormEvent) {
    e.preventDefault()
    createSeq.mutate(
      { name, triggerEvent, isActive: true },
      {
        onSuccess: (seq) => {
          setSeqOpen(false)
          setName("")
          setActiveId(seq.id)
        },
      }
    )
  }

  function submitStep(e: React.FormEvent) {
    e.preventDefault()
    if (!active) return
    addStep.mutate(
      {
        sequenceId: active.id,
        delayHours: Number(delayHours) || 0,
        channel,
        subject,
        body,
      },
      {
        onSuccess: () => {
          setStepOpen(false)
          setSubject("")
          setBody("")
          setDelayHours("24")
          setChannel("email")
        },
      }
    )
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-white">
        <RequireAbility permission="campaigns.read">
          <PageHeader
            title="Communications"
            description="Automated drip sequences for guests and members."
            icon={<Droplet className="size-5 text-[#16a34a]" strokeWidth={1.75} />}
            actions={
              <>
                <Can permission="campaigns.write">
                  <Button
                    variant="outline"
                    className="h-8 gap-1.5 text-xs font-normal"
                    onClick={() => setSeqOpen(true)}
                  >
                    <Plus className="size-3.5" strokeWidth={1.75} />
                    New sequence
                  </Button>
                  <Button
                    className="h-8 gap-1.5 bg-[#22c55e] text-xs font-normal text-white hover:bg-[#16a34a]"
                    onClick={() => setStepOpen(true)}
                    disabled={!active}
                  >
                    <Plus className="size-3.5" strokeWidth={1.75} />
                    Add step
                  </Button>
                </Can>
              </>
            }
          />

          <div className="grid gap-6 p-6 md:grid-cols-[240px_1fr] md:p-8">
            <aside className="space-y-2">
              {isLoading && <Skeleton className="h-20 w-full" />}
              {(sequences ?? []).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    active?.id === s.id
                      ? "border-emerald-300 bg-[#eaf5ea]"
                      : "border-zinc-200/80 bg-white hover:border-emerald-200"
                  }`}
                >
                  <p className="text-sm font-medium text-zinc-900">{s.name}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    {s.steps.length} steps · {s.enrollmentCount} enrolled
                  </p>
                </button>
              ))}
              {!isLoading && (sequences?.length ?? 0) === 0 && (
                <Empty className="py-8">
                  <EmptyHeader>
                    <EmptyTitle>No sequences</EmptyTitle>
                    <EmptyDescription>Create your first drip.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </aside>

            <div className="space-y-4">
              {active && (
                <div className="rounded-lg border border-zinc-200/80 bg-[#f4f6f5] px-4 py-3 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-medium text-zinc-900">{active.name}</h2>
                      <p className="text-xs text-zinc-500">
                        Trigger:{" "}
                        {DRIP_TRIGGERS.find((t) => t.value === active.triggerEvent)?.label ||
                          active.triggerEvent}
                        {active.isActive ? " · Active" : " · Paused"}
                      </p>
                    </div>
                    {active.isActive && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <CheckCircle2 className="size-3.5" />
                        Firing
                      </span>
                    )}
                  </div>
                </div>
              )}

              {active?.steps.map((st) => (
                <div
                  key={st.id}
                  className="rounded-lg border border-zinc-200/80 bg-white p-5 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-medium text-emerald-800">
                      #{st.stepOrder}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase text-emerald-700">
                        +{st.delayHours}h · {st.channel}
                      </span>
                      <h3 className="mt-1.5 text-sm font-medium text-zinc-900">
                        {st.subject || "(SMS message)"}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500">{st.body}</p>
                    </div>
                  </div>
                </div>
              ))}

              {active && active.steps.length === 0 && (
                <Empty className="rounded-lg border border-zinc-200/80 py-12">
                  <EmptyHeader>
                    <EmptyTitle>No steps yet</EmptyTitle>
                    <EmptyDescription>Add an email or SMS step to this sequence.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </div>

          <Sheet open={seqOpen} onOpenChange={setSeqOpen}>
            <SheetContent side="right" inset size="md" className="p-0">
              <form onSubmit={submitSequence} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle>New drip sequence</SheetTitle>
                  <SheetDescription>
                    Name the sequence and choose what triggers enrollment.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Name</FieldLabel>
                      <Input
                        className="h-9"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Trigger</FieldLabel>
                      <Select
                        value={triggerEvent}
                        items={DRIP_TRIGGERS.map((t) => ({
                          value: t.value,
                          label: t.label,
                        }))}
                        onValueChange={(v) => v && setTriggerEvent(v)}
                      >
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DRIP_TRIGGERS.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setSeqOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createSeq.isPending || name.trim().length < 2}
                    className="bg-[#22c55e] text-white hover:bg-[#16a34a]"
                  >
                    Create sequence
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>

          <Sheet open={stepOpen} onOpenChange={setStepOpen}>
            <SheetContent side="right" inset size="md" className="p-0">
              <form onSubmit={submitStep} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle>Add drip step</SheetTitle>
                  <SheetDescription>
                    Delay, channel, and message for {active?.name || "this sequence"}.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup>
                    <div className="grid grid-cols-2 gap-3">
                      <Field>
                        <FieldLabel>Delay (hours)</FieldLabel>
                        <Input
                          type="number"
                          min={0}
                          className="h-9"
                          value={delayHours}
                          onChange={(e) => setDelayHours(e.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Channel</FieldLabel>
                        <Select
                          value={channel}
                          items={[
                            { value: "email", label: "Email" },
                            { value: "sms", label: "SMS" },
                          ]}
                          onValueChange={(v) => v && setChannel(v as "email" | "sms")}
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    {channel === "email" && (
                      <Field>
                        <FieldLabel>Subject</FieldLabel>
                        <Input
                          className="h-9"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                        />
                      </Field>
                    )}
                    <Field>
                      <FieldLabel>Body</FieldLabel>
                      <Textarea
                        className="min-h-24"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        required
                      />
                    </Field>
                  </FieldGroup>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setStepOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addStep.isPending || body.trim().length < 1}
                    className="bg-[#22c55e] text-white hover:bg-[#16a34a]"
                  >
                    Save step
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
