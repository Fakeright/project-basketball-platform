"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Combobox } from "@base-ui/react/combobox"
import { ChevronDown, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { bangkokDateTimeLocalToUtc } from "@/features/admin/presentation/tournament-editor-time"
import type { MatchPurpose } from "@/features/competition/domain/competition"

interface TeamOption {
  id: string
  name: string
}

export function ExternalMatchEditor({
  tournamentId,
  bracketVersion,
  teams,
}: {
  tournamentId: string
  bracketVersion: number
  teams: TeamOption[]
}) {
  const router = useRouter()
  const [homeTeam, setHomeTeam] = useState<TeamOption | null>(null)
  const [awayTeam, setAwayTeam] = useState<TeamOption | null>(null)
  const [purpose, setPurpose] = useState<MatchPurpose>("STANDARD")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function submit(form: HTMLFormElement) {
    if (!homeTeam || !awayTeam) {
      setMessage("กรุณาเลือกทีมเหย้าและทีมเยือน")
      return
    }
    const data = new FormData(form)
    let scheduledAt: string
    try {
      scheduledAt = bangkokDateTimeLocalToUtc(String(data.get("scheduledAt")))
    } catch {
      setMessage("กรุณาระบุวันและเวลาแข่งขันให้ถูกต้อง")
      return
    }

    setPending(true)
    setMessage(null)
    try {
      const response = await fetch(
        `/api/organizer/tournaments/${tournamentId}/matches`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roundName: String(data.get("roundName") ?? "").trim(),
            sequence: Number(data.get("sequence")),
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            scheduledAt,
            court: String(data.get("court") ?? "").trim(),
            purpose,
            expectedVersion: bracketVersion,
          }),
        },
      )
      const result = (await response.json().catch(() => ({}))) as {
        message?: string
      }
      if (!response.ok) {
        setMessage(result.message ?? "ไม่สามารถเพิ่มคู่แข่งขันได้")
        return
      }
      form.reset()
      setHomeTeam(null)
      setAwayTeam(null)
      setPurpose("STANDARD")
      router.refresh()
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบ กรุณาลองใหม่")
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="border-y border-border py-6">
      <div className="mb-5">
        <p className="text-xs font-semibold text-court">EXTERNAL BRACKET</p>
        <h2 className="mt-1 text-base font-semibold">เพิ่มคู่แข่งขันจากไฟล์</h2>
      </div>
      <form
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(8rem,1fr)_5rem_minmax(10rem,1fr)_minmax(10rem,1fr)_10rem_11rem_8rem_auto] xl:items-end"
        onSubmit={(event) => {
          event.preventDefault()
          void submit(event.currentTarget)
        }}
      >
        <label className="grid gap-1.5 text-xs font-medium">
          ชื่อรอบ
          <Input maxLength={80} name="roundName" required />
        </label>
        <label className="grid gap-1.5 text-xs font-medium">
          ลำดับคู่
          <Input max={99} min={1} name="sequence" required type="number" />
        </label>
        <TeamCombobox
          label="ทีมเหย้า"
          onValueChange={setHomeTeam}
          teams={teams}
          value={homeTeam}
        />
        <TeamCombobox
          label="ทีมเยือน"
          onValueChange={setAwayTeam}
          teams={teams}
          value={awayTeam}
        />
        <label className="grid gap-1.5 text-xs font-medium">
          วันและเวลา
          <Input name="scheduledAt" required type="datetime-local" />
        </label>
        <label className="grid gap-1.5 text-xs font-medium">
          สนาม
          <Input maxLength={120} name="court" required />
        </label>
        <div className="grid min-w-0 gap-1.5">
          <label className="text-xs font-medium" htmlFor="match-purpose">
            ประเภทคู่แข่งขัน
          </label>
          <Select
            items={matchPurposeOptions}
            onValueChange={(value) => setPurpose(value as MatchPurpose)}
            value={purpose}
          >
            <SelectTrigger className="h-10! w-full" id="match-purpose">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {matchPurposeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button disabled={pending || teams.length < 2} size="lg" type="submit">
          <Plus aria-hidden="true" />
          {pending ? "กำลังเพิ่ม" : "เพิ่มคู่แข่งขัน"}
        </Button>
      </form>
      {message ? (
        <p aria-live="polite" className="mt-4 text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </section>
  )
}

const matchPurposeOptions = [
  { label: "คู่แข่งขันทั่วไป", value: "STANDARD" },
  { label: "ชิงอันดับ 3", value: "THIRD_PLACE" },
  { label: "ชิงชนะเลิศ", value: "CHAMPIONSHIP" },
] satisfies Array<{ label: string; value: MatchPurpose }>

function TeamCombobox({
  label,
  teams,
  value,
  onValueChange,
}: {
  label: string
  teams: TeamOption[]
  value: TeamOption | null
  onValueChange: (team: TeamOption | null) => void
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-xs font-medium" htmlFor={`team-${label}`}>
        {label}
      </label>
      <Combobox.Root
        autoHighlight
        filter={(team, query) =>
          team.name.toLocaleLowerCase("th-TH").includes(query.trim().toLocaleLowerCase("th-TH"))
        }
        itemToStringLabel={(team) => team.name}
        items={teams}
        onValueChange={onValueChange}
        value={value}
      >
        <Combobox.InputGroup className="flex h-10 w-full items-center border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <Combobox.Input
            className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
            id={`team-${label}`}
            placeholder="ค้นหาทีม"
            required
          />
          <Combobox.Trigger
            aria-label={`เปิดรายชื่อ${label}`}
            className="flex size-10 shrink-0 items-center justify-center text-muted-foreground"
          >
            <ChevronDown aria-hidden="true" className="size-4" />
          </Combobox.Trigger>
        </Combobox.InputGroup>
        <Combobox.Portal>
          <Combobox.Positioner className="z-50" sideOffset={4}>
            <Combobox.Popup className="max-h-(--available-height) w-(--anchor-width) min-w-56 overflow-y-auto border border-border bg-popover p-1 shadow-md">
              <Combobox.List>
                {(team: TeamOption) => (
                  <Combobox.Item
                    className="flex min-h-9 cursor-default items-center px-2 text-sm outline-none data-highlighted:bg-accent data-selected:font-medium"
                    key={team.id}
                    value={team}
                  >
                    {team.name}
                  </Combobox.Item>
                )}
              </Combobox.List>
              <Combobox.Empty className="px-2 py-3 text-sm text-muted-foreground">
                ไม่พบทีมที่ค้นหา
              </Combobox.Empty>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  )
}
