"use client"

import { useForm, useFormContext, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  inviteDraftSchema,
  type InviteDraftValues,
  type OnboardingFormValues,
} from "@/features/onboarding/schemas"

export function InviteStep() {
  const parent = useFormContext<OnboardingFormValues>()
  const invites = useWatch({ control: parent.control, name: "invites" }) ?? []

  const draft = useForm<InviteDraftValues>({
    resolver: zodResolver(inviteDraftSchema),
    defaultValues: { email: "" },
  })

  function add(values: InviteDraftValues) {
    const value = values.email.trim().toLowerCase()
    if (!value) return
    if (invites.includes(value)) {
      draft.setError("email", { message: "That email is already added." })
      return
    }
    parent.setValue("invites", [...invites, value], { shouldDirty: true })
    draft.reset({ email: "" })
  }

  return (
    <div className="space-y-4">
      <Form {...draft}>
        <form noValidate onSubmit={draft.handleSubmit(add)}>
          <FormField
            control={draft.control}
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
      {invites.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {invites.map((email) => (
            <li
              key={email}
              className="flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft py-1 pr-1.5 pl-3 text-sm text-brand-ink shadow-xs"
            >
              {email}
              <button
                type="button"
                aria-label={`Remove ${email}`}
                onClick={() =>
                  parent.setValue(
                    "invites",
                    invites.filter((e) => e !== email),
                    { shouldDirty: true }
                  )
                }
                className="rounded-full p-0.5 hover:bg-brand/10"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Optional — you can invite people any time from Settings.
        </p>
      )}
    </div>
  )
}
