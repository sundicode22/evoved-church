"use client"

import * as React from "react"
import { Home, Plus, UserPlus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { SelectFormField, TextFormField } from "@/components/form-fields"
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
  useAttachHousehold,
  useCreateHousehold,
  useCreateMember,
  useHouseholds,
} from "@/features/members/hooks/use-members"
import {
  createHouseholdSchema,
  HOUSEHOLD_ROLE_LABELS,
  householdRoleSchema,
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

const memberFormSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().min(2, "Last name is required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  householdRole: householdRoleSchema,
})
type MemberFormValues = z.infer<typeof memberFormSchema>

const FAMILY_DEFAULTS: FamilyFormValues = {
  name: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
}

const MEMBER_DEFAULTS: MemberFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  householdRole: "head",
}

const ROLE_OPTIONS = (Object.keys(HOUSEHOLD_ROLE_LABELS) as HouseholdRole[]).map(
  (value) => ({ value, label: HOUSEHOLD_ROLE_LABELS[value] })
)

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

type SheetStep = "family" | "choose" | "member"

export default function FamiliesPage() {
  const { data, isLoading } = useHouseholds()
  const create = useCreateHousehold()
  const createMember = useCreateMember()
  const attachHousehold = useAttachHousehold()
  const activeCampusId = useBranchStore((s) => s.activeCampusId)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [step, setStep] = React.useState<SheetStep>("family")
  const [createdFamily, setCreatedFamily] = React.useState<{ id: string; name: string } | null>(
    null
  )
  const [addedCount, setAddedCount] = React.useState(0)
  const { visible, isVisible, toggle } = useColumnVisibility(COLUMNS)

  const familyForm = useForm<FamilyFormValues>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: FAMILY_DEFAULTS,
  })
  const memberForm = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: MEMBER_DEFAULTS,
  })

  function resetSheet() {
    setStep("family")
    setCreatedFamily(null)
    setAddedCount(0)
    familyForm.reset(FAMILY_DEFAULTS)
    memberForm.reset(MEMBER_DEFAULTS)
  }

  React.useEffect(() => {
    if (sheetOpen) resetSheet()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on open
  }, [sheetOpen])

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

  async function onCreateFamily(values: FamilyFormValues) {
    const hh = await create.mutateAsync({
      ...values,
      campusId: activeCampusId || undefined,
    })
    setCreatedFamily({ id: hh.id, name: hh.name })
    setAddedCount(0)
    memberForm.reset({
      ...MEMBER_DEFAULTS,
      lastName: values.name.replace(/\s+family$/i, "").trim() || MEMBER_DEFAULTS.lastName,
    })
    setStep("choose")
  }

  async function onAddMember(values: MemberFormValues) {
    if (!createdFamily) return
    const member = await createMember.mutateAsync({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email || undefined,
      phoneNumber: values.phoneNumber || undefined,
      personType: "covenant_member",
      campusId: activeCampusId || undefined,
      ministryRoles: [],
      backgroundCheckStatus: "none",
    })
    await attachHousehold.mutateAsync({
      memberId: member.id,
      householdId: createdFamily.id,
      householdRole: values.householdRole,
    })
    setAddedCount((n) => n + 1)
    memberForm.reset({
      ...MEMBER_DEFAULTS,
      lastName: values.lastName,
      householdRole: "other",
    })
  }

  const savingMember = createMember.isPending || attachHousehold.isPending

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
                        No households yet. Create a family, then add members or skip.
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

          <Sheet
            open={sheetOpen}
            onOpenChange={(open) => {
              setSheetOpen(open)
              if (!open) resetSheet()
            }}
          >
            <SheetContent side="right" inset size="sm" className="p-0">
              {step === "family" && (
                <Form {...familyForm}>
                  <form
                    onSubmit={familyForm.handleSubmit(onCreateFamily)}
                    className="flex h-full flex-col"
                  >
                    <SheetHeader className="pr-12">
                      <SheetTitle className="font-medium">Add family</SheetTitle>
                      <SheetDescription>
                        Create a household. You can add members next, or skip.
                      </SheetDescription>
                    </SheetHeader>
                    <SheetBody>
                      <FieldGroup>
                        <TextFormField
                          control={familyForm.control}
                          name="name"
                          label="Household name"
                          placeholder="The Cooper family"
                        />
                        <TextFormField
                          control={familyForm.control}
                          name="address"
                          label="Address"
                          placeholder="123 Main St"
                        />
                        <div className="grid gap-4 sm:grid-cols-3">
                          <TextFormField
                            control={familyForm.control}
                            name="city"
                            label="City"
                            placeholder="City"
                          />
                          <TextFormField
                            control={familyForm.control}
                            name="state"
                            label="State"
                            placeholder="ST"
                          />
                          <TextFormField
                            control={familyForm.control}
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
              )}

              {step === "choose" && createdFamily && (
                <div className="flex h-full flex-col">
                  <SheetHeader className="pr-12">
                    <SheetTitle className="font-medium">Add members?</SheetTitle>
                    <SheetDescription>
                      {createdFamily.name} is ready. Add people to this household now, or skip
                      and do it later.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody className="space-y-3">
                    <Button
                      type="button"
                      className="h-auto w-full justify-start gap-3 px-4 py-3 text-left"
                      onClick={() => setStep("member")}
                    >
                      <UserPlus className="size-4 shrink-0" strokeWidth={1.75} />
                      <span>
                        <span className="block text-sm font-medium">Add members</span>
                        <span className="block text-xs font-normal opacity-80">
                          Create people and assign household roles
                        </span>
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto w-full justify-start gap-3 px-4 py-3 text-left"
                      onClick={() => setSheetOpen(false)}
                    >
                      <span>
                        <span className="block text-sm font-medium">Not now</span>
                        <span className="block text-xs font-normal text-muted-foreground">
                          Finish without members — link them later from Members
                        </span>
                      </span>
                    </Button>
                  </SheetBody>
                  <SheetFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSheetOpen(false)}
                    >
                      Done
                    </Button>
                  </SheetFooter>
                </div>
              )}

              {step === "member" && createdFamily && (
                <Form {...memberForm}>
                  <form
                    onSubmit={memberForm.handleSubmit(onAddMember)}
                    className="flex h-full flex-col"
                  >
                    <SheetHeader className="pr-12">
                      <SheetTitle className="font-medium">Add member</SheetTitle>
                      <SheetDescription>
                        Adding to {createdFamily.name}
                        {addedCount > 0
                          ? ` · ${addedCount} added`
                          : ""}
                        .
                      </SheetDescription>
                    </SheetHeader>
                    <SheetBody>
                      <FieldGroup>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <TextFormField
                            control={memberForm.control}
                            name="firstName"
                            label="First name"
                            placeholder="Jane"
                          />
                          <TextFormField
                            control={memberForm.control}
                            name="lastName"
                            label="Last name"
                            placeholder="Cooper"
                          />
                        </div>
                        <SelectFormField
                          control={memberForm.control}
                          name="householdRole"
                          label="Household role"
                          options={ROLE_OPTIONS}
                        />
                        <TextFormField
                          control={memberForm.control}
                          name="email"
                          label="Email"
                          placeholder="jane@email.com"
                        />
                        <TextFormField
                          control={memberForm.control}
                          name="phoneNumber"
                          label="Phone"
                          placeholder="Optional"
                        />
                      </FieldGroup>
                    </SheetBody>
                    <SheetFooter className="flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSheetOpen(false)}
                      >
                        Done
                      </Button>
                      <Button type="submit" disabled={savingMember}>
                        {savingMember ? "Saving…" : "Add & continue"}
                      </Button>
                    </SheetFooter>
                  </form>
                </Form>
              )}
            </SheetContent>
          </Sheet>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
