"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type ConfirmVariant = "default" | "destructive"

export type ConfirmActionProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  loading?: boolean
  onConfirm: () => void | Promise<void>
}

/**
 * Modal confirm for irreversible or finance-sensitive actions
 * (post ledger, approve/reject expense, send campaign, delete).
 */
export function ConfirmAction({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
}: ConfirmActionProps) {
  const [busy, setBusy] = React.useState(false)
  const pending = loading || busy

  async function handleConfirm() {
    try {
      setBusy(true)
      await onConfirm()
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default" className="gap-4 p-5 sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-semibold text-zinc-900">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-zinc-500">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(e) => {
              e.preventDefault()
              void handleConfirm()
            }}
            className={
              variant === "destructive"
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-[#16a34a] text-white hover:bg-[#15803d]"
            }
          >
            {pending ? "Working…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
