import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, it, vi } from "vitest"

import ErrorBoundary from "@/app/error"

it("retries the failed route segment with the Next 16 retry callback", async () => {
  const user = userEvent.setup()
  const unstableRetry = vi.fn()

  render(
    <ErrorBoundary
      error={new Error("route failed")}
      unstable_retry={unstableRetry}
    />,
  )

  await user.click(screen.getByRole("button", { name: "ลองอีกครั้ง" }))

  expect(unstableRetry).toHaveBeenCalledOnce()
})
