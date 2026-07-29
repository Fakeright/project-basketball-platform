import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { HomeHeroImage } from "@/components/home-hero-image"
import { Sheet, SheetCloseButton } from "@/components/ui/sheet"
import PublicLayout from "@/app/(public)/layout"
import LoginPage from "@/app/(public)/login/page"

const root = process.cwd()
const heroJpeg = resolve(root, "public/images/courtside-hero.jpg")
const legacyHeroPng = resolve(root, "public/images/courtside-hero.png")

vi.mock(
  "@/features/identity/infrastructure/next-cookie-current-actor-provider",
  () => ({
    createNextCookieCurrentActorProvider: () => ({
      getCurrentActor: async () => null,
    }),
  }),
)

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

describe("public platform accessibility", () => {
  it("shows a recovery error returned by the auth callback", async () => {
    const page = await LoginPage({
      searchParams: Promise.resolve({ error: "auth_callback" }),
    })
    const markup = renderToStaticMarkup(page)

    expect(markup).toContain('role="alert"')
    expect(markup).toContain("ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว")
  })

  it("keeps a single main landmark on the login route", async () => {
    const page = await LoginPage({ searchParams: Promise.resolve({}) })
    const layout = await PublicLayout({ children: page })
    const markup = renderToStaticMarkup(layout)

    expect(markup.match(/<main\b/g)).toHaveLength(1)
  })

  it("ships the supplied hero as a JPEG without retaining the PNG", async () => {
    expect(existsSync(heroJpeg)).toBe(true)
    expect(existsSync(legacyHeroPng)).toBe(false)

    const bytes = await readFile(heroJpeg)
    expect(bytes.subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]))
    expect(bytes.subarray(-2)).toEqual(Buffer.from([0xff, 0xd9]))
  })

  it("renders the hero image with its accessible description", () => {
    const markup = renderToStaticMarkup(createElement(HomeHeroImage))

    expect(markup).toContain("courtside-hero.jpg")
    expect(markup).toContain("สนามบาสเกตบอลในร่มพร้อมห่วงและเส้นสนามในประเทศไทย")
  })

  it("renders a named close control before sheet navigation", () => {
    const markup = renderToStaticMarkup(
      createElement(
        Sheet,
        { defaultOpen: true },
        createElement(SheetCloseButton, { onClick: () => undefined }),
        createElement("a", { href: "/tournaments" }, "ทัวร์นาเมนต์")
      )
    )

    const closeButtonIndex = markup.indexOf('aria-label="ปิดเมนู"')
    const navigationIndex = markup.indexOf('href="/tournaments"')

    expect(closeButtonIndex).toBeGreaterThanOrEqual(0)
    expect(navigationIndex).toBeGreaterThan(closeButtonIndex)
  })
})
