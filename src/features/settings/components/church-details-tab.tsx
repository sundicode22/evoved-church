"use client"

import * as React from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useNomenclatureStore } from "@/features/settings/use-nomenclature"
import {
  useNomenclatureQuery,
  useUpdateNomenclature,
} from "@/features/settings/hooks/use-nomenclature-api"

function dash(v?: string | null) {
  return v && v.trim() ? v : "—"
}

export function ChurchDetailsTab({ canEdit }: { canEdit: boolean }) {
  const { nomenclature } = useNomenclatureStore()
  useNomenclatureQuery()
  const save = useUpdateNomenclature()

  const [churchOpen, setChurchOpen] = React.useState(false)
  const [contactOpen, setContactOpen] = React.useState(false)
  const [draft, setDraft] = React.useState(nomenclature)

  React.useEffect(() => {
    setDraft(nomenclature)
  }, [nomenclature, churchOpen, contactOpen])

  function saveDraft(close: () => void) {
    save.mutate(draft, { onSuccess: () => close() })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="rounded-xl border bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wide text-[var(--brand)]">Church details</p>
          {canEdit ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-zinc-600"
              onClick={() => setChurchOpen(true)}
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
          ) : null}
        </div>
        <dl className="space-y-4 text-sm">
          <Row label="Church name" value={dash(nomenclature.churchName)} />
          <Row label="Email" value={dash(nomenclature.churchEmail)} />
          <div className="flex gap-8">
            <dt className="w-32 shrink-0 text-zinc-500">Logo</dt>
            <dd className="space-y-2">
              <div className="flex size-14 items-center justify-center overflow-hidden rounded-lg border bg-[#fbfcfb]">
                {nomenclature.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={nomenclature.logoUrl} alt="" className="size-full object-cover" />
                ) : (
                  <span className="text-[10px] font-semibold tracking-wide text-zinc-700">LOGO</span>
                )}
              </div>
              <p className="text-xs text-zinc-400">Max 1 MB</p>
              {canEdit ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setChurchOpen(true)}
                >
                  Change church logo
                </Button>
              ) : null}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wide text-[var(--brand)]">Contact details</p>
          {canEdit ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-zinc-600"
              onClick={() => setContactOpen(true)}
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
          ) : null}
        </div>
        <dl className="space-y-4 text-sm">
          <Row label="Phone" value={dash(nomenclature.churchPhone)} />
          <Row label="Address" value={dash(nomenclature.churchAddress)} />
          <Row label="City" value={dash(nomenclature.churchCity)} />
          <Row label="State" value={dash(nomenclature.churchState)} />
          <Row label="Zip code" value={dash(nomenclature.churchZip)} />
        </dl>
      </section>

      <Sheet open={churchOpen} onOpenChange={setChurchOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit church details</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Church name</FieldLabel>
                <Input
                  value={draft.churchName}
                  onChange={(e) => setDraft({ ...draft, churchName: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  value={draft.churchEmail}
                  onChange={(e) => setDraft({ ...draft, churchEmail: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Logo URL</FieldLabel>
                <Input
                  value={draft.logoUrl}
                  onChange={(e) => setDraft({ ...draft, logoUrl: e.target.value })}
                  placeholder="https://…"
                />
              </Field>
            </FieldGroup>
          </SheetBody>
          <SheetFooter>
            <Button variant="outline" onClick={() => setChurchOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]"
              disabled={save.isPending}
              onClick={() => saveDraft(() => setChurchOpen(false))}
            >
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={contactOpen} onOpenChange={setContactOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit contact details</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Phone</FieldLabel>
                <Input
                  value={draft.churchPhone}
                  onChange={(e) => setDraft({ ...draft, churchPhone: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Address</FieldLabel>
                <Input
                  value={draft.churchAddress}
                  onChange={(e) => setDraft({ ...draft, churchAddress: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>City</FieldLabel>
                <Input
                  value={draft.churchCity}
                  onChange={(e) => setDraft({ ...draft, churchCity: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>State</FieldLabel>
                <Input
                  value={draft.churchState}
                  onChange={(e) => setDraft({ ...draft, churchState: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Zip code</FieldLabel>
                <Input
                  value={draft.churchZip}
                  onChange={(e) => setDraft({ ...draft, churchZip: e.target.value })}
                />
              </Field>
            </FieldGroup>
          </SheetBody>
          <SheetFooter>
            <Button variant="outline" onClick={() => setContactOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]"
              disabled={save.isPending}
              onClick={() => saveDraft(() => setContactOpen(false))}
            >
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-8">
      <dt className="w-32 shrink-0 text-zinc-500">{label}</dt>
      <dd className="font-medium text-zinc-900">{value}</dd>
    </div>
  )
}
