"use client"

import * as React from "react"
import { Plus, UsersRound } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { SelectFormField, TextFormField } from "@/components/form-fields"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Can, RequireAbility } from "@/components/auth/can"
import { ImageUpload } from "@/components/image-upload"
import { RowActionsMenu } from "@/components/row-actions-menu"
import {
  ColumnCustomize,
  StatusPill,
  TableAddButton,
  TableChrome,
  TablePagination,
  TablePanel,
  TableSearch,
  useColumnVisibility,
  type ColumnOption,
} from "@/components/table-panel"
import { useCreateGroup, useGroups } from "@/features/groups/hooks/use-groups"
import {
  GROUP_TYPE_LABELS,
  GROUP_TYPES,
  groupTypeSchema,
} from "@/features/groups/schemas"

const groupFormSchema = z.object({
  name: z.string().trim().min(2, "Group name is required"),
  type: groupTypeSchema,
  imageUrl: z.string(),
})

type GroupFormValues = z.infer<typeof groupFormSchema>

const GROUP_FORM_DEFAULTS: GroupFormValues = { name: "", type: "public", imageUrl: "" }

const GROUP_TYPE_OPTIONS = GROUP_TYPES.map((t) => ({ value: t, label: GROUP_TYPE_LABELS[t] }))

const COLUMNS: ColumnOption[] = [
  { id: "name", label: "Group" },
  { id: "type", label: "Type" },
  { id: "leader", label: "Leader" },
  { id: "members", label: "Members" },
  { id: "status", label: "Status" },
]

export default function GroupsPage() {
  const { data, isLoading } = useGroups()
  const create = useCreateGroup()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: GROUP_FORM_DEFAULTS,
  })

  React.useEffect(() => {
    if (sheetOpen) form.reset(GROUP_FORM_DEFAULTS)
  }, [sheetOpen, form])

  const rows = data ?? []
  const filtered = rows.filter(
    (g) =>
      !searchQuery.trim() ||
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.leaderName || "").toLowerCase().includes(searchQuery.toLowerCase())
  )
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const isEmpty = !isLoading && rows.length === 0

  function onSubmit(values: GroupFormValues) {
    create.mutate(
      {
        name: values.name,
        type: values.type,
        imageUrl: values.imageUrl.trim() || null,
      },
      {
        onSuccess: () => {
          setSheetOpen(false)
          form.reset(GROUP_FORM_DEFAULTS)
        },
      }
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-background">
        <RequireAbility permission="groups.read">
          <PageHeader
            title="Groups"
            description="Small groups, teams, and cell ministry."
            icon={<UsersRound className="size-5 text-brand" strokeWidth={1.75} />}
          />

          <div className="p-6 md:p-8">
            {isEmpty ? (
              <Empty className="rounded-lg border border-border/80 py-16">
                <EmptyHeader>
                  <EmptyTitle>No groups yet</EmptyTitle>
                  <EmptyDescription>
                    Create a public group, private circle, or serving team to get started.
                  </EmptyDescription>
                </EmptyHeader>
                <Can permission="groups.write">
                  <Button
                    variant="primary"
                    className="mt-4 gap-1.5"
                    onClick={() => setSheetOpen(true)}
                  >
                    <Plus className="size-4" strokeWidth={1.75} />
                    Create group
                  </Button>
                </Can>
              </Empty>
            ) : (
              <TablePanel>
                <TableChrome
                  search={
                    <TableSearch
                      value={searchQuery}
                      onChange={(v) => {
                        setSearchQuery(v)
                        setPage(1)
                      }}
                      placeholder="Search groups…"
                    />
                  }
                  trailing={
                    <>
                      <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
                      <Can permission="groups.write">
                        <TableAddButton onClick={() => setSheetOpen(true)}>
                          <Plus className="size-3.5" strokeWidth={1.75} />
                          Create group
                        </TableAddButton>
                      </Can>
                    </>
                  }
                />
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {isVisible("name") && <TableHead className="pl-4">Group</TableHead>}
                      {isVisible("type") && <TableHead>Type</TableHead>}
                      {isVisible("leader") && <TableHead>Leader</TableHead>}
                      {isVisible("members") && <TableHead>Members</TableHead>}
                      {isVisible("status") && <TableHead>Status</TableHead>}
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading &&
                      [0, 1, 2].map((i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={6} className="pl-4">
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        </TableRow>
                      ))}
                    {pageRows.map((group) => (
                      <TableRow key={group.id}>
                        {isVisible("name") && (
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-3">
                              {group.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={group.imageUrl}
                                  alt=""
                                  className="size-8 rounded-md object-cover"
                                />
                              ) : (
                                <div className="flex size-8 items-center justify-center rounded-md bg-brand-soft text-xs font-medium text-brand-ink">
                                  {group.name.slice(0, 1)}
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-foreground">{group.name}</div>
                                {group.description && (
                                  <div className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                                    {group.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        )}
                        {isVisible("type") && (
                          <TableCell>
                            <StatusPill>{GROUP_TYPE_LABELS[group.type]}</StatusPill>
                          </TableCell>
                        )}
                        {isVisible("leader") && (
                          <TableCell className="text-muted-foreground">
                            {group.leaderName || "—"}
                          </TableCell>
                        )}
                        {isVisible("members") && (
                          <TableCell className="tabular-nums text-muted-foreground">
                            {group.memberCount}
                          </TableCell>
                        )}
                        {isVisible("status") && (
                          <TableCell>
                            <StatusPill tone={group.isActive ? "success" : "neutral"}>
                              {group.isActive ? "Active" : "Inactive"}
                            </StatusPill>
                          </TableCell>
                        )}
                        <TableCell className="pr-3 text-right">
                          <RowActionsMenu
                            groups={[{ items: [{ label: "Open", onClick: () => {} }] }]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  page={page}
                  pageSize={pageSize}
                  total={filtered.length}
                  onPageChange={setPage}
                  onPageSizeChange={(s) => {
                    setPageSize(s)
                    setPage(1)
                  }}
                />
              </TablePanel>
            )}
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="right" inset size="sm" className="p-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
                  <SheetHeader className="pr-12">
                    <SheetTitle className="font-medium">Create group</SheetTitle>
                    <SheetDescription>
                      Name the group, choose a type, and upload an optional cover image.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <FieldGroup>
                      <TextFormField control={form.control} name="name" label="Name" />
                      <SelectFormField
                        control={form.control}
                        name="type"
                        label="Group type"
                        placeholder="Select group type"
                        options={GROUP_TYPE_OPTIONS}
                      />
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <ImageUpload
                                label="Group image (optional)"
                                value={field.value}
                                onChange={field.onChange}
                                previewClassName="aspect-square max-h-48 object-cover"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </FieldGroup>
                  </SheetBody>
                  <SheetFooter>
                    <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={create.isPending}>
                      {create.isPending ? "Saving…" : "Create group"}
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
