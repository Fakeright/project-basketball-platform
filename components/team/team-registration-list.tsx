"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { Button } from "@/components/ui/button"
import type { RegistrationStatus } from "@/features/registrations/domain/registration"

export interface TeamRegistrationListItem {
  id: string
  tournamentName: string
  submittedAt: string
  status: RegistrationStatus
  organizerNote: string | null
  version: number
}

export function TeamRegistrationList({
  registrations,
  readOnly = false,
}: {
  registrations: TeamRegistrationListItem[]
  readOnly?: boolean
}) {
  const router = useRouter()
  const serverSignature = registrations
    .map(({ id, status, version }) => `${id}:${status}:${version}`)
    .join("|")
  const [optimisticCancellations, setOptimisticCancellations] = useState(() => ({
    serverSignature,
    ids: new Set<string>(),
  }))
  const reconciledCancellationIds =
    optimisticCancellations.serverSignature === serverSignature
      ? optimisticCancellations.ids
      : new Set(
          [...optimisticCancellations.ids].filter((id) =>
            registrations.some(
              (registration) =>
                registration.id === id && registration.status === "PENDING",
            ),
          ),
        )

  if (optimisticCancellations.serverSignature !== serverSignature) {
    setOptimisticCancellations({
      serverSignature,
      ids: reconciledCancellationIds,
    })
  }

  const visibleRegistrations = registrations.map((registration) =>
    reconciledCancellationIds.has(registration.id)
      ? { ...registration, status: "CANCELLED" as const }
      : registration,
  )
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [registrationToCancel, setRegistrationToCancel] =
    useState<TeamRegistrationListItem | null>(null)

  async function cancelRegistration() {
    const registration = registrationToCancel
    if (!registration) return

    setRegistrationToCancel(null)
    setPendingId(registration.id)
    setFeedback(null)
    try {
      const response = await fetch(`/api/registrations/${registration.id}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ version: registration.version }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.message ?? "ไม่สามารถยกเลิกการสมัครได้")
      }
      setOptimisticCancellations((current) => ({
        ...current,
        ids: new Set(current.ids).add(registration.id),
      }))
      setFeedback("ยกเลิกการสมัครแล้ว")
      router.refresh()
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "ไม่สามารถยกเลิกการสมัครได้")
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section className="border-t border-border pt-8">
      <p className="text-xs font-semibold text-court">REGISTRATIONS</p>
      <h2 className="mt-2 text-xl font-semibold">รายการสมัครแข่งขัน</h2>
      {visibleRegistrations.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">ยังไม่มีรายการสมัครแข่งขัน</p>
      ) : (
        <ul className="mt-5 divide-y divide-border border-y border-border">
          {visibleRegistrations.map((registration) => (
            <li className="grid gap-2 py-4 text-sm sm:grid-cols-[minmax(0,1.5fr)_1fr_1fr_minmax(0,1.25fr)_auto]" key={registration.id}>
              <span className="font-medium">{registration.tournamentName}</span>
              <span>{registration.submittedAt}</span>
              <span>{statusLabels[registration.status]}</span>
              <span>{registration.organizerNote ?? "-"}</span>
              {!readOnly && registration.status === "PENDING" ? (
                <button
                  aria-label={`ยกเลิกการสมัคร ${registration.tournamentName}`}
                  className="w-fit border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-60"
                  disabled={pendingId === registration.id}
                  onClick={() => setRegistrationToCancel(registration)}
                  type="button"
                >
                  {pendingId === registration.id ? "กำลังยกเลิก" : "ยกเลิก"}
                </button>
              ) : <span aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
      <DialogPrimitive.Root
        onOpenChange={(open) => {
          if (!open) setRegistrationToCancel(null)
        }}
        open={registrationToCancel !== null}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/20" />
          <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-background p-5 shadow-lg">
            <DialogPrimitive.Title className="text-base font-semibold">
              ยืนยันการยกเลิกการสมัคร
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">
              คุณต้องการยกเลิกการสมัคร {registrationToCancel?.tournamentName} ใช่หรือไม่
            </DialogPrimitive.Description>
            <div className="mt-5 flex justify-end gap-2">
              <DialogPrimitive.Close
                render={<Button type="button" variant="outline">กลับ</Button>}
              />
              <Button
                onClick={cancelRegistration}
                type="button"
                variant="destructive"
              >
                ยืนยันยกเลิกการสมัคร
              </Button>
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-muted-foreground">
        {feedback}
      </p>
    </section>
  )
}

const statusLabels: Record<RegistrationStatus, string> = {
  PENDING: "รอพิจารณา",
  APPROVED: "อนุมัติ",
  REJECTED: "ปฏิเสธ",
  CANCELLED: "ยกเลิก",
  WITHDRAWN: "ถอนทีม",
}
