"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"

interface RemovableTeam {
  id: string
  name: string
  version: number
}

export function TeamDeleteDialog({ team }: { team: RemovableTeam }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmationName, setConfirmationName] = useState("")
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  function updateOpen(nextOpen: boolean) {
    if (pending) return
    setOpen(nextOpen)
    if (!nextOpen) setConfirmationName("")
  }

  async function removeTeam() {
    if (confirmationName !== team.name || pending) return

    setPending(true)
    setFeedback(null)
    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmationName,
          expectedVersion: team.version,
        }),
      })
      const result = (await response.json()) as { message?: string }
      if (!response.ok) {
        setFeedback(result.message ?? "ไม่สามารถลบหรือปิดใช้งานทีมได้")
        return
      }

      setFeedback(result.message ?? "ดำเนินการกับทีมแล้ว")
      setOpen(false)
      setConfirmationName("")
      router.push("/team")
      router.refresh()
    } catch {
      setFeedback("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองอีกครั้ง")
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="border-t border-border pt-6">
      <Button
        className="gap-2"
        onClick={() => updateOpen(true)}
        type="button"
        variant="destructive"
      >
        <Trash2 aria-hidden="true" />
        ลบหรือปิดใช้งานทีม
      </Button>

      <DialogPrimitive.Root onOpenChange={updateOpen} open={open}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/30" />
          <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-border bg-background p-5 shadow-lg sm:p-6">
            <DialogPrimitive.Title className="text-lg font-semibold">
              ยืนยันการลบหรือปิดใช้งานทีม
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-muted-foreground">
              หากทีมไม่มีประวัติการสมัคร ระบบจะลบทีมถาวร
              หากมีประวัติ ระบบจะเก็บประวัติการแข่งขันไว้โดยปิดใช้งานทีมแทน
            </DialogPrimitive.Description>

            <label className="mt-5 block space-y-2 text-sm" htmlFor="team-removal-name">
              <span>พิมพ์ชื่อทีม {team.name} เพื่อยืนยัน</span>
              <input
                autoComplete="off"
                className="min-h-11 w-full border border-border bg-background px-3 py-2 outline-none focus:border-foreground"
                disabled={pending}
                id="team-removal-name"
                onChange={(event) => setConfirmationName(event.target.value)}
                value={confirmationName}
              />
            </label>

            {feedback ? (
              <p aria-live="assertive" className="mt-4 border-l-4 border-destructive px-3 py-2 text-sm">
                {feedback}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <DialogPrimitive.Close
                render={<Button disabled={pending} type="button" variant="outline">กลับ</Button>}
              />
              <Button
                disabled={confirmationName !== team.name || pending}
                onClick={removeTeam}
                type="button"
                variant="destructive"
              >
                {pending ? "กำลังดำเนินการ" : "ยืนยันลบหรือปิดใช้งานทีม"}
              </Button>
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-muted-foreground">
        {!open ? feedback : null}
      </p>
    </section>
  )
}
