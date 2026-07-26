"use client"

import { useState } from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Check, UserMinus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { RegistrationStatus } from "@/features/registrations/domain/registration"

export interface RegistrationReviewListItem {
  id: string
  tournamentId: string
  teamId: string
  teamName: string
  province: string
  playerCount: number
  coachCount: number
  submittedAt: string
  status: RegistrationStatus
  decisionNote: string | null
  version: number
}

type Confirmation =
  | { kind: "APPROVE"; registration: RegistrationReviewListItem }
  | { kind: "REJECT"; registration: RegistrationReviewListItem; reason: string }
  | { kind: "WITHDRAW"; registration: RegistrationReviewListItem; reason: string }

const statusLabels: Record<RegistrationStatus, string> = {
  PENDING: "รอพิจารณา",
  APPROVED: "อนุมัติ",
  REJECTED: "ปฏิเสธ",
  CANCELLED: "ยกเลิก",
  WITHDRAWN: "ถอนทีม",
}

export function RegistrationReviewList({
  registrations: initialRegistrations,
  tournamentId,
}: {
  registrations: RegistrationReviewListItem[]
  tournamentId: string
}) {
  const [registrations, setRegistrations] = useState(initialRegistrations)
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const statusCounts = Object.keys(statusLabels).map((status) => {
    const typedStatus = status as RegistrationStatus
    return {
      status: typedStatus,
      count: registrations.filter(
        (registration) => registration.status === typedStatus,
      ).length,
    }
  })

  function requestConfirmation(
    kind: Confirmation["kind"],
    registration: RegistrationReviewListItem,
  ) {
    if (kind === "APPROVE") {
      setConfirmation({ kind, registration })
      return
    }

    const reason = reasons[registration.id]?.trim() ?? ""
    if (!reason) {
      setFeedback("กรุณาระบุเหตุผลก่อนยืนยัน")
      return
    }
    setConfirmation({ kind, registration, reason })
  }

  async function submitConfirmation() {
    const action = confirmation
    if (!action) return

    setConfirmation(null)
    setPendingId(action.registration.id)
    setFeedback(null)
    try {
      const isWithdrawal = action.kind === "WITHDRAW"
      const response = await fetch(
        `/api/organizer/tournaments/${tournamentId}/registrations/${action.registration.id}/${isWithdrawal ? "withdraw" : "decision"}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(
            isWithdrawal
              ? {
                  reason: action.reason,
                  version: action.registration.version,
                }
              : {
                  decision: action.kind,
                  note: action.kind === "REJECT" ? action.reason : "",
                  version: action.registration.version,
                },
          ),
        },
      )
      const payload = (await response.json().catch(() => null)) as {
        registration?: Partial<RegistrationReviewListItem>
        message?: string
      } | null
      if (!response.ok || !payload?.registration) {
        throw new Error(payload?.message ?? "ไม่สามารถอัปเดตการสมัครได้")
      }

      setRegistrations((current) =>
        current.map((registration) =>
          registration.id === action.registration.id
            ? { ...registration, ...payload.registration }
            : registration,
        ),
      )
      setReasons((current) => ({ ...current, [action.registration.id]: "" }))
      setFeedback("อัปเดตสถานะการสมัครแล้ว")
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "ไม่สามารถอัปเดตการสมัครได้",
      )
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section className="border-t border-border pt-8">
      <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-5">
        {statusCounts.map(({ status, count }) => (
          <div className="bg-background px-3 py-3" key={status}>
            <p className="text-xs text-muted-foreground">{statusLabels[status]}</p>
            <p className="mt-1 text-lg font-semibold">
              {statusLabels[status]} {count}
            </p>
          </div>
        ))}
      </div>

      {registrations.length === 0 ? (
        <p className="border-b border-border py-8 text-sm text-muted-foreground">
          ยังไม่มีทีมสมัครแข่งขัน
        </p>
      ) : (
        <ul className="divide-y divide-border border-b border-border">
          {registrations.map((registration) => (
            <li
              className="grid min-w-0 gap-4 py-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(10rem,0.8fr)_minmax(14rem,1fr)]"
              key={registration.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="min-w-0 break-words text-base font-semibold">
                    {registration.teamName}
                  </h2>
                  <span className="text-xs font-medium text-court">
                    {statusLabels[registration.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {registration.province}
                </p>
                <p className="mt-1 text-sm">
                  ผู้เล่น {registration.playerCount} / โค้ช {registration.coachCount}
                </p>
              </div>

              <div className="text-sm">
                <p className="text-xs text-muted-foreground">วันที่ส่งใบสมัคร</p>
                <p className="mt-1">{registration.submittedAt}</p>
                <p className="mt-3 text-xs text-muted-foreground">หมายเหตุ</p>
                <p className="mt-1 break-words">
                  {registration.decisionNote ?? "-"}
                </p>
              </div>

              <div className="min-w-0">
                {registration.status === "PENDING" ? (
                  <div className="grid gap-3">
                    <Button
                      aria-label={`อนุมัติ ${registration.teamName}`}
                      disabled={pendingId === registration.id}
                      onClick={() =>
                        requestConfirmation("APPROVE", registration)
                      }
                      type="button"
                    >
                      <Check aria-hidden="true" />
                      อนุมัติ
                    </Button>
                    <div className="grid gap-1.5">
                      <label
                        className="text-sm font-medium"
                        htmlFor={`reject-${registration.id}`}
                      >
                        เหตุผลการปฏิเสธ {registration.teamName}
                      </label>
                      <Input
                        id={`reject-${registration.id}`}
                        maxLength={500}
                        onChange={(event) =>
                          setReasons((current) => ({
                            ...current,
                            [registration.id]: event.target.value,
                          }))
                        }
                        value={reasons[registration.id] ?? ""}
                      />
                    </div>
                    <Button
                      aria-label={`ปฏิเสธ ${registration.teamName}`}
                      disabled={pendingId === registration.id}
                      onClick={() =>
                        requestConfirmation("REJECT", registration)
                      }
                      type="button"
                      variant="destructive"
                    >
                      <X aria-hidden="true" />
                      ปฏิเสธ
                    </Button>
                  </div>
                ) : registration.status === "APPROVED" ? (
                  <div className="grid gap-3">
                    <div className="grid gap-1.5">
                      <label
                        className="text-sm font-medium"
                        htmlFor={`withdraw-${registration.id}`}
                      >
                        เหตุผลการถอนทีม {registration.teamName}
                      </label>
                      <Input
                        id={`withdraw-${registration.id}`}
                        maxLength={500}
                        onChange={(event) =>
                          setReasons((current) => ({
                            ...current,
                            [registration.id]: event.target.value,
                          }))
                        }
                        value={reasons[registration.id] ?? ""}
                      />
                    </div>
                    <Button
                      aria-label={`ถอนทีม ${registration.teamName}`}
                      disabled={pendingId === registration.id}
                      onClick={() =>
                        requestConfirmation("WITHDRAW", registration)
                      }
                      type="button"
                      variant="destructive"
                    >
                      <UserMinus aria-hidden="true" />
                      ถอนทีม
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmationDialog
        confirmation={confirmation}
        onClose={() => setConfirmation(null)}
        onConfirm={submitConfirmation}
      />
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-muted-foreground">
        {feedback}
      </p>
    </section>
  )
}

function ConfirmationDialog({
  confirmation,
  onClose,
  onConfirm,
}: {
  confirmation: Confirmation | null
  onClose: () => void
  onConfirm: () => void
}) {
  const copy = confirmation
    ? {
        APPROVE: {
          title: "ยืนยันการอนุมัติ",
          description: `อนุมัติทีม ${confirmation.registration.teamName} เข้าร่วมการแข่งขัน`,
          confirm: "ยืนยันอนุมัติ",
        },
        REJECT: {
          title: "ยืนยันการปฏิเสธ",
          description: `ปฏิเสธทีม ${confirmation.registration.teamName}`,
          confirm: "ยืนยันปฏิเสธ",
        },
        WITHDRAW: {
          title: "ยืนยันการถอนทีม",
          description: `ถอนทีม ${confirmation.registration.teamName} จากการแข่งขัน`,
          confirm: "ยืนยันถอนทีม",
        },
      }[confirmation.kind]
    : null

  return (
    <DialogPrimitive.Root
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      open={confirmation !== null}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/20" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-background p-5 shadow-lg">
          <DialogPrimitive.Title className="text-base font-semibold">
            {copy?.title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">
            {copy?.description}
          </DialogPrimitive.Description>
          <div className="mt-5 flex justify-end gap-2">
            <DialogPrimitive.Close
              render={
                <Button type="button" variant="outline">
                  กลับ
                </Button>
              }
            />
            <Button onClick={onConfirm} type="button" variant="destructive">
              {copy?.confirm}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
