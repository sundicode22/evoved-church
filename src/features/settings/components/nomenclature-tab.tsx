"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNomenclatureStore } from "@/features/settings/use-nomenclature";
import {
  useNomenclatureQuery,
  useUpdateNomenclature,
} from "@/features/settings/hooks/use-nomenclature-api";
import { CheckCircle2 } from "lucide-react"

export function NomenclatureTab({ canEdit }: { canEdit: boolean }) {
  const { nomenclature, resetToDefaults } = useNomenclatureStore();
  useNomenclatureQuery();
  const saveMutation = useUpdateNomenclature();
  // Unsaved edits layered over the stored nomenclature.
  const [edits, setEdits] = React.useState<Partial<typeof nomenclature>>({});
  const formState = { ...nomenclature, ...edits };
  const setFormState = (next: typeof nomenclature) => setEdits(next);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formState);
  };

  return (
    <form
      onSubmit={handleSave}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Church / Organization Name
          </Label>
          <Input
            value={formState.churchName}
            onChange={(e) =>
              setFormState({ ...formState, churchName: e.target.value })
            }
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Currency Code
          </Label>
          <Input
            value={formState.currencyCode}
            onChange={(e) =>
              setFormState({ ...formState, currencyCode: e.target.value })
            }
            className="h-9 text-xs uppercase"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Member Term (Singular)
          </Label>
          <Input
            value={formState.memberTermSingular}
            onChange={(e) =>
              setFormState({ ...formState, memberTermSingular: e.target.value })
            }
            placeholder="e.g. Member, Partner, Parishioner"
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Member Term (Plural)
          </Label>
          <Input
            value={formState.memberTermPlural}
            onChange={(e) =>
              setFormState({ ...formState, memberTermPlural: e.target.value })
            }
            placeholder="e.g. Members, Partners, Parishioners"
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Small Group Term
          </Label>
          <Input
            value={formState.groupTermSingular}
            onChange={(e) =>
              setFormState({ ...formState, groupTermSingular: e.target.value })
            }
            placeholder="e.g. Small Group, Life Group, Cell"
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Campus / Branch Term
          </Label>
          <Input
            value={formState.campusTermSingular}
            onChange={(e) =>
              setFormState({ ...formState, campusTermSingular: e.target.value })
            }
            placeholder="e.g. Campus, Branch, Parish, Assembly"
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Pastoral Title
          </Label>
          <Input
            value={formState.pastorTermSingular}
            onChange={(e) =>
              setFormState({ ...formState, pastorTermSingular: e.target.value })
            }
            placeholder="e.g. Pastor, Minister, Priest, Elder"
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Giving & Tithe Term
          </Label>
          <Input
            value={formState.givingTerm}
            onChange={(e) =>
              setFormState({ ...formState, givingTerm: e.target.value })
            }
            placeholder="e.g. Tithes & Offerings, Stewardship"
            className="h-9 text-xs"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetToDefaults();
            setEdits({});
            toast.info("Reset to default evangelical/standard terms.");
          }}
          className="h-9 text-xs text-zinc-500"
        >
          Reset to Defaults
        </Button>

        <Button
          type="submit"
          disabled={!canEdit || saveMutation.isPending}
          className="h-9 px-5 rounded-lg bg-[var(--accent-cta)] hover:bg-[var(--accent-cta)] text-white text-xs font-normal gap-1.5 shadow-xs"
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
