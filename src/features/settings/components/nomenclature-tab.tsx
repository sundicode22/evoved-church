"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Spinner } from "@/components/ui/spinner"
import { TextFormField } from "@/components/form-fields"
import { toast } from "sonner"
import { useNomenclatureStore } from "@/features/settings/use-nomenclature"
import {
  useNomenclatureQuery,
  useUpdateNomenclature,
} from "@/features/settings/hooks/use-nomenclature-api"
import {
  nomenclatureFormSchema,
  type NomenclatureFormValues,
} from "@/features/settings/schemas"
import { CheckCircle2 } from "lucide-react"

function toFormValues(
  n: ReturnType<typeof useNomenclatureStore.getState>["nomenclature"]
): NomenclatureFormValues {
  return {
    churchName: n.churchName,
    currencyCode: n.currencyCode,
    memberTermSingular: n.memberTermSingular,
    memberTermPlural: n.memberTermPlural,
    groupTermSingular: n.groupTermSingular,
    campusTermSingular: n.campusTermSingular,
    pastorTermSingular: n.pastorTermSingular,
    givingTerm: n.givingTerm,
  }
}

export function NomenclatureTab({ canEdit }: { canEdit: boolean }) {
  const { nomenclature, resetToDefaults } = useNomenclatureStore()
  useNomenclatureQuery()
  const saveMutation = useUpdateNomenclature()

  const form = useForm<NomenclatureFormValues>({
    resolver: zodResolver(nomenclatureFormSchema),
    defaultValues: toFormValues(nomenclature),
  })

  React.useEffect(() => {
    form.reset(toFormValues(nomenclature), { keepDirtyValues: true })
  }, [nomenclature, form])

  const handleSave = (values: NomenclatureFormValues) => {
    saveMutation.mutate(values)
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSave)}
      className="max-w-3xl space-y-6 rounded-lg border border-border bg-card p-6 text-left shadow-xs md:p-8"
    >
      <div>
        <h3 className="text-sm font-semibold text-foreground">Terminology defaults</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Adapt labels to your denomination. Changes update tables, forms, and reports.
        </p>
      </div>

      <Form {...form}>
        <div className="grid grid-cols-1 gap-5 pt-2 md:grid-cols-2">
          <TextFormField
            control={form.control}
            name="churchName"
            label="Church / Organization Name"
            inputClassName="h-9 text-xs"
          />
          <TextFormField
            control={form.control}
            name="currencyCode"
            label="Currency"
            inputClassName="h-9 text-xs"
          />
          <TextFormField
            control={form.control}
            name="memberTermSingular"
            label="Member (singular)"
            inputClassName="h-9 text-xs"
          />
          <TextFormField
            control={form.control}
            name="memberTermPlural"
            label="Member (plural)"
            inputClassName="h-9 text-xs"
          />
          <TextFormField
            control={form.control}
            name="groupTermSingular"
            label="Group term"
            inputClassName="h-9 text-xs"
          />
          <TextFormField
            control={form.control}
            name="campusTermSingular"
            label="Location term"
            inputClassName="h-9 text-xs"
          />
          <TextFormField
            control={form.control}
            name="pastorTermSingular"
            label="Pastor / leader term"
            inputClassName="h-9 text-xs"
          />
          <TextFormField
            control={form.control}
            name="givingTerm"
            label="Giving term"
            inputClassName="h-9 text-xs"
          />
        </div>
      </Form>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetToDefaults()
            form.reset(toFormValues(useNomenclatureStore.getState().nomenclature))
            toast.info("Reset to default evangelical/standard terms.")
          }}
          className="h-9 text-xs text-zinc-500"
        >
          Reset to Defaults
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={!canEdit || saveMutation.isPending}
          className="h-9 gap-1.5 px-5 text-xs font-medium"
        >
          {saveMutation.isPending ? (
            <>
              <Spinner className="size-3.5" />
              Saving…
            </>
          ) : (
            <>
              <CheckCircle2 strokeWidth={2.5} className="size-3.5" />
              Save defaults
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
