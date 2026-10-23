"use client"

/**
 * COURTSIDE: คำอธิบายไฟล์
 * ควบคุมการตรึงทีม จัดลำดับ/สุ่ม สร้างตัวอย่าง และเผยแพร่สาย โดยแต่ละคำสั่งส่งไป API ของรายการ
 * เรียกใช้จาก: app/(admin)/organizer/tournaments/[id]/bracket/page.tsx
 * ตามการทำงานต่อ: components/organizer/bracket-preview.tsx, components/organizer/bracket-mode-control.tsx, components/ui/button.tsx
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, Globe2, LockKeyhole, Shuffle } from "lucide-react"

import { BracketPreview } from "@/components/organizer/bracket-preview"
import { BracketModeControl } from "@/components/organizer/bracket-mode-control"
import { Button } from "@/components/ui/button"
import type { BracketModeSelectionContext } from "@/features/competition/application/ports/external-bracket-repository"
import type { OrganizerCompetitionWorkspace } from "@/features/competition/application/ports/competition-repository"

export function BracketWorkspace({
  workspace,
  modeContext,
}: {
  workspace: OrganizerCompetitionWorkspace
  modeContext?: BracketModeSelectionContext
}) {
  const router = useRouter()
  const bracket = workspace.bracket
  const [method, setMethod] = useState<"ORDERED" | "RANDOM_ORDERED">(
    bracket?.generationMethod === "RANDOM_ORDERED" ? "RANDOM_ORDERED" : "ORDERED",
  )
  const [editedOrder, setEditedOrder] = useState<{
    bracketKey: string
    entryIds: string[]
  } | null>(null)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const bracketKey = `${bracket?.id ?? "none"}:${bracket?.version ?? 0}`
  const orderedEntryIds = editedOrder?.bracketKey === bracketKey
    ? editedOrder.entryIds
    : [...(bracket?.entries ?? [])]
      .sort((first, second) => first.drawPosition - second.drawPosition)
      .map((entry) => entry.id)
  const entryById = new Map(bracket?.entries.map((entry) => [entry.id, entry]) ?? [])
  const systemCountSupported = bracket ? [8, 16, 32].includes(bracket.entries.length) : false
  const generationLocked = bracket
    ? bracket.status !== "DRAFT" ||
    bracket.mode !== "SYSTEM_GENERATED" ||
    bracket.hasStartedMatch ||
    bracket.rounds.some((round) =>
      round.matches.some((match) => match.scheduledAt !== null),
    )
    : true

  // ตัวช่วยส่งคำสั่งจากพื้นที่สาย จัดการสถานะ pending และข้อความผิดพลาดร่วมกัน
  async function mutate(url: string, body: unknown) {
    setPending(true)
    setMessage(null)
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const result = (await response.json().catch(() => ({}))) as { message?: string }
      if (!response.ok) {
        setMessage(result.message ?? "ไม่สามารถดำเนินการได้ กรุณาลองใหม่")
        return
      }
      router.refresh()
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบ กรุณาลองใหม่")
    } finally {
      setPending(false)
    }
  }

  // ส่งคำขอตรึงทีมที่ผ่านอนุมัติ เพื่อสร้างรายชื่อเริ่มต้นของสาย
  function lockEntries() {
    void mutate(
      `/api/organizer/tournaments/${workspace.tournament.id}/bracket/entries`,
      { expectedVersion: workspace.tournament.version },
    )
  }
  //ฟังชั่นสายการแข่งขัน
  function moveEntry(index: number, direction: -1 | 1) {
    const next = [...orderedEntryIds]
    const adjacentIndex = index + direction
    if (adjacentIndex < 0 || adjacentIndex >= next.length) return // ป้องกันการหลุดขอบเขต
    const movedEntryId = next[index]
    next[index] = next[adjacentIndex]
    next[adjacentIndex] = movedEntryId
    setEditedOrder({ bracketKey, entryIds: next }) // อัปเดตลำดับใหม่ลงใน State
  }
  // generateBracket: สั่งให้ระบบคำนวณและสร้างแผนภูมิสายการแข่งขัน (รองรับการสั่งสุ่มใหม่ผ่าน redraw)
  function generateBracket(redraw = false) {
    if (!bracket) return
    if (redraw && !window.confirm("สุ่มลำดับทีมใหม่และแทนตัวอย่างสายเดิม?")) return
    const body =
      method === "ORDERED"
        ? {
          method,
          expectedVersion: bracket.version,
          positions: orderedEntryIds.map((entryId, index) => ({
            entryId,
            position: index + 1,
          })),
        }
        : { method, expectedVersion: bracket.version, redraw }
    void mutate(
      `/api/organizer/tournaments/${workspace.tournament.id}/bracket/generate`,
      body,
    )
  }

  // ส่งคำขอเผยแพร่สายฉบับร่างไป API publication แล้วโหลดสถานะล่าสุด
  function publishBracket() {
    if (!bracket) return
    void mutate(
      `/api/organizer/tournaments/${workspace.tournament.id}/bracket/publication`,
      { expectedVersion: bracket.version },
    )
  }

  const canLock =
    workspace.tournament.status === "REGISTRATION_CLOSED" &&
    workspace.approvedTeamCount >= 2 &&
    workspace.approvedTeamCount <= 32

  return (
    <div className="divide-y divide-border border-y border-border">
      <section className="grid gap-5 py-7 lg:grid-cols-[12rem_1fr_auto] lg:items-start">
        <StepNumber number="01" title="ล็อกรายชื่อทีม" />
        <div>
          <p className="font-medium">ทีมที่อนุมัติ {workspace.approvedTeamCount} ทีม</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ใช้รายชื่อ ณ เวลาที่ล็อกเพื่อป้องกันสายการแข่งขันเปลี่ยนโดยไม่ตั้งใจ
          </p>
          {bracket ? (
            <ol className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {bracket.entries.map((entry) => (
                <li className="flex gap-3 border-b border-border py-2 text-sm" key={entry.id}>
                  <span className="w-6 text-muted-foreground">{entry.drawPosition}</span>
                  <span className="min-w-0 break-words">{entry.teamNameSnapshot}</span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
        {!bracket ? (
          <Button disabled={!canLock || pending} onClick={lockEntries} size="lg">
            <LockKeyhole aria-hidden="true" />
            {pending ? "กำลังล็อก" : "ล็อกรายชื่อ"}
          </Button>
        ) : (
          <span className="text-sm font-medium text-court">ล็อกแล้ว</span>
        )}
      </section>

      {bracket && modeContext ? (
        <section className="grid gap-5 py-7 lg:grid-cols-[12rem_minmax(0,1fr)]">
          <StepNumber number="02" title="เลือกรูปแบบสาย" />
          <BracketModeControl
            currentMode={modeContext.bracketMode}
            expectedVersion={modeContext.bracketVersion}
            locked={modeContext.hasStartedMatch}
            tournamentId={workspace.tournament.id}
          />
        </section>
      ) : null}

      <section className="grid gap-5 py-7 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <StepNumber number={modeContext ? "03" : "02"} title="เลือกวิธีจัดสาย" />
        {bracket?.mode === "EXTERNAL_DOCUMENT" ? (
          <p className="text-sm text-muted-foreground">ใช้ไฟล์สายการแข่งขันภายนอก</p>
        ) : bracket ? (
          <div className="min-w-0 space-y-5">
            <fieldset className="flex flex-wrap gap-5">
              <legend className="sr-only">วิธีจัดสายการแข่งขัน</legend>
              <label className="flex min-h-10 items-center gap-2 text-sm font-medium">
                <input
                  checked={method === "ORDERED"}
                  name="generation-method"
                  onChange={() => setMethod("ORDERED")}
                  type="radio"
                />
                เรียงทีมเอง
              </label>
              <label className="flex min-h-10 items-center gap-2 text-sm font-medium">
                <input
                  checked={method === "RANDOM_ORDERED"}
                  name="generation-method"
                  onChange={() => setMethod("RANDOM_ORDERED")}
                  type="radio"
                />
                สุ่มอัตโนมัติ
              </label>
            </fieldset>

            {method === "ORDERED" ? (
              <div className="divide-y divide-border border-y border-border">
                {orderedEntryIds.map((entryId, index) => {
                  const entry = entryById.get(entryId)
                  if (!entry) return null
                  return (
                    <div
                      className="grid min-h-14 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 py-2 text-sm"
                      key={entry.id}
                    >
                      <span className="text-muted-foreground">{index + 1}</span>
                      <span className="min-w-0 break-words">{entry.teamNameSnapshot}</span>
                      <div className="flex gap-1">
                        <Button
                          aria-label={`เลื่อน ${entry.teamNameSnapshot} ขึ้น`}
                          disabled={index === 0 || pending || generationLocked}
                          onClick={() => moveEntry(index, -1)}
                          size="icon"
                          title={`เลื่อน ${entry.teamNameSnapshot} ขึ้น`}
                          type="button"
                          variant="outline"
                        >
                          <ArrowUp aria-hidden="true" />
                        </Button>
                        <Button
                          aria-label={`เลื่อน ${entry.teamNameSnapshot} ลง`}
                          disabled={index === orderedEntryIds.length - 1 || pending || generationLocked}
                          onClick={() => moveEntry(index, 1)}
                          size="icon"
                          title={`เลื่อน ${entry.teamNameSnapshot} ลง`}
                          type="button"
                          variant="outline"
                        >
                          <ArrowDown aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                ระบบจะสุ่มลำดับทีมและเก็บรหัสการสุ่มไว้ตรวจสอบย้อนหลัง
              </p>
            )}

            {!systemCountSupported ? (
              <p className="text-sm text-destructive">สายที่ระบบสร้างต้องมีทีมที่อนุมัติ 8, 16 หรือ 32 ทีม</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button disabled={pending || generationLocked || !systemCountSupported} onClick={() => generateBracket()} size="lg">
                <Shuffle aria-hidden="true" />
                {pending ? "กำลังสร้าง" : "สร้างตัวอย่างสาย"}
              </Button>
              {method === "RANDOM_ORDERED" && bracket.generationMethod === "RANDOM_ORDERED" ? (
                <Button disabled={pending || generationLocked || !systemCountSupported} onClick={() => generateBracket(true)} size="lg" variant="outline">
                  <Shuffle aria-hidden="true" />
                  สุ่มใหม่
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">ล็อกรายชื่อทีมก่อนเลือกวิธีจัดสาย</p>
        )}
      </section>

      <section className="grid gap-5 py-7 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <StepNumber number={modeContext ? "04" : "03"} title="ตรวจตัวอย่าง" />
        {bracket ? (
          <div className="min-w-0">
            <BracketPreview bracket={bracket} />
            {bracket.rounds.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                <Button
                  disabled={pending || bracket.status === "PUBLISHED"}
                  onClick={publishBracket}
                  size="lg"
                >
                  <Globe2 aria-hidden="true" />
                  {bracket.status === "PUBLISHED" ? "เผยแพร่แล้ว" : "เผยแพร่สายการแข่งขัน"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  เมื่อเผยแพร่ ผู้ชมจะเห็นสายการแข่งขันนี้ในหน้าสาธารณะ
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">ยังไม่มีสายการแข่งขัน</p>
        )}
      </section>

      {message ? (
        <p aria-live="polite" className="border-t border-border py-4 text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  )
}

function StepNumber({ number, title }: { number: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-court">{number}</p>
      <h2 className="mt-1 text-base font-semibold">{title}</h2>
    </div>
  )
}
