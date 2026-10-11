import { Download, FileText } from "lucide-react"

import type { PublicDocumentLink } from "@/features/tournament-media/application/get-public-tournament-media"

export function TournamentDocumentList({
  documents,
}: {
  documents: PublicDocumentLink[]
}) {
  return (
    <section aria-labelledby="tournament-documents-heading" className="border-t border-border pt-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-court">DOCUMENTS</p>
          <h2 className="mt-2 text-xl font-semibold" id="tournament-documents-heading">เอกสารการแข่งขัน</h2>
        </div>
        <p className="text-sm text-muted-foreground">{documents.length} ไฟล์</p>
      </div>
      {documents.length ? (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {documents.map((document) => (
            <li className="flex min-h-16 items-center justify-between gap-4 py-3" key={document.id}>
              <span className="flex min-w-0 items-center gap-3">
                <FileText aria-hidden="true" className="shrink-0 text-court" size={19} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{document.fileName}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{formatFileSize(document.byteSize)}</span>
                </span>
              </span>
              <a aria-label={`ดาวน์โหลด ${document.fileName}`} className="inline-flex min-h-10 shrink-0 items-center gap-2 border border-foreground px-3 text-sm font-medium" href={document.url}>
                <Download aria-hidden="true" size={16} />
                ดาวน์โหลด
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 border-y border-border py-5 text-sm text-muted-foreground">ยังไม่มีเอกสารที่เผยแพร่สำหรับรายการนี้</p>
      )}
    </section>
  )
}

function formatFileSize(byteSize: number) {
  return byteSize >= 1_000_000
    ? `${(byteSize / 1_000_000).toFixed(1)} MB`
    : `${Math.ceil(byteSize / 1_000)} KB`
}
