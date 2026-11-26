"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import { TextFormField } from "@/components/form-fields"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ConfirmAction } from "@/components/confirm-action"
import { Spinner } from "@/components/ui/spinner"
import {
  useCreateKanbanColumn,
  useDeleteKanbanColumn,
  useKanbanColumns,
  useReorderKanbanColumns,
  useUpdateKanbanColumn,
} from "@/features/kanban/hooks/use-kanban-columns"
import type { KanbanBoardType, KanbanColumn } from "@/features/kanban/schemas"

const addSchema = z.object({
  label: z.string().trim().min(2, "Label is required"),
})
type AddValues = z.infer<typeof addSchema>

const renameSchema = z.object({
  label: z.string().trim().min(2, "Label is required"),
})
type RenameValues = z.infer<typeof renameSchema>

export function ManageColumnsSheet({
  boardType,
  open,
  onOpenChange,
  title = "Manage columns",
}: {
  boardType: KanbanBoardType
  open: boolean
  onOpenChange: (o: boolean) => void
  title?: string
}) {
  const { data: columns = [], isLoading } = useKanbanColumns(boardType)
  const create = useCreateKanbanColumn(boardType)
  const update = useUpdateKanbanColumn(boardType)
  const reorder = useReorderKanbanColumns(boardType)
  const remove = useDeleteKanbanColumn(boardType)

  const [renaming, setRenaming] = React.useState<KanbanColumn | null>(null)
  const [deleting, setDeleting] = React.useState<KanbanColumn | null>(null)

  const addForm = useForm<AddValues>({
    resolver: zodResolver(addSchema),
    defaultValues: { label: "" },
  })
  const renameForm = useForm<RenameValues>({
    resolver: zodResolver(renameSchema),
    defaultValues: { label: "" },
  })

  React.useEffect(() => {
    if (renaming) renameForm.reset({ label: renaming.label })
  }, [renaming, renameForm])

  const sorted = React.useMemo(
    () => columns.slice().sort((a, b) => a.orderIndex - b.orderIndex),
    [columns]
  )

  function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= sorted.length) return
    const next = sorted.slice()
    ;[next[index], next[target]] = [next[target], next[index]]
    reorder.mutate(next.map((c) => c.key))
  }

  function onAdd(values: AddValues) {
    create.mutate(
      { label: values.label },
      { onSuccess: () => addForm.reset({ label: "" }) }
    )
  }

  function onRename(values: RenameValues) {
    if (!renaming) return
    update.mutate(
      { id: renaming.id, label: values.label },
      { onSuccess: () => setRenaming(null) }
    )
  }

  const moveToFallback = deleting
    ? sorted.find((c) => c.key !== deleting.key)?.key
    : undefined

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" inset size="md" className="bg-white p-0">
          <SheetHeader className="pr-12">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>
              Add, rename, reorder, or remove columns. Cards in a removed column move to
              another stage.
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="gap-5">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Spinner className="size-4" /> Loading columns…
              </div>
            ) : (
              <ul className="space-y-2">
                {sorted.map((col, i) => (
                  <li
                    key={col.id}
                    className="flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-[#f4f6f5] px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900">{col.label}</p>
                      <p className="truncate text-[11px] text-zinc-400">{col.key}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-7"
                      disabled={i === 0 || reorder.isPending}
                      onClick={() => move(i, -1)}
                      aria-label="Move left"
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-7"
                      disabled={i === sorted.length - 1 || reorder.isPending}
                      onClick={() => move(i, 1)}
                      aria-label="Move right"
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-7"
                      onClick={() => setRenaming(col)}
                      aria-label="Rename"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-7 text-zinc-500 hover:text-red-600"
                      disabled={sorted.length <= 1}
                      onClick={() => setDeleting(col)}
                      aria-label="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <Form {...addForm}>
              <form
                onSubmit={addForm.handleSubmit(onAdd)}
                className="space-y-3 rounded-xl border border-dashed border-zinc-300 p-4"
              >
                <p className="text-sm font-normal text-zinc-700">
                  Add column
                </p>
                <FieldGroup>
                  <TextFormField
                    control={addForm.control}
                    name="label"
                    label="Column name"
                    placeholder="e.g. Discipleship class"
                    autoFocus
                  />
                </FieldGroup>
                <Button type="submit" variant="primary" disabled={create.isPending}>
                  {create.isPending ? (
                    <>
                      <Spinner className="size-3.5" />
                      Adding…
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" />
                      Add column
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </SheetBody>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(renaming)} onOpenChange={(o) => !o && setRenaming(null)}>
        <SheetContent side="right" inset size="sm" className="bg-white p-0">
          <Form {...renameForm}>
            <form
              onSubmit={renameForm.handleSubmit(onRename)}
              className="flex h-full flex-col"
            >
              <SheetHeader className="pr-12">
                <SheetTitle>Rename column</SheetTitle>
                <SheetDescription>
                  Updates the label on the board. The internal key stays the same.
                </SheetDescription>
              </SheetHeader>
              <SheetBody>
                <FieldGroup>
                  <TextFormField
                    control={renameForm.control}
                    name="label"
                    label="Column name"
                    autoFocus
                  />
                </FieldGroup>
              </SheetBody>
              <SheetFooter>
                <Button type="button" variant="outline" onClick={() => setRenaming(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={update.isPending}>
                  Save
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <ConfirmAction
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Remove “${deleting?.label}”?`}
        description={
          moveToFallback
            ? `Cards in this column will move to “${sorted.find((c) => c.key === moveToFallback)?.label || moveToFallback}”.`
            : "This column will be removed."
        }
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={async () => {
          if (!deleting) return
          await remove.mutateAsync({ id: deleting.id, moveTo: moveToFallback })
          setDeleting(null)
        }}
      />
    </>
  )
}
