import Image from "next/image"
import { ExternalLink } from "lucide-react"

import type { ExternalBracketRevision } from "@/features/competition/application/ports/external-bracket-repository"

export function ExternalBracketPreview({
  revision,
  previewUrl,
}: {
  revision: ExternalBracketRevision
  previewUrl: string
}) {
  const isPdf = revision.mediaAsset.contentType === "application/pdf"

  return (
    <figure className="min-w-0 border-y border-border py-4">
      <div className="max-h-[70vh] min-h-72 overflow-auto bg-muted/30">
        {isPdf ? (
          <iframe
            className="h-[70vh] min-h-[32rem] w-full"
            src={previewUrl}
            title={`ตัวอย่าง ${revision.mediaAsset.fileName}`}
          />
        ) : (
          <Image
            alt={`สายการแข่งขัน ${revision.mediaAsset.fileName}`}
            className="h-auto w-full object-contain"
            height={1200}
            src={previewUrl}
            unoptimized
            width={1600}
          />
        )}
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="min-w-0 break-all">{revision.mediaAsset.fileName}</span>
        <a
          className="inline-flex min-h-10 items-center gap-2 font-medium text-court underline-offset-4 hover:underline"
          href={previewUrl}
          rel="noreferrer"
          target="_blank"
        >
          เปิดไฟล์ในแท็บใหม่
          <ExternalLink aria-hidden="true" className="size-4" />
        </a>
      </figcaption>
    </figure>
  )
}
