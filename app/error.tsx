"use client"

import { Button } from "@/components/ui/button"
import { StatePanel } from "@/components/state-panel"

export default function Error({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <StatePanel kind="error">
      <Button onClick={unstable_retry}>ลองอีกครั้ง</Button>
    </StatePanel>
  )
}
