import { BracketModeControl } from "@/components/organizer/bracket-mode-control"
import { ExternalBracketPreview } from "@/components/organizer/external-bracket-preview"
import { ExternalBracketRevisionList } from "@/components/organizer/external-bracket-revision-list"
import { ExternalBracketUploader } from "@/components/organizer/external-bracket-uploader"
import type { OrganizerExternalBracketWorkspace as Workspace } from "@/features/competition/application/get-organizer-external-bracket-workspace"

export function ExternalBracketWorkspace({
  tournamentId,
  state,
}: {
  tournamentId: string
  state: Workspace
}) {
  const { modeContext, workspace, publishedPreviewUrl } = state

  return (
    <div className="divide-y divide-border border-y border-border">
      <section className="grid gap-5 py-7 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <div>
          <p className="text-xs font-semibold text-court">02</p>
          <h2 className="mt-1 text-base font-semibold">เลือกรูปแบบสาย</h2>
        </div>
        <BracketModeControl
          currentMode={modeContext.bracketMode}
          expectedVersion={modeContext.bracketVersion}
          locked={modeContext.hasStartedMatch}
          tournamentId={tournamentId}
        />
      </section>

      <section className="grid gap-5 py-7 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <div>
          <p className="text-xs font-semibold text-court">03</p>
          <h2 className="mt-1 text-base font-semibold">ไฟล์ที่เผยแพร่</h2>
        </div>
        <div className="min-w-0">
          {workspace?.publishedRevision && publishedPreviewUrl ? (
            <ExternalBracketPreview
              previewUrl={publishedPreviewUrl}
              revision={workspace.publishedRevision}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              ยังไม่มีไฟล์ที่เผยแพร่ ผู้ชมจะยังไม่เห็นสายการแข่งขัน
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-5 py-7 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <div>
          <p className="text-xs font-semibold text-court">04</p>
          <h2 className="mt-1 text-base font-semibold">อัปโหลดฉบับใหม่</h2>
        </div>
        <ExternalBracketUploader
          expectedVersion={modeContext.bracketVersion}
          tournamentId={tournamentId}
        />
      </section>

      <section className="grid gap-5 py-7 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <div>
          <p className="text-xs font-semibold text-court">05</p>
          <h2 className="mt-1 text-base font-semibold">ประวัติไฟล์</h2>
        </div>
        <ExternalBracketRevisionList
          bracketVersion={modeContext.bracketVersion}
          revisions={workspace?.revisions ?? []}
          tournamentId={tournamentId}
        />
      </section>
    </div>
  )
}
