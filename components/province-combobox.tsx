"use client"

import { Combobox } from "@base-ui/react/combobox"
import { ChevronDown } from "lucide-react"

import {
  findProvinceByCode,
  thaiProvinces,
  type ProvinceOption,
} from "@/features/provinces/domain/thai-provinces"
import { cn } from "@/lib/utils"

type ProvinceChoice = ProvinceOption | typeof allProvincesChoice

const allProvincesChoice = {
  code: "",
  nameEn: "All provinces",
  nameTh: "ทุกจังหวัด",
} as const

type ProvinceComboboxProps = {
  allowEmpty?: boolean
  className?: string
  defaultValue?: string
  id: string
  label: string
  name: string
  required?: boolean
}

export function ProvinceCombobox({
  allowEmpty = false,
  className,
  defaultValue,
  id,
  label,
  name,
  required = false,
}: ProvinceComboboxProps) {
  const provinces: readonly ProvinceChoice[] = allowEmpty
    ? [allProvincesChoice, ...thaiProvinces]
    : thaiProvinces
  const selectedProvince = defaultValue
    ? findProvinceByCode(defaultValue) ?? null
    : allowEmpty
      ? allProvincesChoice
      : null

  return (
    <div className={cn("grid gap-1.5", className)}>
      <label className="text-xs font-medium" htmlFor={id}>
        {label}
      </label>
      <Combobox.Root
        autoHighlight
        defaultValue={selectedProvince}
        filter={matchesProvince}
        itemToStringLabel={formatProvinceLabel}
        itemToStringValue={(province) => province.code}
        items={provinces}
        name={name}
        required={required}
      >
        <Combobox.InputGroup className="flex h-10 w-full items-center border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <Combobox.Input
            className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            id={id}
            placeholder={allowEmpty ? "ทุกจังหวัด" : "ค้นหาจังหวัด"}
          />
          <Combobox.Trigger
            aria-label={`เปิดรายการ${label}`}
            className="flex size-10 shrink-0 items-center justify-center text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ChevronDown aria-hidden="true" className="size-4" />
          </Combobox.Trigger>
        </Combobox.InputGroup>
        <Combobox.Portal>
          <Combobox.Positioner className="z-50" sideOffset={4}>
            <Combobox.Popup className="max-h-(--available-height) w-(--anchor-width) min-w-56 overflow-y-auto border border-border bg-popover p-1 text-popover-foreground shadow-md">
              <Combobox.List>
                {(province: ProvinceChoice) => (
                  <Combobox.Item
                    className="flex min-h-9 cursor-default items-center px-2 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-selected:font-medium"
                    key={province.code}
                    value={province}
                  >
                    {formatProvinceLabel(province)}
                  </Combobox.Item>
                )}
              </Combobox.List>
              <Combobox.Empty className="px-2 py-3 text-sm text-muted-foreground">
                ไม่พบจังหวัดที่ค้นหา
              </Combobox.Empty>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  )
}

function formatProvinceLabel(province: ProvinceChoice): string {
  return province.code
    ? `${province.nameTh} (${province.nameEn})`
    : province.nameTh
}

function matchesProvince(province: ProvinceChoice, query: string): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase("th-TH")

  return (
    normalizedQuery.length === 0 ||
    province.code.includes(normalizedQuery) ||
    province.nameTh.toLocaleLowerCase("th-TH").includes(normalizedQuery) ||
    province.nameEn.toLocaleLowerCase("th-TH").includes(normalizedQuery)
  )
}
