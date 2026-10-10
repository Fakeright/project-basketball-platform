"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import type { ReusableTeamPlayer } from "@/features/team-management/domain/team-player-history"

interface ReusablePlayerSelectorProps {
  players: readonly ReusableTeamPlayer[]
  selectedKeys: ReadonlySet<string>
  onSelectionChange: (keys: Set<string>) => void
  maximumSelection: number
}

interface VisibleTeamGroup {
  id: string
  name: string
  players: ReusableTeamPlayer[]
}

interface SelectionLimitNotice {
  maximumSelection: number
  selectionSignature: string
  text: string
}

export function ReusablePlayerSelector({
  maximumSelection,
  onSelectionChange,
  players,
  selectedKeys,
}: ReusablePlayerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [limitNotice, setLimitNotice] = useState<SelectionLimitNotice | null>(null)
  const visiblePlayers = useMemo(
    () => players.filter((player) => matchesSearch(player, searchQuery)),
    [players, searchQuery],
  )
  const visibleGroups = useMemo(() => groupPlayersBySourceTeam(visiblePlayers), [visiblePlayers])
  const visibleKeys = useMemo(() => uniqueVisibleKeys(visibleGroups), [visibleGroups])

  function updateSelection(keys: readonly string[]) {
    const nextKeys = new Set(selectedKeys)
    const allSelected = keys.length > 0 && keys.every((key) => nextKeys.has(key))

    if (allSelected) {
      for (const key of keys) nextKeys.delete(key)
      setLimitNotice(null)
      onSelectionChange(nextKeys)
      return
    }

    let reachedLimit = false
    for (const key of keys) {
      if (nextKeys.has(key)) continue
      if (nextKeys.size >= maximumSelection) {
        reachedLimit = true
        continue
      }
      nextKeys.add(key)
    }

    setLimitNotice(
      reachedLimit
        ? {
            maximumSelection,
            selectionSignature: selectedKeySignature(nextKeys),
            text: selectionLimitMessage(maximumSelection),
          }
        : null,
    )
    onSelectionChange(nextKeys)
  }

  function togglePlayer(key: string) {
    if (selectedKeys.has(key)) {
      const nextKeys = new Set(selectedKeys)
      nextKeys.delete(key)
      setLimitNotice(null)
      onSelectionChange(nextKeys)
      return
    }

    if (selectedKeys.size >= maximumSelection) {
      setLimitNotice({
        maximumSelection,
        selectionSignature: selectedKeySignature(selectedKeys),
        text: selectionLimitMessage(maximumSelection),
      })
      return
    }

    const nextKeys = new Set(selectedKeys)
    nextKeys.add(key)
    setLimitNotice(null)
    onSelectionChange(nextKeys)
  }

  return (
    <section className="min-w-0 border-y border-border py-5" aria-labelledby="reusable-player-title">
      <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,20rem)] sm:items-end">
        <div className="min-w-0">
          <h2 className="text-base font-semibold" id="reusable-player-title">
            เลือกจากผู้เล่นเดิม
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            เลือกแล้ว {selectedKeys.size} จาก {maximumSelection} คน
          </p>
        </div>
        <label className="grid min-w-0 gap-1 text-sm font-medium">
          ค้นหาผู้เล่นเดิม
          <input
            className="h-10 min-w-0 border border-input bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="ชื่อ นามสกุล หรือชื่อเล่น"
            type="search"
            value={searchQuery}
          />
        </label>
      </div>

      <label className="mt-5 flex min-h-6 min-w-6 cursor-pointer items-center gap-3 border-b border-border pb-3">
        <IndeterminateCheckbox
          ariaLabel="เลือกผู้เล่นเดิมทั้งหมด"
          checked={allKeysSelected(visibleKeys, selectedKeys)}
          indeterminate={someKeysSelected(visibleKeys, selectedKeys)}
          onChange={() => updateSelection(visibleKeys)}
        />
        <span className="min-w-0 text-sm font-semibold">เลือกทั้งหมด</span>
      </label>

      {visibleGroups.length === 0 ? (
        <p className="py-8 text-sm text-muted-foreground">ไม่พบผู้เล่นที่ตรงกับคำค้นหา</p>
      ) : (
        <div className="divide-y divide-border">
          {visibleGroups.map((group) => {
            const groupKeys = group.players.map((player) => player.key)
            return (
              <fieldset
                aria-label={`ผู้เล่นเดิมจากทีม ${group.name}`}
                className="min-w-0 py-5"
                key={group.id}
              >
                <label className="mb-3 flex min-h-6 min-w-6 cursor-pointer items-center gap-3">
                  <IndeterminateCheckbox
                    ariaLabel={`เลือกผู้เล่นทั้งหมดจากทีม ${group.name}`}
                    checked={allKeysSelected(groupKeys, selectedKeys)}
                    indeterminate={someKeysSelected(groupKeys, selectedKeys)}
                    onChange={() => updateSelection(groupKeys)}
                  />
                  <span className="min-w-0 break-words text-sm font-semibold">{group.name}</span>
                </label>

                <div className="divide-y divide-border border-t border-border">
                  {group.players.map((player) => {
                    const fullName = `${player.player.firstName} ${player.player.lastName}`
                    return (
                      <label
                        className="grid min-h-6 min-w-6 cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-3 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
                        key={`${group.id}:${player.key}`}
                      >
                        <input
                          aria-label={`เลือก ${fullName}`}
                          checked={selectedKeys.has(player.key)}
                          className="mt-1 size-4 shrink-0 accent-court sm:mt-0"
                          onChange={() => togglePlayer(player.key)}
                          type="checkbox"
                        />
                        <span className="min-w-0">
                          <span className="block break-words text-sm font-medium">{fullName}</span>
                          {player.player.nickname ? (
                            <span className="mt-0.5 block break-words text-xs text-muted-foreground">
                              ชื่อเล่น {player.player.nickname}
                            </span>
                          ) : null}
                          <span className="mt-1 block break-words text-xs text-muted-foreground">
                            ทีมเดิม: {player.sourceTeams.map((team) => team.name).join(", ")}
                          </span>
                        </span>
                        <span className="col-start-2 w-fit border border-border px-2 py-1 text-xs font-medium sm:col-start-auto">
                          {player.isActive ? "ใช้งานอยู่" : "เคยนำออก"}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            )
          })}
        </div>
      )}

      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-destructive" role="status">
        {limitNotice?.maximumSelection === maximumSelection &&
        limitNotice.selectionSignature === selectedKeySignature(selectedKeys)
          ? limitNotice.text
          : ""}
      </p>
    </section>
  )
}

function IndeterminateCheckbox({
  ariaLabel,
  checked,
  indeterminate,
  onChange,
}: {
  ariaLabel: string
  checked: boolean
  indeterminate: boolean
  onChange: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate && !checked
  }, [checked, indeterminate])

  return (
    <input
      aria-label={ariaLabel}
      checked={checked}
      className="size-4 shrink-0 accent-court"
      onChange={onChange}
      ref={inputRef}
      type="checkbox"
    />
  )
}

function matchesSearch(player: ReusableTeamPlayer, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("th-TH")
  if (!normalizedQuery) return true

  return [player.player.firstName, player.player.lastName, player.player.nickname ?? ""].some(
    (value) => value.toLocaleLowerCase("th-TH").includes(normalizedQuery),
  )
}

function groupPlayersBySourceTeam(players: readonly ReusableTeamPlayer[]): VisibleTeamGroup[] {
  const groups = new Map<string, VisibleTeamGroup>()

  for (const player of players) {
    for (const sourceTeam of player.sourceTeams) {
      const group = groups.get(sourceTeam.id)
      if (group) {
        group.players.push(player)
      } else {
        groups.set(sourceTeam.id, {
          id: sourceTeam.id,
          name: sourceTeam.name,
          players: [player],
        })
      }
    }
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      players: [...group.players].sort((left, right) => compareStrings(left.key, right.key)),
    }))
    .sort((left, right) => compareStrings(left.id, right.id))
}

function uniqueVisibleKeys(groups: readonly VisibleTeamGroup[]) {
  const keys = new Set<string>()
  for (const group of groups) {
    for (const player of group.players) keys.add(player.key)
  }
  return [...keys]
}

function allKeysSelected(keys: readonly string[], selectedKeys: ReadonlySet<string>) {
  return keys.length > 0 && keys.every((key) => selectedKeys.has(key))
}

function someKeysSelected(keys: readonly string[], selectedKeys: ReadonlySet<string>) {
  const selectedCount = keys.filter((key) => selectedKeys.has(key)).length
  return selectedCount > 0 && selectedCount < keys.length
}

function selectionLimitMessage(maximumSelection: number) {
  return `เลือกได้สูงสุด ${maximumSelection} คน กรุณานำผู้เล่นออกก่อนเลือกเพิ่ม`
}

function selectedKeySignature(selectedKeys: ReadonlySet<string>) {
  return [...selectedKeys].sort(compareStrings).join("\u0000")
}

function compareStrings(left: string, right: string) {
  if (left === right) return 0
  return left < right ? -1 : 1
}
