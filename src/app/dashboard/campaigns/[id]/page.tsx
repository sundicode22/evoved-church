"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { RichTextEditor } from "@/components/rich-text-editor";
import { Can, RequireAbility } from "@/components/auth/can";
import { ConfirmAction } from "@/components/confirm-action";
import { StatusPill } from "@/components/table-panel";
import {
  useCampaign,
  useSendCampaign,
  useUpdateCampaign,
} from "@/features/campaigns/hooks/use-campaigns";
import {
  AUDIENCE_ITEMS,
  CHANNEL_ITEMS,
  STATUS_TONE,
} from "@/features/campaigns/constants";
import type { CampaignChannel } from "@/features/campaigns/schemas";
import { PageHeader } from "@/components/page-header"
import { CheckCircle2, ChevronLeft, Mail } from "lucide-react"

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

function CampaignDetailPage() {
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
      <SidebarInset className="min-h-screen bg-background">
        <RequireAbility permission="campaigns.read">
          <PageHeader
            title={
              <>
                <span className="truncate">{data?.name ?? "Campaign"}</span>
                {data && (
                  <StatusPill
                    tone={STATUS_TONE[data.status]}
                    className="capitalize"
                  >
                    {data.status}
                  </StatusPill>
                )}
              </>
            }
            description={
              <Link
                href="/dashboard/campaigns"
                className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-700"
              >
                <ChevronLeft className="size-3.5" />
                All campaigns
              </Link>
            }
            icon={<Mail className="size-5 text-brand" strokeWidth={1.75} />}
            actions={
              <>
                <Can permission="campaigns.write">
                  <Button
                    variant="outline"
                    onClick={save}
                    disabled={!draft || locked || update.isPending}
                    className="h-8 rounded-lg border-border text-xs font-normal shadow-xs"
                  >
                    Save changes
                  </Button>
                </Can>
                <Can permission="campaigns.send">
                  <Button
                    variant="accent"
                    onClick={() => setConfirmSend(true)}
                    disabled={!data || locked || send.isPending}
                    className="h-8 gap-1.5 rounded-lg px-3.5 text-xs font-normal shadow-xs"
                  >
                    <CheckCircle2 className="size-3.5" strokeWidth={1.75} />
                    {send.isPending ? "Sending…" : "Send"}
                  </Button>
                </Can>
              </>
            }
          />

          <div className="max-w-4xl p-8">
            {isLoading || !draft || !data ? (
              <Skeleton className="h-96 w-full rounded-lg" />
            ) : (
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="audience">Audience</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="results">Results</TabsTrigger>
                </TabsList>

                <TabsContent value="content">
                  <div className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-xs">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">
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
                        <Label className="text-xs font-medium">Channel</Label>
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
                          <Label className="text-xs font-medium">
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
                          <Label className="text-xs font-medium">
                            Email body
                          </Label>
                          <RichTextEditor
                            value={draft.emailBody}
                            disabled={locked}
                            onChange={(html) => patch({ emailBody: html })}
                            placeholder="Write your email… use the toolbar for bold, lists, and links."
                            minHeight="240px"
                            enableImages={false}
                          />
                        </div>
                      </>
                    )}
                    {showSms && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">
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
                  <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-xs">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Send to</Label>
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
                  <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-xs">
                    <div className="grid max-w-md grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">
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
                        <Label className="text-xs font-medium">
                          Send time
                        </Label>
                        <TimePicker
                          value={draft.scheduleTime}
                          disabled={locked}
                          minuteStep={15}
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
                          className="rounded-lg border border-border bg-card p-4 shadow-xs"
                        >
                          <p className="text-xs text-zinc-500">{label}</p>
                          <p className="mt-1 text-2xl font-medium text-foreground">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Recipient</TableHead>
                            <TableHead>Channel</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Provider ID</TableHead>
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
                              <TableCell className="text-xs">
                                <p className="font-medium text-foreground">
                                  {s.recipientName}
                                </p>
                                <p className="text-zinc-400">
                                  {s.recipientEmail || s.recipientPhone}
                                </p>
                              </TableCell>
                              <TableCell className="text-xs uppercase text-muted-foreground">
                                {s.channel}
                              </TableCell>
                              <TableCell>
                                <StatusPill
                                  tone={
                                    s.status === "sent"
                                      ? "success"
                                      : s.status === "failed"
                                        ? "danger"
                                        : "neutral"
                                  }
                                  className="capitalize"
                                >
                                  {s.status}
                                </StatusPill>
                              </TableCell>
                              <TableCell className="font-mono text-[11px] text-zinc-500">
                                {s.providerId || s.errorMessage || "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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

export default function CampaignDetailRoute() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          Loading campaign…
        </div>
      }
    >
      <CampaignDetailPage />
    </React.Suspense>
  );
}
