"use client"

import { Button } from "@/components/ui/button"
import { StatePanel } from "@/components/state-panel"

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <StatePanel kind="error">
      <Button onClick={reset}>ลองอีกครั้ง</Button>
    </StatePanel>
  )
}
