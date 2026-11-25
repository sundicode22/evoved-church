"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useAssignLead,
  useVisitorComment,
  useVisitorOutreach,
} from "@/features/visitors/hooks/use-visitor-leads"

export type FollowUpAction = "assign" | "comment" | "email" | "sms"

type VisitorFollowUpDialogsProps = {
  leadId: string | null
  contactName?: string
  action: FollowUpAction | null
  onClose: () => void
}

export function VisitorFollowUpDialogs({
  leadId,
  contactName,
  action,
  onClose,
}: VisitorFollowUpDialogsProps) {
  const assign = useAssignLead()
  const comment = useVisitorComment()
  const outreach = useVisitorOutreach()

  const [assigneeName, setAssigneeName] = React.useState("")
  const [assigneeRole, setAssigneeRole] = React.useState<"admin" | "user">("user")
  const [body, setBody] = React.useState("")
  const [subject, setSubject] = React.useState("")

  React.useEffect(() => {
    if (!action) return
    setAssigneeName("")
    setAssigneeRole("user")
    setBody("")
    setSubject(
      contactName ? `Following up — ${contactName}` : "Following up from church"
    )
  }, [action, contactName, leadId])

  const open = Boolean(action && leadId)
  const pending = assign.isPending || comment.isPending || outreach.isPending

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!leadId || !action) return

    try {
      if (action === "assign") {
        if (assigneeName.trim().length < 2) {
          toast.error("Enter a staff name")
          return
        }
        await assign.mutateAsync({
          id: leadId,
          assigneeName: assigneeName.trim(),
          assigneeRole,
        })
        toast.success(
          `Assigned ${assigneeName.trim()} as ${assigneeRole === "admin" ? "Admin" : "User"}`
        )
      } else if (action === "comment") {
        if (!body.trim()) {
          toast.error("Enter a comment")
          return
        }
        await comment.mutateAsync({ id: leadId, body: body.trim() })
        toast.success("Comment saved")
      } else if (action === "email") {
        if (!body.trim()) {
          toast.error("Enter an email message")
          return
        }
        await outreach.mutateAsync({
          id: leadId,
          channel: "email",
          message: body.trim(),
          subject: subject.trim() || undefined,
        })
        toast.success("Email queued")
      } else {
        if (!body.trim()) {
          toast.error("Enter an SMS message")
          return
        }
        await outreach.mutateAsync({
          id: leadId,
          channel: "sms",
          message: body.trim(),
        })
        toast.success("SMS queued")
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  const titles: Record<FollowUpAction, string> = {
    assign: "Assign staff",
    comment: "Add comment",
    email: "Email visitor",
    sms: "Send SMS",
  }

  const descriptions: Record<FollowUpAction, string> = {
    assign: "Give an Admin (system control) or User (follow-up owner) ownership of this guest.",
    comment: "Leave a pastoral note for the welcome team.",
    email: "Send a personal follow-up email via Resend.",
    sms: "Text the guest a short follow-up via SMS.",
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{action ? titles[action] : ""}</DialogTitle>
            <DialogDescription>
              {action ? descriptions[action] : null}
              {contactName ? ` · ${contactName}` : null}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-3">
            {action === "assign" && (
              <>
                <Field>
                  <FieldLabel>Staff name</FieldLabel>
                  <Input
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    placeholder="e.g. Jane Cooper"
                    className="h-10"
                    autoFocus
                  />
                </Field>
                <Field>
                  <FieldLabel>System role</FieldLabel>
                  <Select
                    value={assigneeRole}
                    onValueChange={(v) => v && setAssigneeRole(v as "admin" | "user")}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin — controls the system</SelectItem>
                      <SelectItem value="user">User — follow-up owner</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </>
            )}

            {action === "email" && (
              <Field>
                <FieldLabel>Subject</FieldLabel>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-10"
                />
              </Field>
            )}

            {(action === "comment" || action === "email" || action === "sms") && (
              <Field>
                <FieldLabel>
                  {action === "comment" ? "Comment" : action === "email" ? "Message" : "SMS text"}
                </FieldLabel>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={action === "sms" ? 3 : 5}
                  maxLength={action === "sms" ? 320 : 2000}
                  placeholder={
                    action === "comment"
                      ? "Notes from the welcome call…"
                      : action === "email"
                        ? "Hi — so glad you joined us…"
                        : "Thanks for visiting! Can we schedule a coffee?"
                  }
                  className="min-h-[96px] resize-y shadow-xs"
                  autoFocus
                />
              </Field>
            )}
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" className="h-9" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="h-9 bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]"
            >
              {pending
                ? "Saving…"
                : action === "assign"
                  ? "Assign"
                  : action === "comment"
                    ? "Save comment"
                    : action === "email"
                      ? "Send email"
                      : "Send SMS"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
