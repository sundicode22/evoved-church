"use client"

import * as React from "react"
import { Home, Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { TextFormField } from "@/components/form-fields"
import { FieldGroup } from "@/components/ui/field"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Can, RequireAbility } from "@/components/auth/can"
import {
  ColumnCustomize,
  TableAddButton,
  TableChrome,
  TablePagination,
  TablePanel,
  TableSearch,
  useColumnVisibility,
  type ColumnOption,
} from "@/components/table-panel"
import {
  useCreateHousehold,
  useHouseholds,
} from "@/features/members/hooks/use-members"
import {
  createHouseholdSchema,
  HOUSEHOLD_ROLE_LABELS,
  type HouseholdRole,
} from "@/features/members/schemas"
import { useBranchStore } from "@/store/use-branch-store"

const COLUMNS: ColumnOption[] = [
  { id: "name", label: "Household" },
  { id: "members", label: "Members" },
  { id: "roles", label: "Roles" },
  { id: "address", label: "Address" },
  { id: "city", label: "City" },
  { id: "state", label: "State" },
  { id: "zip", label: "ZIP" },
  { id: "contact", label: "Primary contact" },
]

const familyFormSchema = createHouseholdSchema.omit({ campusId: true })
type FamilyFormValues = z.infer<typeof familyFormSchema>

const FAMILY_DEFAULTS: FamilyFormValues = {
  name: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
}

function roleLabel(role?: string | null) {
  if (!role) return "—"
  return HOUSEHOLD_ROLE_LABELS[role as HouseholdRole] || role
}

function formatAddress(parts: {
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
}) {
  return [parts.address, parts.city, parts.state, parts.zipCode].filter(Boolean).join(", ")
}

type HouseholdMember = {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phoneNumber?: string | null
  householdRole?: string | null
  personType?: string
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
}

type HouseholdRow = {
  id: string
  name: string
  memberCount?: number
  members?: HouseholdMember[]
  city?: string | null
  state?: string | null
  address?: string | null
  zipCode?: string | null
}

export default function FamiliesPage() {
  const { data, isLoading } = useHouseholds()
  const create = useCreateHousehold()
  const activeCampusId = useBranchStore((s) => s.activeCampusId)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)

  const form = useForm<FamilyFormValues>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: FAMILY_DEFAULTS,
  })

  React.useEffect(() => {
    if (sheetOpen) form.reset(FAMILY_DEFAULTS)
  }, [sheetOpen, form])

  const rows = (data ?? []) as HouseholdRow[]
  const filtered = rows.filter((hh) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const blob = [
      hh.name,
      hh.address,
      hh.city,
      hh.state,
      hh.zipCode,
      ...(hh.members || []).flatMap((m) => [
        m.firstName,
        m.lastName,
        m.email,
        m.phoneNumber,
      ]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    return blob.includes(q)
  })
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  async function onSubmit(values: FamilyFormValues) {
    await create.mutateAsync({
      ...values,
      campusId: activeCampusId || undefined,
    })
    setSheetOpen(false)
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
      <SidebarInset className="min-h-screen bg-white">
        <RequireAbility permission="members.read">
          <PageHeader
            title="Families"
            description="Households linked to church members."
            icon={<Home className="size-5 text-brand" strokeWidth={1.75} />}
          />

          <div className="w-full p-6 md:p-8">
            <TablePanel className="w-full min-w-0">
              <TableChrome
                search={
                  <TableSearch
                    value={searchQuery}
                    onChange={(v) => {
                      setSearchQuery(v)
                      setPage(1)
                    }}
                    placeholder="Search households, people, address…"
                  />
                }
                trailing={
                  <>
                    <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
                    <Can permission="members.write">
                      <TableAddButton onClick={() => setSheetOpen(true)}>
                        <Plus className="size-3.5" strokeWidth={1.75} />
                        Add family
                      </TableAddButton>
                    </Can>
                  </>
                }
              />
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {isVisible("name") && <TableHead>Household</TableHead>}
                    {isVisible("members") && <TableHead>Members</TableHead>}
                    {isVisible("roles") && <TableHead>Roles</TableHead>}
                    {isVisible("address") && <TableHead>Address</TableHead>}
                    {isVisible("city") && <TableHead>City</TableHead>}
                    {isVisible("state") && <TableHead>State</TableHead>}
                    {isVisible("zip") && <TableHead>ZIP</TableHead>}
                    {isVisible("contact") && <TableHead>Primary contact</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading &&
                    [0, 1, 2].map((i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={8}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  {!isLoading && pageRows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="py-12 text-center text-sm text-muted-foreground"
                      >
                        No households yet. Create a family, then link members from the Members
                        drawer.
                      </TableCell>
                    </TableRow>
                  )}
                  {pageRows.map((hh) => {
                    const head =
                      hh.members?.find(
                        (m) =>
                          m.householdRole === "head" ||
                          m.householdRole === "father" ||
                          m.householdRole === "mother"
                      ) || hh.members?.[0]
                    return (
                      <TableRow key={hh.id}>
                        {isVisible("name") && (
                          <TableCell className="font-medium text-foreground">
                            {hh.name}
                            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                              {hh.memberCount ?? hh.members?.length ?? 0} people
                            </span>
                          </TableCell>
                        )}
                        {isVisible("members") && (
                          <TableCell className="text-muted-foreground">
                            {hh.members?.length ? (
                              <ul className="space-y-0.5 text-sm">
                                {hh.members.map((m) => (
                                  <li key={m.id}>
                                    {m.firstName} {m.lastName}
                                    <span className="text-muted-foreground/80">
                                      {" "}
                                      · {roleLabel(m.householdRole)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span>—</span>
                            )}
                          </TableCell>
                        )}
                        {isVisible("roles") && (
                          <TableCell className="text-muted-foreground">
                            {(hh.members || [])
                              .map((m) => roleLabel(m.householdRole))
                              .filter((r, i, arr) => arr.indexOf(r) === i)
                              .join(" · ") || "—"}
                          </TableCell>
                        )}
                        {isVisible("address") && (
                          <TableCell className="text-muted-foreground">
                            {hh.address ||
                              head?.address ||
                              formatAddress({
                                city: hh.city,
                                state: hh.state,
                                zipCode: hh.zipCode,
                              }) ||
                              "—"}
                          </TableCell>
                        )}
                        {isVisible("city") && (
                          <TableCell className="text-muted-foreground">
                            {hh.city || head?.city || "—"}
                          </TableCell>
                        )}
                        {isVisible("state") && (
                          <TableCell className="text-muted-foreground">
                            {hh.state || head?.state || "—"}
                          </TableCell>
                        )}
                        {isVisible("zip") && (
                          <TableCell className="text-muted-foreground">
                            {hh.zipCode || head?.zipCode || "—"}
                          </TableCell>
                        )}
                        {isVisible("contact") && (
                          <TableCell className="text-muted-foreground">
                            {head ? (
                              <div>
                                <p className="font-medium text-foreground">
                                  {head.firstName} {head.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {head.email || head.phoneNumber || "—"}
                                </p>
                                {head.email && head.phoneNumber ? (
                                  <p className="text-xs text-muted-foreground">
                                    {head.phoneNumber}
                                  </p>
                                ) : null}
                              </div>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
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
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="right" inset size="sm" className="p-0">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex h-full flex-col"
                >
                  <SheetHeader className="pr-12">
                    <SheetTitle className="font-medium">Add family</SheetTitle>
                    <SheetDescription>
                      Create a household, then attach members from the Members page.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody>
                    <FieldGroup>
                      <TextFormField
                        control={form.control}
                        name="name"
                        label="Household name"
                        placeholder="The Cooper family"
                      />
                      <TextFormField
                        control={form.control}
                        name="address"
                        label="Address"
                        placeholder="123 Main St"
                      />
                      <div className="grid gap-4 sm:grid-cols-3">
                        <TextFormField
                          control={form.control}
                          name="city"
                          label="City"
                          placeholder="City"
                        />
                        <TextFormField
                          control={form.control}
                          name="state"
                          label="State"
                          placeholder="ST"
                        />
                        <TextFormField
                          control={form.control}
                          name="zipCode"
                          label="ZIP"
                          placeholder="00000"
                        />
                      </div>
                    </FieldGroup>
                  </SheetBody>
                  <SheetFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSheetOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={create.isPending}>
                      {create.isPending ? "Saving…" : "Create family"}
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
