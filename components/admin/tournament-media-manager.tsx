"use client"

import { FileText, ImageUp, Trash2 } from "lucide-react"
import Image from "next/image"
import { useMemo, useState } from "react"

import { getMediaMaximumBytes } from "@/features/tournament-media/domain/media-policy"

export interface TournamentMediaManagerAsset {
  id: string
  kind: "POSTER" | "DOCUMENT"
  fileName: string
  contentType: string
  byteSize: number
  publicUrl?: string
}

export function TournamentMediaManager({
  tournamentId,
  assets,
}: {
  tournamentId: string
  assets: TournamentMediaManagerAsset[]
}) {
  const [currentAssets, setCurrentAssets] = useState(assets)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const poster = useMemo(
    () => currentAssets.find((asset) => asset.kind === "POSTER"),
    [currentAssets],
  )
  const documents = currentAssets.filter((asset) => asset.kind === "DOCUMENT")

  async function upload(kind: "POSTER" | "DOCUMENT", file: File) {
    const limit = getMediaMaximumBytes(kind)
    if (file.size > limit) {
      setMessage(kind === "POSTER" ? "รูปโปสเตอร์ต้องมีขนาดไม่เกิน 5 MB" : "เอกสารต้องมีขนาดไม่เกิน 10 MB")
      return
    }
    setPending(true)
    setMessage(null)
    const formData = new FormData()
    formData.set("kind", kind)
    formData.set("file", file)
    try {
      const response = await fetch(`/api/admin/tournaments/${tournamentId}/media`, {
        method: "POST",
        body: formData,
      })
      const result = (await response.json()) as {
        asset?: TournamentMediaManagerAsset
        message?: string
      }
      if (!response.ok || !result.asset) {
        setMessage(result.message ?? "ไม่สามารถอัปโหลดไฟล์ได้")
        return
      }
      setCurrentAssets((existing) => [
        ...existing.filter((asset) => asset.kind !== kind || kind === "DOCUMENT"),
        result.asset!,
      ])
      setMessage(kind === "POSTER" ? "อัปโหลดโปสเตอร์แล้ว" : "อัปโหลดเอกสารแล้ว")
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบ กรุณาลองอีกครั้ง")
    } finally {
      setPending(false)
    }
  }

  async function remove(asset: TournamentMediaManagerAsset) {
    if (!window.confirm(`ลบไฟล์ ${asset.fileName} ใช่หรือไม่`)) return
    setPending(true)
    setMessage(null)
    try {
      const response = await fetch(
        `/api/admin/tournaments/${tournamentId}/media/${asset.id}`,
        { method: "DELETE" },
      )
      if (!response.ok) {
        const result = (await response.json()) as { message?: string }
        setMessage(result.message ?? "ไม่สามารถลบไฟล์ได้")
        return
      }
      setCurrentAssets((existing) => existing.filter((item) => item.id !== asset.id))
      setMessage("ลบไฟล์แล้ว")
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อระบบ กรุณาลองอีกครั้ง")
    } finally {
      setPending(false)
    }
  }

  return (
    <section aria-labelledby="tournament-media-heading" className="border-t border-border pt-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold text-court">MEDIA</p>
        <h2 className="mt-2 text-xl font-semibold" id="tournament-media-heading">สื่อและเอกสาร</h2>
        <p className="mt-2 text-sm text-muted-foreground">โปสเตอร์ใช้ JPG, PNG หรือ WebP ไม่เกิน 5 MB และเอกสารใช้ PDF, DOC หรือ DOCX ไม่เกิน 10 MB</p>
      </div>

      <div className="mt-5 grid gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <div>
          <div className="relative aspect-[4/5] border border-border bg-muted">
            {poster?.publicUrl ? (
              <Image
                alt="ตัวอย่างโปสเตอร์การแข่งขัน"
                className="object-cover"
                fill
                sizes="12rem"
                src={poster.publicUrl}
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">ยังไม่มีโปสเตอร์</div>
            )}
          </div>
          <label className="mt-3 inline-flex min-h-10 cursor-pointer items-center gap-2 border border-foreground px-3 text-sm">
            <ImageUp aria-hidden="true" size={16} />
            {poster ? "เปลี่ยนโปสเตอร์" : "อัปโหลดโปสเตอร์"}
            <input
              accept="image/jpeg,image/png,image/webp"
              aria-label="โปสเตอร์การแข่งขัน"
              className="sr-only"
              disabled={pending}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void upload("POSTER", file)
                event.currentTarget.value = ""
              }}
              type="file"
            />
          </label>
          {poster ? (
            <button className="mt-2 inline-flex min-h-9 items-center gap-2 text-sm text-destructive" disabled={pending} onClick={() => void remove(poster)} type="button">
              <Trash2 aria-hidden="true" size={15} /> ลบโปสเตอร์
            </button>
          ) : null}
        </div>

        <div>
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 border border-foreground px-3 text-sm">
            <FileText aria-hidden="true" size={16} /> เพิ่มเอกสาร
            <input
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              aria-label="เอกสารการแข่งขัน"
              className="sr-only"
              disabled={pending}
              multiple
              onChange={(event) => {
                for (const file of Array.from(event.target.files ?? [])) void upload("DOCUMENT", file)
                event.currentTarget.value = ""
              }}
              type="file"
            />
          </label>
          {documents.length ? (
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {documents.map((asset) => (
                <li className="flex min-h-14 items-center justify-between gap-3 py-3" key={asset.id}>
                  <span className="min-w-0 truncate text-sm">{asset.fileName} <span className="text-muted-foreground">· {formatFileSize(asset.byteSize)}</span></span>
                  <button aria-label={`ลบ ${asset.fileName}`} className="min-h-9 px-2 text-destructive" disabled={pending} onClick={() => void remove(asset)} type="button"><Trash2 aria-hidden="true" size={16} /></button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 border-y border-border py-6 text-sm text-muted-foreground">ยังไม่มีเอกสารการแข่งขัน</p>
          )}
        </div>
      </div>
      {message ? <p aria-live="polite" className="mt-5 border-l-4 border-court px-3 py-2 text-sm">{message}</p> : null}
    </section>
  )
}

function formatFileSize(byteSize: number) {
  return byteSize >= 1_000_000 ? `${(byteSize / 1_000_000).toFixed(1)} MB` : `${Math.ceil(byteSize / 1_000)} KB`
}
