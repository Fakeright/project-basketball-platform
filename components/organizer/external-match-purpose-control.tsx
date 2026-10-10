"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MatchPurpose } from "@/features/competition/domain/competition"

const purposeOptions = [
  { label: "คู่แข่งขันทั่วไป", value: "STANDARD" },
  { label: "ชิงอันดับ 3", value: "THIRD_PLACE" },
  { label: "ชิงชนะเลิศ", value: "CHAMPIONSHIP" },
] satisfies Array<{ label: string; value: MatchPurpose }>

export function ExternalMatchPurposeControl({
  tournamentId,
  matchId,
  purpose,
  version,
}: {
  tournamentId: string
  matchId: string
  purpose: MatchPurpose
  version: number
}) {
  const router = useRouter()
  const [selectedPurpose, setSelectedPurpose] = useState(purpose)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function updatePurpose() {
    setPending(true)
    setMessage(null)
    try {
      const response = await fetch(
        `/api/organizer/tournaments/${tournamentId}/matches/${matchId}/purpose`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            purpose: selectedPurpose,
            expectedVersion: version,
          }),
        },
      )
      const result = (await response.json().catch(() => ({}))) as {
        message?: string
      }
      if (!response.ok) {
        setMessage(result.message ?? "ไม่สามารถเปลี่ยนประเภทคู่แข่งขันได้")
        return
      }
      router.refresh()
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบ กรุณาลองใหม่")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mt-3 grid gap-2">
      <Select
        items={purposeOptions}
        onValueChange={(value) => setSelectedPurpose(value as MatchPurpose)}
        value={selectedPurpose}
      >
        <SelectTrigger
          aria-label={`ประเภทคู่แข่งขัน คู่ที่ ${matchId}`}
          className="h-9! w-full max-w-44"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {purposeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        className="w-fit"
        disabled={pending || selectedPurpose === purpose}
        onClick={() => void updatePurpose()}
        size="sm"
        type="button"
        variant="outline"
      >
        <Save aria-hidden="true" />
        {pending ? "กำลังบันทึก" : "บันทึกประเภทคู่"}
      </Button>
      {message ? (
        <p aria-live="polite" className="text-xs text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  )
}
