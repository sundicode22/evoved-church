"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TextFormField } from "@/components/form-fields";
import { toast } from "sonner";
import { useNomenclatureStore } from "@/features/settings/use-nomenclature";
import {
  useNomenclatureQuery,
  useUpdateNomenclature,
} from "@/features/settings/hooks/use-nomenclature-api";
import {
  nomenclatureFormSchema,
  type NomenclatureFormValues,
} from "@/features/settings/schemas";
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
  const { nomenclature, resetToDefaults } = useNomenclatureStore();
  useNomenclatureQuery();
  const saveMutation = useUpdateNomenclature();

  const form = useForm<NomenclatureFormValues>({
    resolver: zodResolver(nomenclatureFormSchema),
    defaultValues: toFormValues(nomenclature),
  });

  // Sync from the stored nomenclature (e.g. after the API loads) without
  // clobbering fields the user has already edited.
  React.useEffect(() => {
    form.reset(toFormValues(nomenclature), { keepDirtyValues: true });
  }, [nomenclature, form]);

  const handleSave = (values: NomenclatureFormValues) => {
    saveMutation.mutate(values);
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSave)}
      className="max-w-3xl rounded-lg border border-zinc-200/80 bg-white p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6"
    >
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Ecclesiastical Nomenclature Dictionary
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Adapt the platform to your denomination or tradition. Changing these
          values immediately updates all table headers, labels, and reports.
        </p>
      </div>

      <Form {...form}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <TextFormField
            control={form.control}
            name="churchName"
            label="Church / Organization Name"
            inputClassName="h-9 text-xs"
          />
          <TextFormField
            control={form.control}
            name="currencyCode"
            label="Currency Code"
            inputClassName="h-9 text-xs uppercase"
          />
          <TextFormField
            control={form.control}
            name="memberTermSingular"
            label="Member Term (Singular)"
            placeholder="e.g. Member, Partner, Parishioner"
            inputClassName="h-9 text-xs"
          />
          <TextFormField
            control={form.control}
            name="memberTermPlural"
            label="Member Term (Plural)"
            placeholder="e.g. Members, Partners, Parishioners"
            inputClassName="h-9 text-xs"
          />
          <TextFormField
            control={form.control}
            name="groupTermSingular"
            label="Small Group Term"
            placeholder="e.g. Small Group, Life Group, Cell"
            inputClassName="h-9 text-xs"
          />
          <TextFormField
            control={form.control}
            name="campusTermSingular"
            label="Campus / Branch Term"
            placeholder="e.g. Campus, Branch, Parish, Assembly"
            inputClassName="h-9 text-xs"
          />
          <TextFormField
            control={form.control}
            name="pastorTermSingular"
            label="Pastoral Title"
            placeholder="e.g. Pastor, Minister, Priest, Elder"
            inputClassName="h-9 text-xs"
          />
          <TextFormField
            control={form.control}
            name="givingTerm"
            label="Giving & Tithe Term"
            placeholder="e.g. Tithes & Offerings, Stewardship"
            inputClassName="h-9 text-xs"
          />
        </div>
      </Form>

      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetToDefaults();
            form.reset(toFormValues(useNomenclatureStore.getState().nomenclature));
            toast.info("Reset to default evangelical/standard terms.");
          }}
          className="h-9 text-xs text-zinc-500"
        >
          Reset to Defaults
        </Button>

        <Button
          type="submit"
          variant="accent"
          disabled={!canEdit || saveMutation.isPending}
          className="h-9 gap-1.5 px-5 text-xs font-normal"
        >
          <CheckCircle2
            strokeWidth={2.5}
            className="size-3.5"
          />
          <span>Save Nomenclature</span>
        </Button>
      </div>
    </form>
  );
}
