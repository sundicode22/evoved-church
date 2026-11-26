"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { TextFormField } from "@/components/form-fields"
import { ImageUpload } from "@/components/image-upload"
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
import {
  churchContactFormSchema,
  churchDetailsFormSchema,
  type ChurchContactFormValues,
  type ChurchDetailsFormValues,
} from "@/features/settings/schemas"

function dash(v?: string | null) {
  return v && v.trim() ? v : "—"
}

export function ChurchDetailsTab({ canEdit }: { canEdit: boolean }) {
  const { nomenclature } = useNomenclatureStore()
  useNomenclatureQuery()
  const save = useUpdateNomenclature()

  const [churchOpen, setChurchOpen] = React.useState(false)
  const [contactOpen, setContactOpen] = React.useState(false)

  const churchForm = useForm<ChurchDetailsFormValues>({
    resolver: zodResolver(churchDetailsFormSchema),
    defaultValues: {
      churchName: nomenclature.churchName,
      churchEmail: nomenclature.churchEmail,
      logoUrl: nomenclature.logoUrl,
    },
  })
  const contactForm = useForm<ChurchContactFormValues>({
    resolver: zodResolver(churchContactFormSchema),
    defaultValues: {
      churchPhone: nomenclature.churchPhone,
      churchAddress: nomenclature.churchAddress,
      churchCity: nomenclature.churchCity,
      churchState: nomenclature.churchState,
      churchZip: nomenclature.churchZip,
    },
  })

  // Re-sync each form from the stored settings whenever its sheet opens.
  React.useEffect(() => {
    if (!churchOpen) return
    churchForm.reset({
      churchName: nomenclature.churchName,
      churchEmail: nomenclature.churchEmail,
      logoUrl: nomenclature.logoUrl,
    })
  }, [churchOpen, nomenclature, churchForm])

  React.useEffect(() => {
    if (!contactOpen) return
    contactForm.reset({
      churchPhone: nomenclature.churchPhone,
      churchAddress: nomenclature.churchAddress,
      churchCity: nomenclature.churchCity,
      churchState: nomenclature.churchState,
      churchZip: nomenclature.churchZip,
    })
  }, [contactOpen, nomenclature, contactForm])

  function saveChurch(values: ChurchDetailsFormValues) {
    save.mutate(values, { onSuccess: () => setChurchOpen(false) })
  }

  function saveContact(values: ChurchContactFormValues) {
    save.mutate(values, { onSuccess: () => setContactOpen(false) })
  }

  return (
    <div className="max-w-3xl space-y-8 text-left">
      <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wide text-brand">Church details</p>
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
                  <span className="text-xs font-semibold tracking-tight text-brand">Ev</span>
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

      <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wide text-brand">Contact details</p>
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
        <SheetContent side="right" inset size="sm" className="p-0">
          <form
            onSubmit={churchForm.handleSubmit(saveChurch)}
            className="flex h-full flex-col"
          >
            <SheetHeader>
              <SheetTitle>Edit church details</SheetTitle>
            </SheetHeader>
            <SheetBody>
              <Form {...churchForm}>
                <FieldGroup className="gap-4">
                  <TextFormField
                    control={churchForm.control}
                    name="churchName"
                    label="Church name"
                  />
                  <TextFormField
                    control={churchForm.control}
                    name="churchEmail"
                    label="Email"
                    type="email"
                  />
                  <FormField
                    control={churchForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <ImageUpload
                          label="Church logo"
                          hint="PNG, JPG, or WebP · max 1 MB"
                          maxBytes={1024 * 1024}
                          value={field.value}
                          onChange={field.onChange}
                          previewClassName="aspect-square max-h-40 w-auto mx-auto object-contain bg-white"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FieldGroup>
              </Form>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setChurchOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={save.isPending}>
                {save.isPending ? (
                  <>
                    <Spinner className="size-3.5" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={contactOpen} onOpenChange={setContactOpen}>
        <SheetContent side="right" inset size="sm" className="p-0">
          <form
            onSubmit={contactForm.handleSubmit(saveContact)}
            className="flex h-full flex-col"
          >
            <SheetHeader>
              <SheetTitle>Edit contact details</SheetTitle>
            </SheetHeader>
            <SheetBody>
              <Form {...contactForm}>
                <FieldGroup className="gap-4">
                  <TextFormField control={contactForm.control} name="churchPhone" label="Phone" />
                  <TextFormField
                    control={contactForm.control}
                    name="churchAddress"
                    label="Address"
                  />
                  <TextFormField control={contactForm.control} name="churchCity" label="City" />
                  <TextFormField control={contactForm.control} name="churchState" label="State" />
                  <TextFormField control={contactForm.control} name="churchZip" label="Zip code" />
                </FieldGroup>
              </Form>
            </SheetBody>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setContactOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={save.isPending}>
                {save.isPending ? (
                  <>
                    <Spinner className="size-3.5" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-8">
      <dt className="w-32 shrink-0 text-zinc-500">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}
