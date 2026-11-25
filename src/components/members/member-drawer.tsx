"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { apiClient, ApiResponse } from "@/lib/axios"
import { HOUSEHOLD_ROLE_LABELS, type HouseholdRole } from "@/features/members/schemas"
import { MEMBER_KEYS } from "@/features/members/hooks/use-members"
import { Can } from "@/components/auth/can"
import { toast } from "sonner"
import { Mail, Smartphone } from "lucide-react"

export function MemberDrawer({
  memberId,
  open,
  onOpenChange,
}: {
  memberId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const { data: member, isLoading } = useQuery({
    queryKey: [...MEMBER_KEYS.all, "detail", memberId],
    enabled: Boolean(memberId) && open,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any>>(`/members/${memberId}`)
      return res.data.data
    },
  })

  const [role, setRole] = React.useState<HouseholdRole>("other")

  React.useEffect(() => {
    if (member?.householdRole) setRole(member.householdRole)
  }, [member?.householdRole])

  const attach = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/members/${memberId}/household`, {
        householdId: member?.householdId || undefined,
        householdName: member?.householdName || `${member?.lastName || "Family"} Household`,
        householdRole: role,
      })
      return res.data
    },
    onSuccess: () => {
      toast.success("Household role saved")
      queryClient.invalidateQueries({ queryKey: MEMBER_KEYS.all })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" inset size="lg" className="p-0">
        {isLoading || !member ? (
          <div className="flex h-full min-h-72 items-center justify-center gap-2 text-sm text-zinc-500">
            <Spinner className="size-4" />
            Loading member…
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            <SheetHeader className="border-b border-zinc-100 pr-12">
              <SheetTitle className="text-lg">
                {member.firstName} {member.lastName}
              </SheetTitle>
              <SheetDescription>
                {member.recordedTitle || "Church member"} ·{" "}
                <span className="capitalize">
                  {String(member.personType || "").replace(/_/g, " ")}
                </span>
              </SheetDescription>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {member.householdRole && (
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">
                    {HOUSEHOLD_ROLE_LABELS[member.householdRole as HouseholdRole] ||
                      member.householdRole}
                  </Badge>
                )}
                <Badge variant="outline" className="capitalize">
                  {String(member.backgroundCheckStatus || "none")}
                </Badge>
              </div>
            </SheetHeader>

            <SheetBody className="px-0">
              <Tabs defaultValue="household" className="flex h-full min-h-0 flex-col px-6">
                <TabsList className="mb-3 w-full justify-start">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="household">Household</TabsTrigger>
                  <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
                  <TabsTrigger value="safety">Safety</TabsTrigger>
                </TabsList>

                <ScrollArea className="min-h-0 flex-1 pr-1">
                  <TabsContent value="profile" className="mt-0 space-y-4 pb-4">
                    <ul className="space-y-3 rounded-xl border border-zinc-200/70 bg-white p-4 text-sm">
                      <li className="flex items-start gap-2.5">
                        <Mail className="mt-0.5 size-3.5 text-zinc-400" />
                        <div>
                          <p className="text-[11px] text-zinc-400">Email</p>
                          <p className="text-zinc-800">{member.email || "—"}</p>
                        </div>
                      </li>
                      <Separator />
                      <li className="flex items-start gap-2.5">
                        <Smartphone className="mt-0.5 size-3.5 text-zinc-400" />
                        <div>
                          <p className="text-[11px] text-zinc-400">Phone</p>
                          <p className="text-zinc-800">{member.phoneNumber || "—"}</p>
                        </div>
                      </li>
                      <Separator />
                      <li>
                        <p className="text-[11px] text-zinc-400">Ministries</p>
                        <p className="text-zinc-800">
                          {(member.ministryRoles || []).join(", ") || "—"}
                        </p>
                      </li>
                    </ul>
                  </TabsContent>

                  <TabsContent value="household" className="mt-0 space-y-4 pb-4">
                    <p className="text-sm text-zinc-500">
                      {member.householdName ||
                        "Link this church member to a household and tag who they are."}
                    </p>

                    {(member.householdPeers || []).length === 0 ? (
                      <Empty className="border border-dashed border-zinc-200 py-8">
                        <EmptyHeader>
                          <EmptyTitle>No household peers yet</EmptyTitle>
                          <EmptyDescription>
                            Save a household role to start the family record.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    ) : (
                      <div className="space-y-3 rounded-xl border border-zinc-200/70 bg-white p-4">
                        {(member.householdPeers || []).map(
                          (peer: {
                            id: string
                            firstName: string
                            lastName: string
                            personType?: string
                            roleLabel?: string
                            householdRole?: string
                          }) => (
                            <div
                              key={peer.id}
                              className="flex items-center justify-between gap-2"
                            >
                              <div>
                                <p className="text-sm font-medium text-zinc-900">
                                  {peer.firstName} {peer.lastName}
                                </p>
                                <p className="text-xs text-zinc-400 capitalize">
                                  {String(peer.personType || "").replace(/_/g, " ")}
                                </p>
                              </div>
                              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">
                                {peer.roleLabel ||
                                  HOUSEHOLD_ROLE_LABELS[
                                    peer.householdRole as HouseholdRole
                                  ] ||
                                  peer.householdRole ||
                                  "—"}
                              </Badge>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    <Can permission="members.write">
                      <div className="space-y-2 rounded-xl border border-zinc-200/70 bg-[#f8faf9] p-4">
                        <Label className="text-xs font-semibold">Your role in household</Label>
                        <Select
                          value={role}
                          items={(Object.keys(HOUSEHOLD_ROLE_LABELS) as HouseholdRole[]).map(
                            (k) => ({
                              value: k,
                              label: HOUSEHOLD_ROLE_LABELS[k],
                            })
                          )}
                          onValueChange={(v) => v && setRole(v as HouseholdRole)}
                        >
                          <SelectTrigger className="h-9 w-full bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(HOUSEHOLD_ROLE_LABELS) as HouseholdRole[]).map(
                              (k) => (
                                <SelectItem key={k} value={k}>
                                  {HOUSEHOLD_ROLE_LABELS[k]}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </Can>
                  </TabsContent>

                  <TabsContent value="lifecycle" className="mt-0 pb-4">
                    <Accordion>
                      <AccordionItem value="stage">
                        <AccordionTrigger>Lifecycle stage</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-zinc-600">
                            Current type:{" "}
                            <strong className="capitalize text-zinc-900">
                              {String(member.personType || "").replace(/_/g, " ")}
                            </strong>
                            . Changes are audited with who updated the type.
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TabsContent>

                  <TabsContent value="safety" className="mt-0 pb-4 text-sm text-zinc-600">
                    Background check:{" "}
                    <strong className="capitalize">
                      {member.backgroundCheckStatus || "none"}
                    </strong>
                    {member.backgroundCheckExpiresAt && (
                      <span>
                        {" "}
                        · expires{" "}
                        {new Date(member.backgroundCheckExpiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </SheetBody>

            <Can permission="members.write">
              <SheetFooter>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-9"
                >
                  Close
                </Button>
                <Button
                  onClick={() => attach.mutate()}
                  disabled={attach.isPending}
                >
                  {attach.isPending ? "Saving…" : "Save household role"}
                </Button>
              </SheetFooter>
            </Can>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
