"use client"

import * as React from "react"
import { CheckCircle2, Droplet, Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  NumberFormField,
  RichTextFormField,
  SelectFormField,
  TextareaFormField,
  TextFormField,
} from "@/components/form-fields"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { FieldGroup } from "@/components/ui/field"
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

const sequenceFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  triggerEvent: z.string().min(1, "Trigger is required"),
})

type SequenceFormValues = z.infer<typeof sequenceFormSchema>

const SEQUENCE_DEFAULTS: SequenceFormValues = { name: "", triggerEvent: "first_visit" }

const stepFormSchema = z.object({
  delayHours: z
    .number({ error: "Delay is required" })
    .min(0, "Delay cannot be negative"),
  channel: z.enum(["email", "sms"]),
  subject: z.string(),
  body: z.string().trim().min(1, "Body is required"),
})

type StepFormValues = z.infer<typeof stepFormSchema>

const STEP_DEFAULTS: Partial<StepFormValues> = {
  delayHours: 24,
  channel: "email",
  subject: "",
  body: "",
}

const TRIGGER_OPTIONS = DRIP_TRIGGERS.map((t) => ({ value: t.value, label: t.label }))
const STEP_CHANNEL_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
]

export default function CommunicationsPage() {
  const { data: sequences, isLoading } = useDripSequences()
  const createSeq = useCreateDripSequence()
  const addStep = useAddDripStep()

  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [seqOpen, setSeqOpen] = React.useState(false)
  const [stepOpen, setStepOpen] = React.useState(false)

  const seqForm = useForm<SequenceFormValues>({
    resolver: zodResolver(sequenceFormSchema),
    defaultValues: SEQUENCE_DEFAULTS,
  })
  const stepForm = useForm<StepFormValues>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: STEP_DEFAULTS,
  })
  const stepChannel = useWatch({ control: stepForm.control, name: "channel" })

  React.useEffect(() => {
    if (seqOpen) seqForm.reset(SEQUENCE_DEFAULTS)
  }, [seqOpen, seqForm])

  React.useEffect(() => {
    if (stepOpen) stepForm.reset(STEP_DEFAULTS)
  }, [stepOpen, stepForm])

  React.useEffect(() => {
    if (!activeId && sequences?.[0]) setActiveId(sequences[0].id)
  }, [sequences, activeId])

  const active = sequences?.find((s) => s.id === activeId) || sequences?.[0]

  function onSubmitSequence(values: SequenceFormValues) {
    createSeq.mutate(
      { name: values.name, triggerEvent: values.triggerEvent, isActive: true },
      {
        onSuccess: (seq) => {
          setSeqOpen(false)
          seqForm.reset(SEQUENCE_DEFAULTS)
          setActiveId(seq.id)
        },
      }
    )
  }

  function onSubmitStep(values: StepFormValues) {
    if (!active) return
    addStep.mutate(
      {
        sequenceId: active.id,
        delayHours: values.delayHours || 0,
        channel: values.channel,
        subject: values.subject,
        body: values.body,
      },
      {
        onSuccess: () => {
          setStepOpen(false)
          stepForm.reset(STEP_DEFAULTS)
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
            icon={<Droplet className="size-5 text-brand" strokeWidth={1.75} />}
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
                      ? "border-emerald-300 bg-brand-soft"
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
              <Form {...seqForm}>
                <form
                  onSubmit={seqForm.handleSubmit(onSubmitSequence)}
                  className="flex h-full flex-col"
                >
                  <SheetHeader className="pr-12">
                    <SheetTitle>New drip sequence</SheetTitle>
                    <SheetDescription>
                      Name the sequence and choose what triggers enrollment.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <FieldGroup>
                      <TextFormField control={seqForm.control} name="name" label="Name" />
                      <SelectFormField
                        control={seqForm.control}
                        name="triggerEvent"
                        label="Trigger"
                        options={TRIGGER_OPTIONS}
                      />
                    </FieldGroup>
                  </SheetBody>
                  <SheetFooter>
                    <Button type="button" variant="outline" onClick={() => setSeqOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={createSeq.isPending}>
                      Create sequence
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>

          <Sheet open={stepOpen} onOpenChange={setStepOpen}>
            <SheetContent side="right" inset size="md" className="p-0">
              <Form {...stepForm}>
                <form
                  onSubmit={stepForm.handleSubmit(onSubmitStep)}
                  className="flex h-full flex-col"
                >
                  <SheetHeader className="pr-12">
                    <SheetTitle>Add drip step</SheetTitle>
                    <SheetDescription>
                      Delay, channel, and message for {active?.name || "this sequence"}.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <FieldGroup>
                      <div className="grid grid-cols-2 gap-3">
                        <NumberFormField
                          control={stepForm.control}
                          name="delayHours"
                          label="Delay (hours)"
                          min={0}
                          step={1}
                        />
                        <SelectFormField
                          control={stepForm.control}
                          name="channel"
                          label="Channel"
                          options={STEP_CHANNEL_OPTIONS}
                        />
                      </div>
                      {stepChannel === "email" && (
                        <TextFormField control={stepForm.control} name="subject" label="Subject" />
                      )}
                      {stepChannel === "email" ? (
                        <RichTextFormField
                          control={stepForm.control}
                          name="body"
                          label="Body"
                          placeholder="Write the email step…"
                          minHeight="200px"
                          enableImages={false}
                        />
                      ) : (
                        <TextareaFormField
                          control={stepForm.control}
                          name="body"
                          label="Body"
                          rows={5}
                          placeholder="SMS text (plain)"
                        />
                      )}
                    </FieldGroup>
                  </SheetBody>
                  <SheetFooter>
                    <Button type="button" variant="outline" onClick={() => setStepOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={addStep.isPending}>
                      Save step
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
