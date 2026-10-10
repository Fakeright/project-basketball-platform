import Image from "next/image"
import { ExternalLink } from "lucide-react"

import type { PublicExternalBracketView } from "@/features/competition/application/get-external-bracket-view"

export function ExternalBracketView({
  view,
}: {
  view: PublicExternalBracketView
}) {
  const isPdf = view.contentType === "application/pdf"

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-sm font-medium text-court">
            สายการแข่งขันจากไฟล์ผู้จัด
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Revision {view.revision} · {formatDate(view.publishedAt)} ·{" "}
            {formatBytes(view.byteSize)}
          </p>
        </div>
        <a
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
          href={view.previewUrl}
          rel="noreferrer"
          target="_blank"
        >
          เปิดไฟล์ในแท็บใหม่
          <ExternalLink aria-hidden="true" className="size-4" />
        </a>
      </div>
      <div className="max-w-full overflow-x-auto bg-muted/30">
        {isPdf ? (
          <iframe
            className="h-[70vh] min-h-[32rem] w-full min-w-[20rem]"
            src={view.previewUrl}
            title={`สายการแข่งขัน ${view.fileName}`}
          />
        ) : (
          <Image
            alt={`สายการแข่งขัน ${view.fileName}`}
            className="h-auto w-full object-contain"
            height={1200}
            src={view.previewUrl}
            unoptimized
            width={1600}
          />
        )}
      </div>
      <p className="mt-3 break-all text-sm">{view.fileName}</p>
    </section>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value))
}

function formatBytes(value: number) {
  return value < 1_000_000
    ? `${Math.ceil(value / 1_000)} KB`
    : `${(value / 1_000_000).toFixed(1)} MB`
}
