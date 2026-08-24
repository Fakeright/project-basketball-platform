"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import type { TournamentRegistrationAvailability } from "@/features/tournaments/application/get-tournament-registration-options"

interface OwnedTeamOption {
  id: string
  name: string
}

interface TournamentRegistrationActionProps {
  tournamentId: string
  teams: OwnedTeamOption[]
  availability?: Exclude<TournamentRegistrationAvailability, "HIDDEN">
}

export function TournamentRegistrationAction(
  props: TournamentRegistrationActionProps,
) {
  return (
    <TournamentRegistrationActionState
      key={props.tournamentId}
      {...props}
    />
  )
}

function TournamentRegistrationActionState({
  tournamentId,
  teams,
  availability = "AVAILABLE",
}: TournamentRegistrationActionProps) {
  const router = useRouter()
  const serverTeamSignature = `${tournamentId}:${teams
    .map((team) => team.id)
    .join("|")}`
  const [optimisticSubmissions, setOptimisticSubmissions] = useState(() => ({
    serverTeamSignature,
    ids: new Set<string>(),
  }))
  const reconciledSubmittedIds =
    optimisticSubmissions.serverTeamSignature === serverTeamSignature
      ? optimisticSubmissions.ids
      : new Set(
          [...optimisticSubmissions.ids].filter((id) =>
            teams.some((team) => team.id === id),
          ),
        )

  if (optimisticSubmissions.serverTeamSignature !== serverTeamSignature) {
    setOptimisticSubmissions({
      serverTeamSignature,
      ids: reconciledSubmittedIds,
    })
  }

  const availableTeams = teams.filter(
    (team) => !reconciledSubmittedIds.has(team.id),
  )
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id ?? "")
  const validSelectedTeamId = availableTeams.some(
    (team) => team.id === selectedTeamId,
  )
    ? selectedTeamId
    : availableTeams[0]?.id ?? ""
  const [isPending, setIsPending] = useState(false)
  const [feedback, setFeedback] = useState("")
  const submittedAllTeams =
    availableTeams.length === 0 && feedback.startsWith("ส่งใบสมัครเรียบร้อยแล้ว")

  async function submitRegistration() {
    if (!validSelectedTeamId || isPending) return

    setIsPending(true)
    setFeedback("")
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/registrations`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ teamId: validSelectedTeamId }),
        },
      )
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          payload?.message ?? "ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่",
        )
      }

      setOptimisticSubmissions((current) => ({
        ...current,
        ids: new Set(current.ids).add(validSelectedTeamId),
      }))
      setFeedback("ส่งใบสมัครเรียบร้อยแล้ว รอผู้จัดการแข่งขันพิจารณา")
      router.refresh()
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
      {availableTeams.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label className="grid gap-1.5 text-sm font-medium">
            ทีมที่สมัคร
            <select
              className="h-10 border border-input bg-background px-3 text-sm disabled:opacity-60"
              disabled={isPending}
              onChange={(event) => setSelectedTeamId(event.target.value)}
              value={validSelectedTeamId}
            >
              {availableTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            disabled={isPending || !validSelectedTeamId}
            onClick={submitRegistration}
            type="button"
          >
            {isPending ? "กำลังส่งใบสมัคร" : "สมัครแข่งขัน"}
          </Button>
        </div>
      ) : submittedAllTeams ? (
        <p className="mt-4 text-sm font-medium">ส่งใบสมัครแล้ว</p>
      ) : (
        <RegistrationAvailabilityMessage availability={availability} />
      )}
      {availableTeams.length > 0 ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          ระบบจะตรวจสอบกำหนดปิดรับสมัคร จำนวนทีม และรายชื่อสมาชิกอีกครั้งเมื่อส่งใบสมัคร
        </p>
      ) : null}
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

function RegistrationAvailabilityMessage({
  availability,
}: {
  availability: Exclude<TournamentRegistrationAvailability, "HIDDEN">
}) {
  const messages = {
    AVAILABLE: "ยังไม่มีทีมที่พร้อมสมัครรายการนี้",
    NO_TEAMS: "ยังไม่มีทีมสำหรับสมัครแข่งขัน",
    ALREADY_APPLIED: "ทีมของคุณสมัครรายการนี้แล้ว",
    CLOSED: "รายการนี้ปิดรับสมัครแล้ว",
    ERROR: "ไม่สามารถโหลดข้อมูลการสมัครได้",
  } as const

  return (
    <div className="mt-4 border-l-2 border-court pl-4">
      <p className="text-sm font-medium">{messages[availability]}</p>
      {availability === "NO_TEAMS" ? (
        <Link
          className="mt-2 inline-block text-sm font-medium text-court underline underline-offset-4"
          href="/team/new"
        >
          สร้างทีม
        </Link>
      ) : null}
    </div>
  )
}
