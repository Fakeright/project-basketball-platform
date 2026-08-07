"use client"

import { UserMinus } from "lucide-react"
import { useState } from "react"

import type { TeamMemberCandidate } from "@/features/team-management/application/list-team-member-candidates"
import type { TeamRosterMember } from "@/features/team-management/domain/team"

const fieldClassName =
  "min-h-11 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"

export function RosterManager({
  teamId,
  members: initialMembers,
  candidates,
}: {
  teamId: string
  members: TeamRosterMember[]
  candidates: TeamMemberCandidate[]
}) {
  const [members, setMembers] = useState(initialMembers)
  const [candidateId, setCandidateId] = useState("")
  const [role, setRole] = useState<"PLAYER">("PLAYER")
  const [message, setMessage] = useState<string | null>(null)
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null)
  const availableCandidates = candidates.filter(
    (candidate) => !members.some((member) => member.userId === candidate.id),
  )

  async function addMember() {
    if (!candidateId) {
      setMessage("กรุณาเลือกสมาชิก")
      return
    }

    setMessage(null)
    setPendingMemberId("new")
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: candidateId, role }),
      })
      const result = (await response.json()) as {
        member?: TeamRosterMember
        message?: string
      }
      if (!response.ok || !result.member) {
        setMessage(result.message ?? "ไม่สามารถเพิ่มสมาชิกได้")
        return
      }

      setMembers((current) => [...current, result.member!])
      setCandidateId("")
      setMessage("เพิ่มสมาชิกแล้ว")
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองอีกครั้ง")
    } finally {
      setPendingMemberId(null)
    }
  }

  async function deactivateMember(member: TeamRosterMember) {
    const name = getDisplayName(member.userId, candidates)
    if (!window.confirm(`ยืนยันการนำ ${name} ออกจากทีม`)) return

    setMessage(null)
    setPendingMemberId(member.id)
    try {
      const response = await fetch(`/api/teams/${teamId}/members/${member.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const result = (await response.json()) as { message?: string }
        setMessage(result.message ?? "ไม่สามารถนำสมาชิกออกได้")
        return
      }

      setMembers((current) => current.filter((candidate) => candidate.id !== member.id))
      setMessage("นำสมาชิกออกจากทีมแล้ว")
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองอีกครั้ง")
    } finally {
      setPendingMemberId(null)
    }
  }

  return (
    <section className="border-t border-border pt-8">
      <div>
        <p className="text-xs font-semibold text-court">ROSTER</p>
        <h2 className="mt-2 text-xl font-semibold">รายชื่อผู้เล่นและโค้ช</h2>
      </div>

      <div className="mt-5 grid gap-4 border-y border-border py-5 md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end">
        <label className="space-y-2 text-sm">
          <span>สมาชิก</span>
          <select
            className={fieldClassName}
            onChange={(event) => setCandidateId(event.target.value)}
            value={candidateId}
          >
            <option value="">เลือกสมาชิก</option>
            {availableCandidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.displayName} ({candidate.role === "PLAYER" ? "ผู้เล่น" : "โค้ช"})
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span>หน้าที่ในทีม</span>
          <select
            className={fieldClassName}
            onChange={(event) => setRole(event.target.value as "PLAYER")}
            value={role}
          >
            <option value="PLAYER">ผู้เล่น</option>
          </select>
        </label>
        <button
          className="min-h-11 border border-foreground px-5 text-sm font-medium disabled:opacity-50"
          disabled={pendingMemberId !== null}
          onClick={addMember}
          type="button"
        >
          เพิ่มสมาชิก
        </button>
      </div>

      {message ? (
        <p aria-live="polite" className="mt-4 border-l-4 border-court px-3 py-2 text-sm">
          {message}
        </p>
      ) : null}

      {members.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">ยังไม่มีผู้เล่นในทีม</p>
      ) : (
        <ul className="divide-y divide-border border-b border-border">
          {members.map((member) => {
            const name = getDisplayName(member.userId, candidates)
            return (
              <li
                className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-3 text-sm"
                key={member.id}
              >
                <span className="truncate">{name}</span>
                <span>{member.role === "PLAYER" ? "ผู้เล่น" : "โค้ช"}</span>
                <button
                  aria-label={`นำ ${name} ออกจากทีม`}
                  className="grid size-9 place-items-center border border-border disabled:opacity-50"
                  disabled={pendingMemberId !== null}
                  onClick={() => deactivateMember(member)}
                  title="นำสมาชิกออกจากทีม"
                  type="button"
                >
                  <UserMinus aria-hidden="true" size={16} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function getDisplayName(userId: string, candidates: TeamMemberCandidate[]) {
  return candidates.find((candidate) => candidate.id === userId)?.displayName ?? userId
}
