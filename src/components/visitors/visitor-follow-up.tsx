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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { FieldGroup } from "@/components/ui/field"
import {
  SelectFormField,
  TextFormField,
  TextareaFormField,
} from "@/components/form-fields"
import {
  useAssignLead,
  useVisitorComment,
  useVisitorOutreach,
} from "@/features/visitors/hooks/use-visitor-leads"

export type FollowUpAction = "assign" | "comment" | "email" | "sms"

const followUpFormSchema = z
  .object({
    action: z.enum(["assign", "comment", "email", "sms"]),
    assigneeName: z.string(),
    assigneeRole: z.enum(["admin", "user"]),
    subject: z.string(),
    body: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.action === "assign") {
      if (v.assigneeName.trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["assigneeName"],
          message: "Enter a staff name",
        })
      }
      return
    }
    if (!v.body.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["body"],
        message:
          v.action === "comment"
            ? "Enter a comment"
            : v.action === "email"
              ? "Enter an email message"
              : "Enter an SMS message",
      })
    }
    if (v.action === "sms" && v.body.length > 320) {
      ctx.addIssue({ code: "custom", path: ["body"], message: "SMS must be 320 characters or less" })
    }
  })

type FollowUpFormValues = z.infer<typeof followUpFormSchema>

const ASSIGNEE_ROLE_OPTIONS = [
  { value: "admin", label: "Admin — controls the system" },
  { value: "user", label: "User — follow-up owner" },
]

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

  const form = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpFormSchema),
    defaultValues: {
      action: "comment",
      assigneeName: "",
      assigneeRole: "user",
      subject: "",
      body: "",
    },
  })

  React.useEffect(() => {
    if (!action) return
    form.reset({
      action,
      assigneeName: "",
      assigneeRole: "user",
      subject: contactName ? `Following up — ${contactName}` : "Following up from church",
      body: "",
    })
  }, [action, contactName, leadId, form])

  const open = Boolean(action && leadId)
  const pending = assign.isPending || comment.isPending || outreach.isPending

  const submit = form.handleSubmit(async (values) => {
    if (!leadId || !action) return

    try {
      if (action === "assign") {
        const assigneeName = values.assigneeName.trim()
        await assign.mutateAsync({
          id: leadId,
          assigneeName,
          assigneeRole: values.assigneeRole,
        })
        toast.success(
          `Assigned ${assigneeName} as ${values.assigneeRole === "admin" ? "Admin" : "User"}`
        )
      } else if (action === "comment") {
        await comment.mutateAsync({ id: leadId, body: values.body.trim() })
        toast.success("Comment saved")
      } else if (action === "email") {
        await outreach.mutateAsync({
          id: leadId,
          channel: "email",
          message: values.body.trim(),
          subject: values.subject.trim() || undefined,
        })
        toast.success("Email queued")
      } else {
        await outreach.mutateAsync({
          id: leadId,
          channel: "sms",
          message: values.body.trim(),
        })
        toast.success("SMS queued")
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    }
  })

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

          <Form {...form}>
            <FieldGroup className="gap-3">
              {action === "assign" && (
                <>
                  <TextFormField
                    control={form.control}
                    name="assigneeName"
                    label="Staff name"
                    placeholder="e.g. Jane Cooper"
                    autoFocus
                  />
                  <SelectFormField
                    control={form.control}
                    name="assigneeRole"
                    label="System role"
                    options={ASSIGNEE_ROLE_OPTIONS}
                  />
                </>
              )}

              {action === "email" && (
                <TextFormField control={form.control} name="subject" label="Subject" />
              )}

              {(action === "comment" || action === "email" || action === "sms") && (
                <TextareaFormField
                  control={form.control}
                  name="body"
                  label={
                    action === "comment" ? "Comment" : action === "email" ? "Message" : "SMS text"
                  }
                  rows={action === "sms" ? 3 : 5}
                  maxLength={action === "sms" ? 320 : 2000}
                  placeholder={
                    action === "comment"
                      ? "Notes from the welcome call…"
                      : action === "email"
                        ? "Hi — so glad you joined us…"
                        : "Thanks for visiting! Can we schedule a coffee?"
                  }
                  textareaClassName="min-h-[96px] resize-y shadow-xs"
                  autoFocus
                />
              )}
            </FieldGroup>
          </Form>

          <DialogFooter>
            <Button type="button" variant="outline" className="h-9" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
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
