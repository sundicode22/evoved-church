"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Can } from "@/components/auth/can"
import {
  useCreateRole,
  usePermissionCatalog,
  useRoles,
  useSaveRolePermissions,
  type PermissionRecord,
  type RoleRecord,
} from "@/features/settings/hooks/use-rbac"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, PlusSignIcon, InformationCircleIcon } from "@hugeicons/core-free-icons"

function groupPermissions(perms: PermissionRecord[]) {
  const groups = new Map<string, PermissionRecord[]>()
  for (const p of perms) {
    groups.set(p.groupName, [...(groups.get(p.groupName) ?? []), p])
  }
  return [...groups.entries()]
}

function CreateRoleSheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: (role: RoleRecord) => void
}) {
  const create = useCreateRole()
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    create.mutate(
      { name, description: description || undefined },
      {
        onSuccess: (role) => {
          onOpenChange(false)
          setName("")
          setDescription("")
          onCreated(role)
        },
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" inset size="sm" className="p-0">
        <form onSubmit={submit} className="flex h-full flex-col">
          <SheetHeader className="pr-12">
            <SheetTitle>Create role</SheetTitle>
            <SheetDescription>
              New roles start with no permissions; assign them in the matrix.
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Role name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </SheetBody>
          <SheetFooter>
            <Button type="button" variant="outline" className="h-9" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={create.isPending || name.trim().length < 2}
              className="h-9 bg-[#22c55e] text-white hover:bg-[#16a34a]"
            >
              Create role
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export function RolesPermissionsTab() {
  const { data: roles, isLoading: rolesLoading } = useRoles()
  const { data: permissions, isLoading: permsLoading } = usePermissionCatalog()
  const save = useSaveRolePermissions()
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  // Unsaved edits per role; absent entry means "show the saved permissions".
  const [edits, setEdits] = React.useState<Record<string, Set<string>>>({})
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const selected = roles?.find((r) => r.id === (selectedId ?? roles[0]?.id))
  const grouped = React.useMemo(() => groupPermissions(permissions ?? []), [permissions])

  const checked = React.useMemo(
    () =>
      selected
        ? (edits[selected.id] ??
          new Set(selected.isAdmin ? (permissions ?? []).map((p) => p.key) : selected.permissionKeys))
        : new Set<string>(),
    [edits, selected, permissions]
  )

  const setChecked = (updater: (prev: Set<string>) => Set<string>) => {
    if (!selected) return
    setEdits((prev) => ({ ...prev, [selected.id]: updater(prev[selected.id] ?? checked) }))
  }

  const dirty =
    selected && !selected.isAdmin
      ? checked.size !== selected.permissionKeys.length ||
        selected.permissionKeys.some((k) => !checked.has(k))
      : false

  function toggle(key: string, on: boolean) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (on) next.add(key)
      else next.delete(key)
      return next
    })
  }

  function toggleGroup(items: PermissionRecord[], on: boolean) {
    setChecked((prev) => {
      const next = new Set(prev)
      items.forEach((p) => (on ? next.add(p.key) : next.delete(p.key)))
      return next
    })
  }

  if (rolesLoading || permsLoading) return <Skeleton className="h-96 w-full rounded-2xl" />

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      <div className="space-y-2 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-xs">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Roles</span>
          <Can permission="settings.roles">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setDialogOpen(true)}
              aria-label="Create role"
              className="text-emerald-700"
            >
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-4" />
            </Button>
          </Can>
        </div>
        {roles?.map((role) => {
          const active = role.id === selected?.id
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedId(role.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                active
                  ? "bg-[#eaf5ea] font-semibold text-[#1b5e20]"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <span className="truncate">{role.name}</span>
              {role.isAdmin && (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700">
                  Admin
                </Badge>
              )}
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
        {selected ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">{selected.name}</h3>
                <p className="mt-1 text-xs text-zinc-400">
                  {selected.isAdmin
                    ? "Administrators always have every permission."
                    : selected.description || "Choose what this role can see and do."}
                </p>
              </div>
              <Can permission="settings.roles">
                <Button
                  disabled={!dirty || save.isPending || selected.isAdmin}
                  onClick={() =>
                    save.mutate(
                      { roleId: selected.id, permissionKeys: [...checked] },
                      {
                        onSuccess: () =>
                          setEdits((prev) => {
                            const rest = { ...prev }
                            delete rest[selected.id]
                            return rest
                          }),
                      }
                    )
                  }
                  className="h-9 gap-1.5 rounded-lg bg-[#22c55e] px-4 text-xs font-normal text-white shadow-xs hover:bg-[#16a34a]"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2.5} className="size-3.5" />
                  Save permissions
                </Button>
              </Can>
            </div>

            {selected.isAdmin && (
              <Alert className="border-emerald-200 bg-emerald-50/80 text-emerald-900">
                <HugeiconsIcon icon={InformationCircleIcon} className="size-3.5" />
                <AlertTitle>Administrator wildcard</AlertTitle>
                <AlertDescription>
                  This role always receives every permission. The matrix below is read-only.
                </AlertDescription>
              </Alert>
            )}

            <ScrollArea className="h-[min(520px,60vh)] pr-3">
              <Accordion multiple defaultValue={grouped.map(([g]) => g)} className="rounded-xl border-zinc-200">
                {grouped.map(([group, items]) => {
                  const allOn = items.every((p) => checked.has(p.key))
                  return (
                    <AccordionItem key={group} value={group}>
                      <AccordionTrigger className="px-3 py-2.5 hover:no-underline">
                        <div className="flex w-full items-center justify-between gap-3 pr-2">
                          <span className="text-xs font-semibold text-zinc-800">{group}</span>
                          <span className="text-[10px] font-medium text-zinc-400">
                            {items.filter((p) => checked.has(p.key) || selected.isAdmin).length}/
                            {items.length}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3">
                        <div className="mb-2 flex justify-end">
                          <Can permission="settings.roles">
                            <button
                              type="button"
                              disabled={selected.isAdmin}
                              onClick={() => toggleGroup(items, !allOn)}
                              className="text-[11px] font-medium text-emerald-700 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {allOn ? "Clear group" : "Select all in group"}
                            </button>
                          </Can>
                        </div>
                        <div className="space-y-2.5">
                          {items.map((p) => (
                            <label
                              key={p.key}
                              className="flex cursor-pointer items-start gap-2.5 text-xs text-zinc-700"
                            >
                              <Checkbox
                                checked={selected.isAdmin || checked.has(p.key)}
                                disabled={selected.isAdmin}
                                onCheckedChange={(v) => toggle(p.key, Boolean(v))}
                                className="mt-0.5"
                              />
                              <span>
                                {p.label}
                                <span className="block font-mono text-[10px] text-zinc-400">{p.key}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </ScrollArea>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No roles found.</p>
        )}
      </div>

      <CreateRoleSheet open={dialogOpen} onOpenChange={setDialogOpen} onCreated={(r) => setSelectedId(r.id)} />
    </div>
  )
}
