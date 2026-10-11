"use client"

import { StatePanel } from "@/components/state-panel"
import { Button } from "@/components/ui/button"

export default function TournamentError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="py-8 sm:py-12">
      <StatePanel
        kind="error"
        message="ไม่สามารถโหลดข้อมูลการแข่งขันได้ในขณะนี้ กรุณาลองอีกครั้ง"
        title="โหลดรายการแข่งขันไม่สำเร็จ"
      >
        {error.digest ? (
          <p className="mb-3 text-xs text-muted-foreground">
            รหัสอ้างอิง {error.digest}
          </p>
        ) : null}
        <Button onClick={unstable_retry} type="button">
          ลองอีกครั้ง
        </Button>
      </StatePanel>
    </div>
  )
}
