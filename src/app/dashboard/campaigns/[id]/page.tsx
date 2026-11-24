"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/date-picker";
import { TimePicker } from "@/components/time-picker";
import { Can, RequireAbility } from "@/components/auth/can";
import { ConfirmAction } from "@/components/confirm-action";
import {
  useCampaign,
  useSendCampaign,
  useUpdateCampaign,
} from "@/features/campaigns/hooks/use-campaigns";
import {
  AUDIENCE_ITEMS,
  CHANNEL_ITEMS,
  STATUS_STYLES,
} from "@/features/campaigns/constants";
import type { CampaignChannel } from "@/features/campaigns/schemas";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Mail01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

interface Draft {
  name: string;
  channel: CampaignChannel;
  subject: string;
  emailBody: string;
  smsBody: string;
  segment: string;
  scheduleDate?: Date;
  scheduleTime: string;
}

function toDraft(
  c: NonNullable<ReturnType<typeof useCampaign>["data"]>,
): Draft {
  const when = c.scheduleAt ? new Date(c.scheduleAt) : undefined;
  return {
    name: c.name,
    channel: c.channel,
    subject: c.subject,
    emailBody: c.emailBody,
    smsBody: c.smsBody,
    segment: String(c.audienceFilter?.segment ?? "all_members"),
    scheduleDate: when,
    scheduleTime: when
      ? `${String(when.getHours()).padStart(2, "0")}:${String(Math.floor(when.getMinutes() / 15) * 15).padStart(2, "0")}`
      : "09:00",
  };
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useCampaign(id);
  const update = useUpdateCampaign(id);
  const send = useSendCampaign(id);
  // Unsaved edits layered over the server copy; cleared after a successful save.
  const [edits, setEdits] = React.useState<Partial<Draft>>({});
  const draft = React.useMemo(
    () => (data ? { ...toDraft(data), ...edits } : null),
    [data, edits],
  );

  const locked = data?.status === "sent" || data?.status === "sending";
  const [confirmSend, setConfirmSend] = React.useState(false);
  const patch = (p: Partial<Draft>) => setEdits((prev) => ({ ...prev, ...p }));

  function buildScheduleAt(d: Draft) {
    if (!d.scheduleDate) return null;
    const [h, m] = d.scheduleTime.split(":").map(Number);
    const when = new Date(d.scheduleDate);
    when.setHours(h || 0, m || 0, 0, 0);
    return when.toISOString();
  }

  function save() {
    if (!draft) return;
    update.mutate(
      {
        name: draft.name,
        channel: draft.channel,
        subject: draft.subject,
        emailBody: draft.emailBody,
        smsBody: draft.smsBody,
        audienceFilter: { segment: draft.segment as "all_members" },
        scheduleAt: buildScheduleAt(draft),
      },
      { onSuccess: () => setEdits({}) },
    );
  }

  const showEmail = draft?.channel !== "sms";
  const showSms = draft?.channel !== "email";

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
      <SidebarInset className="min-h-screen bg-[#fbfcfb] dark:bg-zinc-950">
        <RequireAbility permission="campaigns.read">
          <div className="border-b border-zinc-200/80 bg-white px-8 py-5 dark:border-zinc-800 dark:bg-zinc-950">
            <Link
              href="/dashboard/campaigns"
              className="mb-2 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-700"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                strokeWidth={2}
                className="size-3.5"
              />
              All campaigns
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  <HugeiconsIcon
                    icon={Mail01Icon}
                    strokeWidth={2}
                    className="size-6 text-emerald-600"
                  />
                  <span>{data?.name ?? "Campaign"}</span>
                  {data && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${STATUS_STYLES[data.status]}`}
                    >
                      {data.status}
                    </Badge>
                  )}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Can permission="campaigns.write">
                  <Button
                    variant="outline"
                    onClick={save}
                    disabled={!draft || locked || update.isPending}
                    className="h-9 rounded-lg text-xs"
                  >
                    Save changes
                  </Button>
                </Can>
                <Can permission="campaigns.send">
                  <Button
                    onClick={() => setConfirmSend(true)}
                    disabled={!data || locked || send.isPending}
                    className="h-9 gap-1.5 rounded-lg bg-[#22c55e] px-4 text-xs font-normal text-white shadow-xs hover:bg-[#16a34a]"
                  >
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      strokeWidth={2}
                      className="size-3.5"
                    />
                    {send.isPending ? "Sending…" : "Send"}
                  </Button>
                </Can>
              </div>
            </div>
          </div>

          <div className="max-w-4xl p-8">
            {isLoading || !draft || !data ? (
              <Skeleton className="h-96 w-full rounded-2xl" />
            ) : (
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="audience">Audience</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="results">Results</TabsTrigger>
                </TabsList>

                <TabsContent value="content">
                  <div className="space-y-5 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                          Campaign name
                        </Label>
                        <Input
                          value={draft.name}
                          disabled={locked}
                          onChange={(e) => patch({ name: e.target.value })}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Channel</Label>
                        <Select
                          value={draft.channel}
                          items={CHANNEL_ITEMS}
                          disabled={locked}
                          onValueChange={(v) =>
                            v && patch({ channel: v as CampaignChannel })
                          }
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
                    </div>
                    {showEmail && (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">
                            Email subject
                          </Label>
                          <Input
                            value={draft.subject}
                            disabled={locked}
                            onChange={(e) => patch({ subject: e.target.value })}
                            className="h-9 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">
                            Email body
                          </Label>
                          <Textarea
                            rows={8}
                            value={draft.emailBody}
                            disabled={locked}
                            onChange={(e) =>
                              patch({ emailBody: e.target.value })
                            }
                            className="text-xs"
                          />
                        </div>
                      </>
                    )}
                    {showSms && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                          SMS message{" "}
                          <span className="font-normal text-zinc-400">
                            ({draft.smsBody.length}/480)
                          </span>
                        </Label>
                        <Textarea
                          rows={3}
                          maxLength={480}
                          value={draft.smsBody}
                          disabled={locked}
                          onChange={(e) => patch({ smsBody: e.target.value })}
                          className="text-xs"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="audience">
                  <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Send to</Label>
                      <Select
                        value={draft.segment}
                        items={AUDIENCE_ITEMS}
                        disabled={locked}
                        onValueChange={(v) => v && patch({ segment: v })}
                      >
                        <SelectTrigger className="h-9 w-full max-w-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AUDIENCE_ITEMS.map((i) => (
                            <SelectItem key={i.value} value={i.value}>
                              {i.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Demo mode: sends go to a small sample recipient list until
                      the member directory is connected.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="schedule">
                  <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
                    <div className="grid max-w-md grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                          Send date
                        </Label>
                        <DatePicker
                          value={draft.scheduleDate}
                          disabled={locked}
                          disablePast
                          onChange={(d) => patch({ scheduleDate: d })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">
                          Send time
                        </Label>
                        <TimePicker
                          value={draft.scheduleTime}
                          disabled={locked}
                          onChange={(t) => patch({ scheduleTime: t })}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Leave the date empty to keep this campaign as a draft you
                      can send manually.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="results">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        ["Recipients", data.stats.total],
                        ["Delivered", data.stats.sent],
                        ["Failed", data.stats.failed],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs"
                        >
                          <p className="text-xs text-zinc-500">{label}</p>
                          <p className="mt-1 text-2xl font-semibold text-zinc-900">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#f8faf9] hover:bg-[#f8faf9]">
                            <TableHead className="px-4 text-xs">
                              Recipient
                            </TableHead>
                            <TableHead className="text-xs">Channel</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs">
                              Provider ID
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.sends.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="py-10 text-center text-sm text-zinc-500"
                              >
                                No sends yet.
                              </TableCell>
                            </TableRow>
                          )}
                          {data.sends.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell className="px-4 text-xs">
                                <p className="font-medium text-zinc-900">
                                  {s.recipientName}
                                </p>
                                <p className="text-zinc-400">
                                  {s.recipientEmail || s.recipientPhone}
                                </p>
                              </TableCell>
                              <TableCell className="text-xs uppercase text-zinc-600">
                                {s.channel}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] capitalize ${
                                    s.status === "sent"
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : s.status === "failed"
                                        ? "border-rose-200 bg-rose-50 text-rose-700"
                                        : "border-zinc-200 bg-zinc-50 text-zinc-600"
                                  }`}
                                >
                                  {s.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-[11px] text-zinc-500">
                                {s.providerId || s.errorMessage || "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>

          <ConfirmAction
            open={confirmSend}
            onOpenChange={setConfirmSend}
            title="Send this campaign now?"
            description="Email goes through Resend; SMS uses the separate SMS provider. Recipients are queued immediately."
            confirmLabel="Send campaign"
            loading={send.isPending}
            onConfirm={async () => {
              await send.mutateAsync();
            }}
          />
        </RequireAbility>
      </SidebarInset>
    </SidebarProvider>
  );
}
