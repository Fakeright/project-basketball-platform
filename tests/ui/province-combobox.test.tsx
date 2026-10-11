import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"

import { cleanup } from "@testing-library/react"

import { ProvinceCombobox } from "@/components/province-combobox"

afterEach(cleanup)

describe("ProvinceCombobox", () => {
  it("filters provinces in Thai and submits the selected two-digit code", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <form>
        <ProvinceCombobox id="province" label="จังหวัด" name="province" />
      </form>,
    )

    const input = screen.getByLabelText("จังหวัด")
    await user.click(input)
    await user.type(input, "ตรัง")
    await user.click(await screen.findByRole("option", { name: /ตรัง.*Trang/i }))

    expect(new FormData(container.querySelector("form")!).get("province")).toBe("92")
  })

  it("filters provinces by English name and allows the public empty choice", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <form>
        <ProvinceCombobox
          allowEmpty
          defaultValue="92"
          id="province"
          label="จังหวัด"
          name="province"
        />
      </form>,
    )

    const input = screen.getByLabelText("จังหวัด")
    await user.click(input)
    await user.clear(input)
    await user.type(input, "Trang")
    expect(await screen.findByRole("option", { name: /ตรัง.*Trang/i })).toBeTruthy()

    await user.clear(input)
    await user.click(input)
    await user.click(await screen.findByRole("option", { name: "ทุกจังหวัด" }))
    expect(new FormData(container.querySelector("form")!).get("province")).toBe("")
  })
})
