"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inviteDraftSchema = z.object({
  email: z
    .string()
    .trim()
    .refine((v) => v === "" || EMAIL_RE.test(v), "Enter a valid email address."),
})

type InviteDraftValues = z.infer<typeof inviteDraftSchema>

interface InviteStepProps {
  emails: string[]
  onChange: (emails: string[]) => void
}

export function InviteStep({ emails, onChange }: InviteStepProps) {
  const form = useForm<InviteDraftValues>({
    resolver: zodResolver(inviteDraftSchema),
    defaultValues: { email: "" },
  })

  function add(values: InviteDraftValues) {
    const value = values.email.trim().toLowerCase()
    if (!value) return
    if (emails.includes(value)) {
      form.setError("email", { message: "That email is already added." })
      return
    }
    onChange([...emails, value])
    form.reset({ email: "" })
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form noValidate onSubmit={form.handleSubmit(add)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invite your team</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="teammate@yourchurch.org"
                      autoComplete="off"
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    variant="primary"
                    className="h-10 gap-1 rounded-lg px-3.5 text-sm shadow-xs"
                  >
                    <Plus className="size-4" />
                    Add
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      {emails.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {emails.map((email) => (
            <li
              key={email}
              className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-brand-soft py-1 pr-1.5 pl-3 text-sm text-brand-ink shadow-xs"
            >
              {email}
              <button
                type="button"
                aria-label={`Remove ${email}`}
                onClick={() => onChange(emails.filter((e) => e !== email))}
                className="rounded-full p-0.5 hover:bg-emerald-100"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">
          Optional — you can invite people any time from Settings.
        </p>
      )}
    </div>
  )
}
