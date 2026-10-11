"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import {
  Archive,
  CirclePlay,
  PauseCircle,
  RotateCcw,
  ShieldX,
  Trash2,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { TournamentGovernanceAction } from "@/features/tournament-operations/domain/tournament-governance-policy"

export interface TournamentGovernanceDialogAction {
  action: TournamentGovernanceAction
  label: string
  dialogTitle: string
  description: string
  confirmLabel: string
  destructive: boolean
  requiresConfirmationTitle: boolean
}

interface TournamentIdentity {
  id: string
  title: string
  version: number
}

export function TournamentGovernanceDialog({
  action,
  tournament,
  unavailableReasons = [],
}: {
  action: TournamentGovernanceDialogAction
  tournament: TournamentIdentity
  unavailableReasons?: string[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [confirmationTitle, setConfirmationTitle] = useState("")
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const unavailable = unavailableReasons.length > 0
  const titleMatches =
    !action.requiresConfirmationTitle ||
    confirmationTitle.trim() === tournament.title.trim()
  const canSubmit = Boolean(reason.trim()) && titleMatches && !pending

  function updateOpen(nextOpen: boolean) {
    if (pending) return
    setOpen(nextOpen)
    if (!nextOpen) resetForm()
  }

  function resetForm() {
    setReason("")
    setConfirmationTitle("")
    setFeedback(null)
  }

  async function submitCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    setPending(true)
    setFeedback(null)
    try {
      const body = {
        action: action.action,
        version: tournament.version,
        reason: reason.trim(),
        ...(action.requiresConfirmationTitle
          ? { confirmationTitle: confirmationTitle.trim() }
          : {}),
      }
      const response = await fetch(
        `/api/admin/tournaments/${tournament.id}/governance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      )
      const result =
        response.status === 204
          ? {}
          : ((await response.json().catch(() => ({}))) as {
              message?: string
            })
      if (!response.ok) {
        setFeedback(
          result.message ?? "ไม่สามารถดำเนินคำสั่งกำกับได้ กรุณาลองอีกครั้ง",
        )
        return
      }

      setOpen(false)
      resetForm()
      router.refresh()
    } catch {
      setFeedback("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองอีกครั้ง")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
      <div className="min-w-0">
        <h3 className="font-semibold">{action.label}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {action.description}
        </p>
        {unavailable ? (
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {unavailableReasons.map((reasonText) => (
              <li key={reasonText}>{reasonText}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <Button
        className="min-h-10 w-full gap-2 px-3 sm:w-auto"
        disabled={unavailable}
        onClick={() => updateOpen(true)}
        type="button"
        variant={action.destructive ? "destructive" : "outline"}
      >
        <GovernanceActionIcon action={action.action} />
        {action.label}
      </Button>

      <DialogPrimitive.Root onOpenChange={updateOpen} open={open}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/35" />
          <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-border bg-background p-5 shadow-xl sm:p-6">
            <DialogPrimitive.Title className="text-lg font-semibold">
              {action.dialogTitle}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-muted-foreground">
              {action.description}
            </DialogPrimitive.Description>

            <form className="mt-5 space-y-5" onSubmit={submitCommand}>
              <label className="block text-sm font-medium" htmlFor={`${action.action}-reason`}>
                เหตุผล
                <textarea
                  className="mt-2 min-h-28 w-full resize-y border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={pending}
                  id={`${action.action}-reason`}
                  maxLength={500}
                  onChange={(event) => setReason(event.target.value)}
                  required
                  value={reason}
                />
              </label>

              {action.requiresConfirmationTitle ? (
                <div>
                  <label
                    className="block text-sm font-medium"
                    htmlFor={`${action.action}-confirmation-title`}
                  >
                    พิมพ์ชื่อรายการเพื่อยืนยัน
                  </label>
                  <p className="mt-1 break-words text-xs text-muted-foreground">
                    {tournament.title}
                  </p>
                  <Input
                    autoComplete="off"
                    className="mt-2 min-h-10"
                    disabled={pending}
                    id={`${action.action}-confirmation-title`}
                    onChange={(event) => setConfirmationTitle(event.target.value)}
                    value={confirmationTitle}
                  />
                </div>
              ) : null}

              {feedback ? (
                <p
                  aria-live="assertive"
                  className="border-l-4 border-destructive px-3 py-2 text-sm text-destructive"
                >
                  {feedback}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <DialogPrimitive.Close
                  render={
                    <Button disabled={pending} type="button" variant="outline">
                      <X aria-hidden="true" />
                      ยกเลิก
                    </Button>
                  }
                />
                <Button
                  disabled={!canSubmit}
                  type="submit"
                  variant={action.destructive ? "destructive" : "default"}
                >
                  <GovernanceActionIcon action={action.action} />
                  {pending ? "กำลังดำเนินการ" : action.confirmLabel}
                </Button>
              </div>
            </form>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  )
}

function GovernanceActionIcon({
  action,
}: {
  action: TournamentGovernanceAction
}) {
  switch (action) {
    case "SUSPEND":
      return <PauseCircle aria-hidden="true" />
    case "RESUME":
      return <CirclePlay aria-hidden="true" />
    case "REMOVE":
      return <ShieldX aria-hidden="true" />
    case "ARCHIVE":
      return <Archive aria-hidden="true" />
    case "REOPEN_REGISTRATION":
      return <RotateCcw aria-hidden="true" />
    case "PERMANENT_DELETE":
      return <Trash2 aria-hidden="true" />
  }
}
