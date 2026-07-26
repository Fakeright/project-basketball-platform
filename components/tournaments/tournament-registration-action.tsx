"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

interface OwnedTeamOption {
  id: string
  name: string
}

export function TournamentRegistrationAction({
  tournamentId,
  teams,
}: {
  tournamentId: string
  teams: OwnedTeamOption[]
}) {
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id ?? "")
  const [isPending, setIsPending] = useState(false)
  const [feedback, setFeedback] = useState("")

  async function submitRegistration() {
    if (!selectedTeamId || isPending) return

    setIsPending(true)
    setFeedback("")
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/registrations`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ teamId: selectedTeamId }),
        },
      )
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          payload?.message ?? "ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่",
        )
      }

      setFeedback("ส่งใบสมัครเรียบร้อยแล้ว รอผู้จัดการแข่งขันพิจารณา")
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่",
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <section className="border-y border-border py-5">
      <p className="text-xs font-semibold text-court">TEAM REGISTRATION</p>
      <h2 className="mt-2 text-lg font-semibold">สมัครเข้าร่วมการแข่งขัน</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="grid gap-1.5 text-sm font-medium">
          ทีมที่สมัคร
          <select
            className="h-10 border border-input bg-background px-3 text-sm disabled:opacity-60"
            disabled={isPending}
            onChange={(event) => setSelectedTeamId(event.target.value)}
            value={selectedTeamId}
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
        <Button
          disabled={isPending || !selectedTeamId}
          onClick={submitRegistration}
          type="button"
        >
          {isPending ? "กำลังส่งใบสมัคร" : "สมัครแข่งขัน"}
        </Button>
      </div>
      <p
        aria-live="polite"
        className="mt-3 min-h-5 text-sm text-muted-foreground"
        role="status"
      >
        {feedback}
      </p>
    </section>
  )
}
