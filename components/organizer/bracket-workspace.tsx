"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Globe2, LockKeyhole, Shuffle } from "lucide-react"

import { BracketPreview } from "@/components/organizer/bracket-preview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { OrganizerCompetitionWorkspace } from "@/features/competition/application/ports/competition-repository"

export function BracketWorkspace({ workspace }: { workspace: OrganizerCompetitionWorkspace }) {
  const router = useRouter()
  const bracket = workspace.bracket
  const [method, setMethod] = useState<"SEEDED" | "RANDOM">(
    bracket?.generationMethod ?? "SEEDED",
  )
  const [seeds, setSeeds] = useState<Record<string, number>>(() =>
    Object.fromEntries(bracket?.entries.map((entry) => [entry.id, entry.seed]) ?? []),
  )
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

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

  function lockEntries() {
    void mutate(
      `/api/organizer/tournaments/${workspace.tournament.id}/bracket/entries`,
      { expectedVersion: workspace.tournament.version },
    )
  }

  function generateBracket() {
    if (!bracket) return
    const body =
      method === "SEEDED"
        ? {
            method,
            expectedVersion: bracket.version,
            seeds: bracket.entries.map((entry) => ({
              entryId: entry.id,
              seed: seeds[entry.id],
            })),
          }
        : { method, expectedVersion: bracket.version, redraw: false }
    void mutate(
      `/api/organizer/tournaments/${workspace.tournament.id}/bracket/generate`,
      body,
    )
  }

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

      <section className="grid gap-5 py-7 lg:grid-cols-[12rem_1fr]">
        <StepNumber number="02" title="เลือกวิธีจัดสาย" />
        {bracket ? (
          <div className="space-y-5">
            <fieldset className="flex flex-wrap gap-5">
              <legend className="sr-only">วิธีจัดสายการแข่งขัน</legend>
              <label className="flex min-h-10 items-center gap-2 text-sm font-medium">
                <input
                  checked={method === "SEEDED"}
                  name="generation-method"
                  onChange={() => setMethod("SEEDED")}
                  type="radio"
                />
                กำหนด Seed
              </label>
              <label className="flex min-h-10 items-center gap-2 text-sm font-medium">
                <input
                  checked={method === "RANDOM"}
                  name="generation-method"
                  onChange={() => setMethod("RANDOM")}
                  type="radio"
                />
                สุ่มอัตโนมัติ
              </label>
            </fieldset>

            {method === "SEEDED" ? (
              <div className="divide-y divide-border border-y border-border">
                {bracket.entries.map((entry) => (
                  <label
                    className="grid min-h-12 grid-cols-[1fr_5rem] items-center gap-4 py-2 text-sm"
                    key={entry.id}
                  >
                    <span className="min-w-0 break-words">{entry.teamNameSnapshot}</span>
                    <Input
                      aria-label={`Seed ${entry.teamNameSnapshot}`}
                      max={bracket.entries.length}
                      min={1}
                      onChange={(event) =>
                        setSeeds((current) => ({
                          ...current,
                          [entry.id]: Number(event.target.value),
                        }))
                      }
                      type="number"
                      value={seeds[entry.id] ?? ""}
                    />
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                ระบบจะสุ่มลำดับทีมและเก็บรหัสการสุ่มไว้ตรวจสอบย้อนหลัง
              </p>
            )}

            <Button disabled={pending || bracket.hasStartedMatch} onClick={generateBracket} size="lg">
              <Shuffle aria-hidden="true" />
              {pending ? "กำลังสร้าง" : "สร้างตัวอย่างสาย"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">ล็อกรายชื่อทีมก่อนเลือกวิธีจัดสาย</p>
        )}
      </section>

      <section className="grid gap-5 py-7 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <StepNumber number="03" title="ตรวจตัวอย่าง" />
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
