"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useCampaigns, useCreateCampaign } from "@/features/campaigns/hooks/use-campaigns"
import type { CampaignChannel } from "@/features/campaigns/schemas"
import { CHANNEL_ITEMS, STATUS_STYLES } from "@/features/campaigns/constants"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"

function formatDate(iso?: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export default function CampaignsPage() {
  const router = useRouter()
  const { data, isLoading } = useCampaigns()
  const create = useCreateCampaign()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [channel, setChannel] = React.useState<CampaignChannel>("email")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    create.mutate(
      { name, channel },
      {
        onSuccess: (c) => {
          setOpen(false)
          setName("")
          router.push(`/dashboard/campaigns/${c.id}`)
        },
      }
    )
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "16rem", "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-h-screen bg-[#fbfcfb] dark:bg-zinc-950">
        <RequireAbility permission="campaigns.read">
          <div className="border-b border-zinc-200/80 bg-white px-8 py-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-6 text-emerald-600" />
                  <span>Campaigns</span>
                </h1>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Reach your congregation by email and SMS. Draft, schedule, and track every send.
                </p>
              </div>
              <Can permission="campaigns.write">
                <Button
                  onClick={() => setOpen(true)}
                  className="h-9 gap-1.5 rounded-lg bg-[#22c55e] px-4 text-xs font-normal text-white shadow-xs hover:bg-[#16a34a]"
                >
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                  <span>New Campaign</span>
                </Button>
              </Can>
            </div>
          </div>

          <div className="p-8">
            <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#f8faf9] hover:bg-[#f8faf9]">
                    <TableHead className="px-4 text-xs">Campaign</TableHead>
                    <TableHead className="text-xs">Channel</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Recipients</TableHead>
                    <TableHead className="text-xs">Schedule / Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading &&
                    [0, 1, 2].map((i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5} className="px-4">
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))}
                  {!isLoading && (data?.length ?? 0) === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-sm text-zinc-500">
                        No campaigns yet. Create your first one.
                      </TableCell>
                    </TableRow>
                  )}
                  {data?.map((c) => (
                    <TableRow key={c.id} className="hover:bg-emerald-50/30">
                      <TableCell className="px-4">
                        <Link
                          href={`/dashboard/campaigns/${c.id}`}
                          className="text-sm font-semibold text-zinc-900 hover:text-emerald-700"
                        >
                          {c.name}
                        </Link>
                        {c.subject && <p className="truncate text-xs text-zinc-400">{c.subject}</p>}
                      </TableCell>
                      <TableCell className="text-xs capitalize text-zinc-600">
                        {c.channel === "both" ? "Email + SMS" : c.channel}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_STYLES[c.status]}`}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-600">{c.stats.total || "—"}</TableCell>
                      <TableCell className="text-xs text-zinc-600">
                        {formatDate(c.sentAt ?? c.scheduleAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="right" inset size="sm" className="p-0">
              <form onSubmit={submit} className="flex h-full flex-col">
                <SheetHeader className="pr-12">
                  <SheetTitle>New campaign</SheetTitle>
                  <SheetDescription>
                    Start with a name and channel; you can edit the rest next. Email uses Resend; SMS uses a
                    separate provider.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Channel</Label>
                    <Select
                      value={channel}
                      items={CHANNEL_ITEMS}
                      onValueChange={(v) => v && setChannel(v as CampaignChannel)}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHANNEL_ITEMS.map((i) => (
                          <SelectItem key={i.value} value={i.value}>
                            {i.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </SheetBody>
                <SheetFooter>
                  <Button type="button" variant="outline" className="h-9" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={create.isPending || name.trim().length < 2}
                    className="h-9 bg-[#22c55e] text-white hover:bg-[#16a34a]"
                  >
                    Create campaign
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  )
}
