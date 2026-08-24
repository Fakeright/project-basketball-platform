"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Globe2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ExternalBracketRevision } from "@/features/competition/application/ports/external-bracket-repository"

type RevisionAction = {
  type: "publish" | "retire"
  revision: ExternalBracketRevision
}

export function ExternalBracketRevisionList({
  tournamentId,
  bracketVersion,
  revisions,
}: {
  tournamentId: string
  bracketVersion: number
  revisions: ExternalBracketRevision[]
}) {
  const router = useRouter()
  const [action, setAction] = useState<RevisionAction | null>(null)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function confirmAction() {
    if (!action || pending) return
    const publish = action.type === "publish"
    const url = publish
      ? `/api/organizer/tournaments/${tournamentId}/bracket/external/publication`
      : `/api/organizer/tournaments/${tournamentId}/bracket/external/revisions/${action.revision.id}`
    setPending(true)
    setMessage(null)
    try {
      const response = await fetch(url, {
        method: publish ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(publish ? { revisionId: action.revision.id } : {}),
          expectedVersion: bracketVersion,
        }),
      })
      const result = (await response.json().catch(() => ({}))) as {
        message?: string
      }
      if (!response.ok) {
        setMessage(result.message ?? "ไม่สามารถดำเนินการกับ revision ได้")
        return
      }
      setAction(null)
      router.refresh()
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบ กรุณาลองใหม่")
    } finally {
      setPending(false)
    }
  }

  if (revisions.length === 0) {
    return <p className="text-sm text-muted-foreground">ยังไม่มีไฟล์สายการแข่งขัน</p>
  }

  return (
    <div>
      <div className="divide-y divide-border border-y border-border">
        {revisions.map((revision) => (
          <article
            className="grid gap-3 py-4 md:grid-cols-[8rem_minmax(0,1fr)_auto] md:items-center"
            key={revision.id}
          >
            <div>
              <p className="font-semibold">Revision {revision.revision}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {statusLabel(revision.status)}
              </p>
            </div>
            <div className="min-w-0 text-sm">
              <p className="break-all font-medium">{revision.mediaAsset.fileName}</p>
              <p className="mt-1 text-muted-foreground">
                {revision.createdByName} · {formatDate(revision.createdAt)}
              </p>
            </div>
            {revision.status === "DRAFT" ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setAction({ type: "publish", revision })}
                  size="sm"
                  type="button"
                >
                  <Globe2 aria-hidden="true" />
                  เผยแพร่ Revision {revision.revision}
                </Button>
                <Button
                  aria-label={`เลิกใช้ Revision ${revision.revision}`}
                  onClick={() => setAction({ type: "retire", revision })}
                  size="icon-sm"
                  title={`เลิกใช้ Revision ${revision.revision}`}
                  type="button"
                  variant="outline"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <span className="text-sm font-medium">{statusLabel(revision.status)}</span>
            )}
          </article>
        ))}
      </div>
      {message ? (
        <p aria-live="polite" className="mt-3 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <DialogPrimitive.Root
        onOpenChange={(open) => {
          if (!open && !pending) setAction(null)
        }}
        open={action !== null}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/30" />
          <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-background p-5 shadow-lg">
            <DialogPrimitive.Title className="text-base font-semibold">
              {action?.type === "publish" ? "ยืนยันการเผยแพร่" : "ยืนยันเลิกใช้ revision"}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">
              {action?.type === "publish"
                ? "ผู้ชมจะเห็นไฟล์ฉบับนี้แทนฉบับที่เผยแพร่อยู่"
                : "Revision นี้จะยังอยู่ในประวัติ แต่ไม่สามารถเผยแพร่ได้อีก"}
            </DialogPrimitive.Description>
            <div className="mt-5 flex justify-end gap-2">
              <DialogPrimitive.Close render={<Button variant="outline" />}>
                ยกเลิก
              </DialogPrimitive.Close>
              <Button disabled={pending} onClick={() => void confirmAction()}>
                {pending
                  ? "กำลังดำเนินการ"
                  : action?.type === "publish"
                    ? "ยืนยันเผยแพร่"
                    : "ยืนยันเลิกใช้"}
              </Button>
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  )
}

function statusLabel(status: ExternalBracketRevision["status"]) {
  return status === "PUBLISHED"
    ? "เผยแพร่แล้ว"
    : status === "RETIRED"
      ? "เลิกใช้แล้ว"
      : "ฉบับร่าง"
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value))
}
