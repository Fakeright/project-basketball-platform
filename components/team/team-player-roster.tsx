"use client"

import { Pencil, UserMinus } from "lucide-react"
import { useState } from "react"

import { TeamPlayerBatchForm } from "@/components/team/team-player-batch-form"
import {
  playerDraftFromValues,
  playerValuesFromDraft,
  TeamPlayerFields,
  type TeamPlayerField,
  type TeamPlayerFieldErrors,
  type TeamPlayerFormValues,
  validatePlayerValues,
} from "@/components/team/team-player-fields"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type {
  TeamFormat,
  TeamPlayer,
} from "@/features/team-management/domain/team"

interface PlayerFieldIssue {
  field: string
  message: string
}

export function TeamPlayerRoster({
  format,
  initialPlayers,
  teamId,
}: {
  format: TeamFormat
  initialPlayers: TeamPlayer[]
  teamId: string
}) {
  const [players, setPlayers] = useState(() => initialPlayers.filter((player) => player.isActive))
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<TeamPlayerFormValues | null>(null)
  const [editErrors, setEditErrors] = useState<TeamPlayerFieldErrors>({})
  const [pendingPlayerId, setPendingPlayerId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const minimumPlayers = format === "FIVE_V_FIVE" ? 5 : 3
  const formatLabel = format === "FIVE_V_FIVE" ? "5v5" : "3v3"

  function startEditing(player: TeamPlayer) {
    setEditingPlayerId(player.id)
    setEditValues(playerValuesFromDraft(player))
    setEditErrors({})
    setMessage(null)
  }

  function updateEditValue(field: TeamPlayerField, value: string) {
    setEditValues((current) => current ? { ...current, [field]: value } : current)
    setEditErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function savePlayer(player: TeamPlayer) {
    if (!editValues || pendingPlayerId) return
    const errors = validatePlayerValues(editValues)
    setEditErrors(errors)
    if (Object.keys(errors).length > 0) {
      setMessage("กรุณาตรวจสอบข้อมูลผู้เล่น")
      return
    }

    setPendingPlayerId(player.id)
    setMessage(null)
    try {
      const response = await fetch(`/api/teams/${teamId}/players/${player.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playerDraftFromValues(editValues)),
      })
      const result = (await response.json()) as {
        issues?: PlayerFieldIssue[]
        message?: string
        player?: TeamPlayer
      }
      if (!response.ok || !result.player) {
        if (response.status === 422 && result.issues) {
          setEditErrors(
            result.issues.reduce<TeamPlayerFieldErrors>((errors, issue) => {
              if (isPlayerField(issue.field)) errors[issue.field] = issue.message
              return errors
            }, {}),
          )
        }
        setMessage(result.message ?? "ไม่สามารถแก้ไขผู้เล่นได้")
        return
      }

      setPlayers((current) =>
        current.map((candidate) => candidate.id === player.id ? result.player! : candidate),
      )
      setEditingPlayerId(null)
      setEditValues(null)
      setMessage("แก้ไขข้อมูลผู้เล่นแล้ว")
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองอีกครั้ง")
    } finally {
      setPendingPlayerId(null)
    }
  }

  async function deactivatePlayer(player: TeamPlayer) {
    const name = playerDisplayName(player)
    const remainingPlayers = players.length - 1
    const minimumWarning = remainingPlayers < minimumPlayers
      ? `\nคำเตือน: หลังนำออก ทีม ${formatLabel} จะเหลือผู้เล่น ${remainingPlayers} คน ซึ่งต่ำกว่าขั้นต่ำ ${minimumPlayers} คนสำหรับสมัครแข่งขัน`
      : ""
    if (!window.confirm(`ยืนยันการนำ ${name} ออกจากทีม${minimumWarning}`)) return

    setPendingPlayerId(player.id)
    setMessage(null)
    try {
      const response = await fetch(`/api/teams/${teamId}/players/${player.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const result = (await response.json()) as { message?: string }
        setMessage(result.message ?? "ไม่สามารถนำผู้เล่นออกจากทีมได้")
        return
      }

      setPlayers((current) => current.filter((candidate) => candidate.id !== player.id))
      if (editingPlayerId === player.id) {
        setEditingPlayerId(null)
        setEditValues(null)
      }
      setMessage("นำผู้เล่นออกจากทีมแล้ว")
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองอีกครั้ง")
    } finally {
      setPendingPlayerId(null)
    }
  }

  return (
    <section className="border-t border-border pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-court">ROSTER</p>
          <h2 className="mt-2 text-xl font-semibold">รายชื่อผู้เล่น</h2>
        </div>
        <p className="text-sm font-medium">ผู้เล่นที่ใช้งาน {players.length} คน</p>
      </div>

      {players.length < minimumPlayers ? (
        <p className="mt-4 border-l-4 border-court px-3 py-2 text-sm">
          ทีม {formatLabel} ต้องมีผู้เล่นอย่างน้อย {minimumPlayers} คนก่อนสมัครแข่งขัน
        </p>
      ) : null}

      <TeamPlayerBatchForm
        onPlayersAdded={(addedPlayers) => setPlayers((current) => [...current, ...addedPlayers])}
        teamId={teamId}
      />

      <p aria-live="polite" className="min-h-10 py-3 text-sm text-muted-foreground">
        {message}
      </p>

      {players.length === 0 ? (
        <p className="border-y border-border py-6 text-sm text-muted-foreground">ยังไม่มีผู้เล่นในทีม</p>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {players.map((player) => {
            const name = playerDisplayName(player)
            const isEditing = editingPlayerId === player.id && editValues
            return (
              <li className="min-w-0 py-4" key={player.id}>
                {isEditing ? (
                  <fieldset aria-label={`แก้ไขผู้เล่น ${name}`} className="min-w-0">
                    <legend className="mb-4 font-medium">แก้ไขผู้เล่น {name}</legend>
                    <TeamPlayerFields
                      disabled={pendingPlayerId === player.id}
                      errors={editErrors}
                      idPrefix={`edit-${player.id}`}
                      onChange={updateEditValue}
                      values={editValues}
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        disabled={pendingPlayerId !== null}
                        onClick={() => savePlayer(player)}
                        type="button"
                      >
                        บันทึกการแก้ไข
                      </Button>
                      <Button
                        disabled={pendingPlayerId !== null}
                        onClick={() => {
                          setEditingPlayerId(null)
                          setEditValues(null)
                          setEditErrors({})
                        }}
                        type="button"
                        variant="outline"
                      >
                        ยกเลิก
                      </Button>
                    </div>
                  </fieldset>
                ) : (
                  <div className="grid min-w-0 gap-3 text-sm md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto] md:items-center">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{name}</p>
                      {player.nickname ? <p className="mt-1 text-muted-foreground">ชื่อเล่น {player.nickname}</p> : null}
                    </div>
                    <p><span className="text-muted-foreground">วันเกิด </span>{player.birthDate}</p>
                    <p><span className="text-muted-foreground">เบอร์เสื้อ </span>{player.jerseyNumber ?? "-"}</p>
                    <p><span className="text-muted-foreground">ตำแหน่ง </span>{player.position ?? "-"}</p>
                    <div className="flex min-w-20 justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              aria-label={`แก้ไขผู้เล่น ${name}`}
                              disabled={pendingPlayerId !== null}
                              onClick={() => startEditing(player)}
                              size="icon"
                              title="แก้ไขผู้เล่น"
                              type="button"
                              variant="ghost"
                            >
                              <Pencil aria-hidden="true" />
                            </Button>
                          }
                        />
                        <TooltipContent>แก้ไขผู้เล่น</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              aria-label={`นำผู้เล่น ${name} ออกจากทีม`}
                              disabled={pendingPlayerId !== null}
                              onClick={() => deactivatePlayer(player)}
                              size="icon"
                              title="นำผู้เล่นออกจากทีม"
                              type="button"
                              variant="ghost"
                            >
                              <UserMinus aria-hidden="true" />
                            </Button>
                          }
                        />
                        <TooltipContent>นำผู้เล่นออกจากทีม</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function playerDisplayName(player: TeamPlayer) {
  return `${player.firstName} ${player.lastName}`
}

function isPlayerField(field: string): field is TeamPlayerField {
  return [
    "firstName",
    "lastName",
    "birthDate",
    "nickname",
    "jerseyNumber",
    "position",
    "phone",
  ].includes(field)
}
