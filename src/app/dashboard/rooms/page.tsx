"use client"

import * as React from "react"
import { DoorOpen, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Form, FormField } from "@/components/ui/form"
import {
  NumberFormField,
  TextFormField,
} from "@/components/form-fields"
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
import { TablePanel } from "@/components/table-panel"
import { useCreateRoom, useRooms } from "@/features/facilities/hooks/use-facilities"
import { createRoomSchema } from "@/features/facilities/schemas"

const roomFormSchema = createRoomSchema
  .pick({ name: true, capacity: true, locationNote: true })
  .extend({ requiresApproval: z.boolean() })

type RoomFormValues = z.infer<typeof roomFormSchema>

const emptyForm: RoomFormValues = {
  name: "",
  capacity: undefined,
  locationNote: "",
  requiresApproval: false,
}

export default function RoomsPage() {
  const { data, isLoading } = useRooms()
  const create = useCreateRoom()
  const [open, setOpen] = React.useState(false)
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: emptyForm,
  })

  function openCreate() {
    form.reset(emptyForm)
    setOpen(true)
  }

  function submit(values: RoomFormValues) {
    create.mutate(
      {
        name: values.name,
        capacity: values.capacity,
        locationNote: values.locationNote ?? "",
        requiresApproval: values.requiresApproval,
        isActive: true,
      },
      {
        onSuccess: () => {
          setOpen(false)
          form.reset(emptyForm)
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
        <RequireAbility permission="facilities.read">
          <PageHeader
            title="Rooms"
            description="Bookable spaces across your locations."
            icon={<DoorOpen className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <Can permission="facilities.write">
                <Button
                  onClick={openCreate}
                >
                  <Plus strokeWidth={2} className="size-3.5" />
                  Add room
                </Button>
              </Can>
            }
          />

          <div className="p-6 md:p-8">
            {!isLoading && (data?.length ?? 0) === 0 ? (
              <Empty className="rounded-lg border border-zinc-200/80 py-16">
                <EmptyHeader>
                  <EmptyTitle>No rooms yet</EmptyTitle>
                  <EmptyDescription>
                    Add sanctuaries, classrooms, and fellowship spaces to start booking.
                  </EmptyDescription>
                </EmptyHeader>
                <Can permission="facilities.write">
                  <Button className="mt-4"
                    onClick={openCreate}
                  >
                    Create room
                  </Button>
                </Can>
              </Empty>
            ) : (
              <TablePanel>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Room</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Approval</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading &&
                      [0, 1, 2].map((i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={4} className="pl-4">
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        </TableRow>
                      ))}
                    {(data ?? []).map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="pl-4">
                          <p className="font-medium text-zinc-900">{room.name}</p>
                          <p className="text-xs text-zinc-400">
                            {room.locationNote || "No location note"}
                          </p>
                        </TableCell>
                        <TableCell>{room.capacity ?? "—"}</TableCell>
                        <TableCell>
                          {room.requiresApproval ? (
                            <Badge variant="outline" className="text-[10px]">
                              Required
                            </Badge>
                          ) : (
                            <span className="text-xs text-zinc-400">Open</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              room.isActive
                                ? "border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
                                : "text-[10px]"
                            }
                          >
                            {room.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TablePanel>
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="right" inset size="md" className="p-0">
              <Form {...form}>
              <form onSubmit={form.handleSubmit(submit)} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle>Add room</SheetTitle>
                  <SheetDescription>
                    Name the space, set capacity, and whether bookings need approval.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <FieldGroup>
                    <TextFormField control={form.control} name="name" label="Name" />
                    <NumberFormField
                      control={form.control}
                      name="capacity"
                      label="Capacity"
                      min={0}
                      step={1}
                    />
                    <TextFormField
                      control={form.control}
                      name="locationNote"
                      label="Location note"
                      placeholder="Building / floor"
                    />
                    <FormField
                      control={form.control}
                      name="requiresApproval"
                      render={({ field }) => (
                        <Field className="flex flex-row items-center justify-between gap-3">
                          <FieldLabel>Requires approval</FieldLabel>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </Field>
                      )}
                    />
                  </FieldGroup>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={create.isPending}>
                    Save room
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
