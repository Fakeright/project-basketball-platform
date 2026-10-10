import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  developmentCookieMode: false,
}))

vi.mock(
  "@/features/identity/infrastructure/next-cookie-current-actor-provider",
  () => ({
    isDevelopmentCookieSessionMode: () => mocks.developmentCookieMode,
  }),
)

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

import LoginPage from "@/app/(public)/login/page"

describe("LoginPage development session controls", () => {
  beforeEach(() => {
    mocks.developmentCookieMode = false
  })

  it("hides local role controls when development cookie mode is inactive", async () => {
    const page = await LoginPage({ searchParams: Promise.resolve({}) })
    const markup = renderToStaticMarkup(page)

    expect(markup).not.toContain("Local: Platform Admin")
  })

  it("shows local role controls when development cookie mode is active", async () => {
    mocks.developmentCookieMode = true

    const page = await LoginPage({ searchParams: Promise.resolve({}) })
    const markup = renderToStaticMarkup(page)

    expect(markup).toContain("Local: Platform Admin")
  })
})
