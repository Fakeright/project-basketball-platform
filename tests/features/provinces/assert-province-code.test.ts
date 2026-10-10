import { describe, expect, it } from "vitest"

import { assertProvinceCode } from "@/features/provinces/application/assert-province-code"

describe("assertProvinceCode", () => {
  it("returns a known canonical province code", () => {
    expect(assertProvinceCode("92")).toBe("92")
  })

  it("rejects a free-text province name instead of accepting ambiguous data", () => {
    expect(() => assertProvinceCode("Trang")).toThrow("INVALID_PROVINCE_CODE")
  })

  it("rejects an unknown two-digit code", () => {
    expect(() => assertProvinceCode("99")).toThrow("INVALID_PROVINCE_CODE")
  })
})
