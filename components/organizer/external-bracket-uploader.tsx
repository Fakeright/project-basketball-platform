"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  assertExternalBracketFile,
  externalBracketContentTypes,
} from "@/features/competition/domain/external-bracket-policy"

const accept = externalBracketContentTypes.join(",")

export function ExternalBracketUploader({
  tournamentId,
  expectedVersion,
}: {
  tournamentId: string
  expectedVersion: number
}) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function selectFile(selected: File | null) {
    setMessage(null)
    if (!selected) {
      setFile(null)
      return
    }
    try {
      assertExternalBracketFile({
        contentType: selected.type,
        byteSize: selected.size,
      })
      setFile(selected)
    } catch (error) {
      setFile(null)
      setMessage(
        error instanceof Error && error.message === "BRACKET_FILE_TOO_LARGE"
          ? "PDF ต้องไม่เกิน 20 MB และรูปภาพต้องไม่เกิน 10 MB"
          : "รองรับเฉพาะ PDF, JPG, PNG หรือ WebP",
      )
    }
  }

  async function upload() {
    if (!file || pending) return
    const body = new FormData()
    body.set("file", file)
    body.set("expectedVersion", String(expectedVersion))
    setPending(true)
    setMessage(null)
    try {
      const response = await fetch(
        `/api/organizer/tournaments/${tournamentId}/bracket/external/revisions`,
        { method: "POST", body },
      )
      const result = (await response.json().catch(() => ({}))) as {
        message?: string
      }
      if (!response.ok) {
        setMessage(result.message ?? "ไม่สามารถอัปโหลดไฟล์ได้")
        return
      }
      setFile(null)
      router.refresh()
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบ กรุณาลองใหม่")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="border border-dashed border-border p-5">
      <label className="block text-sm font-medium" htmlFor="external-bracket-file">
        ไฟล์สายการแข่งขัน
      </label>
      <input
        accept={accept}
        className="mt-3 block w-full text-sm file:mr-4 file:min-h-10 file:border file:border-border file:bg-background file:px-3 file:font-medium"
        disabled={pending}
        id="external-bracket-file"
        onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
        type="file"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        PDF สูงสุด 20 MB · JPG, PNG หรือ WebP สูงสุด 10 MB
      </p>
      {file ? <p className="mt-3 break-all text-sm">{file.name}</p> : null}
      <Button
        className="mt-4"
        disabled={!file || pending}
        onClick={() => void upload()}
        type="button"
      >
        <Upload aria-hidden="true" />
        {pending ? "กำลังอัปโหลด" : "อัปโหลดไฟล์"}
      </Button>
      {message ? (
        <p aria-live="polite" className="mt-3 text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  )
}
