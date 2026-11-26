"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { TableExportButton } from "@/components/table-export-button"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { TextFormField, SelectFormField } from "@/components/form-fields"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCreateMember, useMembers } from "@/features/members/hooks/use-members"
import { MemberDrawer } from "@/components/members/member-drawer"
import { Can, RequireAbility } from "@/components/auth/can"
import {
  HOUSEHOLD_ROLE_LABELS,
  createMemberSchema,
  personTypeEnumSchema,
  type HouseholdRole,
  type PersonType,
} from "@/features/members/schemas"
import {
  ColumnCustomize,
  StatusPill,
  TableAddButton,
  TableChrome,
  TablePagination,
  TablePanel,
  TableSearch,
  TableTabs,
  useColumnVisibility,
  type ColumnOption,
} from "@/components/table-panel"
import { RowActionsMenu } from "@/components/row-actions-menu"

const COLUMNS: ColumnOption[] = [
  { id: "name", label: "Name" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "address", label: "Address" },
  { id: "lifecycle", label: "Lifecycle" },
  { id: "household", label: "Household role" },
  { id: "ministries", label: "Ministries" },
  { id: "safety", label: "Child safety" },
]

const TABS = [
  { id: "all", label: "All People" },
  { id: "covenant_member", label: "Covenant" },
  { id: "staff_minister", label: "Pastors & Elders" },
  { id: "leader", label: "Leaders" },
  { id: "prospect", label: "Guests" },
]

const PERSON_TYPES: { value: PersonType; label: string }[] = [
  { value: "covenant_member", label: "Covenant member" },
  { value: "prospect", label: "Guest / prospect" },
  { value: "regular_attender", label: "Regular attender" },
  { value: "volunteer", label: "Volunteer" },
  { value: "leader", label: "Leader" },
  { value: "staff_minister", label: "Pastor / elder" },
  { value: "visitor", label: "Visitor" },
  { value: "donor_only", label: "Donor only" },
]

const addPersonFormSchema = createMemberSchema
  .pick({
    firstName: true,
    lastName: true,
    preferredName: true,
    email: true,
    phoneNumber: true,
    recordedTitle: true,
    address: true,
    city: true,
    state: true,
    zipCode: true,
    gender: true,
    maritalStatus: true,
    occupation: true,
  })
  .extend({
    personType: personTypeEnumSchema,
  })

type AddPersonFormValues = z.infer<typeof addPersonFormSchema>

const ADD_PERSON_DEFAULTS: AddPersonFormValues = {
  firstName: "",
  lastName: "",
  preferredName: "",
  email: "",
  phoneNumber: "",
  personType: "covenant_member",
  recordedTitle: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  gender: undefined,
  maritalStatus: undefined,
  occupation: "",
}

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unspecified", label: "Unspecified" },
]

const MARITAL_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "widowed", label: "Widowed" },
  { value: "divorced", label: "Divorced" },
  { value: "separated", label: "Separated" },
]

const PERSON_TYPE_OPTIONS = PERSON_TYPES.map((t) => ({ value: t.value, label: t.label }))

function BackgroundCheckAlert({
  members,
}: {
  members: Array<{
    backgroundCheckStatus?: string
    backgroundCheckExpiresAt?: string
  }>
}) {
  const [cutoff, setCutoff] = React.useState<number | null>(null)
  React.useEffect(() => {
    setCutoff(Date.now() + 30 * 86400000)
  }, [])
  if (cutoff == null) return null
  const show = members.some(
    (p) =>
      p.backgroundCheckStatus === "expired" ||
      (p.backgroundCheckExpiresAt &&
        new Date(p.backgroundCheckExpiresAt).getTime() < cutoff)
  )
  if (!show) return null
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span className="font-medium">Background check alert:</span> One or more members have
      expired or soon-to-expire child-safety clearances.
    </div>
  )
}

export default function MembersPage() {
  const [activeTab, setActiveTab] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const form = useForm<AddPersonFormValues>({
    resolver: zodResolver(addPersonFormSchema),
    defaultValues: ADD_PERSON_DEFAULTS,
  })

  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)
  const createMember = useCreateMember()
  const { data: membersResponse, isLoading, refetch } = useMembers({
    personType: activeTab === "all" ? undefined : activeTab,
    search: searchQuery,
  })

  const members = membersResponse?.data || []
  const pageRows = members.slice((page - 1) * pageSize, page * pageSize)

  const exportPayload = React.useMemo(
    () => ({
      filename: "members",
      title: "Members",
      headers: ["Name", "Email", "Phone", "Type", "Household role", "Background check"],
      rows: members.map((m) => [
        [m.firstName, m.lastName].filter(Boolean).join(" "),
        m.email || "",
        m.phoneNumber || "",
        String(m.personType || "").replaceAll("_", " "),
        m.householdRole
          ? HOUSEHOLD_ROLE_LABELS[m.householdRole as HouseholdRole] || m.householdRole
          : "",
        m.backgroundCheckStatus || "none",
      ]),
    }),
    [members]
  )

  function openCreate() {
    form.reset(ADD_PERSON_DEFAULTS)
    setSheetOpen(true)
  }

  const submit = form.handleSubmit(async (values) => {
    try {
      await createMember.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        preferredName: values.preferredName?.trim() || undefined,
        email: values.email?.trim() ?? "",
        phoneNumber: values.phoneNumber?.trim() || undefined,
        personType: values.personType,
        recordedTitle: values.recordedTitle?.trim() || undefined,
        address: values.address?.trim() || undefined,
        city: values.city?.trim() || undefined,
        state: values.state?.trim() || undefined,
        zipCode: values.zipCode?.trim() || undefined,
        gender: values.gender || undefined,
        maritalStatus: values.maritalStatus || undefined,
        occupation: values.occupation?.trim() || undefined,
        ministryRoles: [],
        backgroundCheckStatus: "none",
      })
      setSheetOpen(false)
      form.reset(ADD_PERSON_DEFAULTS)
      await refetch()
    } catch {
      /* toast in hook */
    }
  })

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
            title="Members"
            description="Church members, household roles, and safety clearances."
          />

          <div className="space-y-4 p-6 md:p-8">
            <BackgroundCheckAlert members={members} />

            <TablePanel>
              <TableChrome
                tabs={
                  <TableTabs
                    tabs={TABS.map((t) => ({
                      ...t,
                      count: t.id === "all" ? members.length : undefined,
                    }))}
                    value={activeTab}
                    onChange={(id) => {
                      setActiveTab(id)
                      setPage(1)
                    }}
                  />
                }
                search={
                  <TableSearch
                    value={searchQuery}
                    onChange={(v) => {
                      setSearchQuery(v)
                      setPage(1)
                    }}
                    placeholder="Search people…"
                  />
                }
                trailing={
                  <>
                    <ColumnCustomize columns={COLUMNS} visible={visible} onToggle={toggle} />
                    <TableExportButton payload={exportPayload} />
                    <Can permission="members.write">
                      <TableAddButton onClick={openCreate}>
                        <Plus className="size-3.5" strokeWidth={1.75} />
                        Add Person
                      </TableAddButton>
                    </Can>
                  </>
                }
              />
              <div className="w-full overflow-x-auto rounded-lg border border-zinc-200/80 bg-background">
                <Table className="min-w-[1080px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {isVisible("name") && <TableHead className="pl-4">Name</TableHead>}
                      {isVisible("email") && <TableHead>Email</TableHead>}
                      {isVisible("phone") && <TableHead>Phone</TableHead>}
                      {isVisible("address") && <TableHead>Address</TableHead>}
                      {isVisible("lifecycle") && <TableHead>Lifecycle</TableHead>}
                      {isVisible("household") && <TableHead>Household role</TableHead>}
                      {isVisible("ministries") && <TableHead>Ministries</TableHead>}
                      {isVisible("safety") && <TableHead>Child safety</TableHead>}
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && (
                      <TableRow>
                        <TableCell colSpan={9} className="py-10 text-center text-sm text-zinc-500">
                          Loading…
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoading && members.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="py-10 text-center text-sm text-zinc-500">
                          No members yet. Add a person to start your directory.
                        </TableCell>
                      </TableRow>
                    )}
                    {pageRows.map((person: {
                      id: string
                      firstName: string
                      lastName: string
                      preferredName?: string | null
                      email?: string | null
                      phoneNumber?: string | null
                      address?: string | null
                      city?: string | null
                      state?: string | null
                      zipCode?: string | null
                      recordedTitle?: string | null
                      personType: string
                      householdRole?: string | null
                      ministryRoles?: string[]
                      backgroundCheckStatus?: string
                    }) => (
                      <TableRow
                        key={person.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedId(person.id)}
                      >
                        {isVisible("name") && (
                          <TableCell className="pl-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-xs font-medium text-brand-ink">
                                {person.firstName.charAt(0)}
                                {person.lastName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-zinc-900">
                                  {person.firstName} {person.lastName}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {person.preferredName
                                    ? `Goes by ${person.preferredName}`
                                    : person.recordedTitle || "—"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        )}
                        {isVisible("email") && (
                          <TableCell className="text-zinc-600">{person.email || "—"}</TableCell>
                        )}
                        {isVisible("phone") && (
                          <TableCell className="text-zinc-600">
                            {person.phoneNumber || "—"}
                          </TableCell>
                        )}
                        {isVisible("address") && (
                          <TableCell className="max-w-[220px] truncate text-zinc-600">
                            {[person.address, person.city, person.state, person.zipCode]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </TableCell>
                        )}
                        {isVisible("lifecycle") && (
                          <TableCell>
                            <StatusPill tone="success">
                              {String(person.personType).replaceAll("_", " ")}
                            </StatusPill>
                          </TableCell>
                        )}
                        {isVisible("household") && (
                          <TableCell>
                            {person.householdRole ? (
                              <StatusPill>
                                {HOUSEHOLD_ROLE_LABELS[person.householdRole as HouseholdRole] ||
                                  person.householdRole}
                              </StatusPill>
                            ) : (
                              <span className="text-zinc-400">—</span>
                            )}
                          </TableCell>
                        )}
                        {isVisible("ministries") && (
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {person.ministryRoles?.length ? (
                                person.ministryRoles.map((role: string) => (
                                  <StatusPill key={role}>{role}</StatusPill>
                                ))
                              ) : (
                                <span className="text-zinc-400">None</span>
                              )}
                            </div>
                          </TableCell>
                        )}
                        {isVisible("safety") && (
                          <TableCell>
                            {person.backgroundCheckStatus === "cleared" ? (
                              <StatusPill tone="success">Cleared</StatusPill>
                            ) : person.backgroundCheckStatus === "expired" ? (
                              <StatusPill tone="warning">Expired</StatusPill>
                            ) : (
                              <span className="text-zinc-400">Not required</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="pr-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <RowActionsMenu
                            groups={[
                              {
                                items: [
                                  {
                                    label: "Open",
                                    onClick: () => setSelectedId(person.id),
                                  },
                                ],
                              },
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <TablePagination
                page={page}
                pageSize={pageSize}
                total={members.length}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                  setPageSize(s)
                  setPage(1)
                }}
              />
            </TablePanel>
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="right" inset size="md" className="p-0">
              <form onSubmit={submit} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle className="font-medium">Add person</SheetTitle>
                  <SheetDescription>
                    Create a member record with contact and address details.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <Form {...form}>
                    <FieldGroup className="gap-4">
                      <TextFormField
                        control={form.control}
                        name="firstName"
                        label="First name"
                        autoFocus
                      />
                      <TextFormField control={form.control} name="lastName" label="Last name" />
                      <TextFormField
                        control={form.control}
                        name="preferredName"
                        label="Preferred name"
                        placeholder="optional"
                      />
                      <TextFormField
                        control={form.control}
                        name="email"
                        label="Email"
                        type="email"
                        placeholder="optional"
                      />
                      <TextFormField
                        control={form.control}
                        name="phoneNumber"
                        label="Phone"
                        placeholder="optional"
                      />
                      <TextFormField
                        control={form.control}
                        name="address"
                        label="Street address"
                        placeholder="optional"
                      />
                      <div className="grid gap-4 sm:grid-cols-3">
                        <TextFormField control={form.control} name="city" label="City" />
                        <TextFormField control={form.control} name="state" label="State" />
                        <TextFormField control={form.control} name="zipCode" label="ZIP" />
                      </div>
                      <SelectFormField
                        control={form.control}
                        name="personType"
                        label="Lifecycle"
                        options={PERSON_TYPE_OPTIONS}
                      />
                      <SelectFormField
                        control={form.control}
                        name="gender"
                        label="Gender"
                        placeholder="Optional"
                        options={GENDER_OPTIONS}
                      />
                      <SelectFormField
                        control={form.control}
                        name="maritalStatus"
                        label="Marital status"
                        placeholder="Optional"
                        options={MARITAL_OPTIONS}
                      />
                      <TextFormField
                        control={form.control}
                        name="occupation"
                        label="Occupation"
                        placeholder="optional"
                      />
                      <TextFormField
                        control={form.control}
                        name="recordedTitle"
                        label="Title (optional)"
                        placeholder="e.g. Elder, Deaconess"
                      />
                    </FieldGroup>
                  </Form>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={createMember.isPending}>
                    {createMember.isPending ? "Saving…" : "Add person"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </RequireAbility>

        <MemberDrawer
          memberId={selectedId}
          open={Boolean(selectedId)}
          onOpenChange={(open) => {
            if (!open) setSelectedId(null)
          }}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
