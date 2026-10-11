"use client"

import { useRouter } from "next/navigation"
import type { FormEvent } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProvinceCombobox } from "@/components/province-combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TournamentSearchFilters } from "@/features/tournaments/domain/tournament"
import { toTournamentSearchParams } from "@/features/tournaments/presentation/tournament-search-params"
import { TOURNAMENT_AGE_GROUPS } from "@/features/tournament-operations/domain/tournament-age-group"

type TournamentSearchFormProps = {
  initialFilters: TournamentSearchFilters
}

export function TournamentSearchForm({ initialFilters }: TournamentSearchFormProps) {
  const router = useRouter()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const filters: TournamentSearchFilters = {
      query: formData.get("q")?.toString(),
      provinceCode: formData.get("province")?.toString(),
      format: formData.get("format")?.toString() as TournamentSearchFilters["format"],
      ageGroup: formData.get("ageGroup")?.toString(),
      venue: formData.get("venue")?.toString(),
      date: formData.get("date")?.toString(),
    }
    const params = toTournamentSearchParams(filters)

    router.push(`/tournaments?${params}`)
  }

  return (
    <form className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-6" onSubmit={handleSubmit}>
      <div className="grid min-w-0 gap-1 sm:col-span-2 sm:gap-1.5 lg:col-span-2">
        <label className="text-xs font-medium" htmlFor="q">ค้นหาชื่อรายการ</label>
        <Input
          className="h-10"
          defaultValue={initialFilters.query}
          id="q"
          name="q"
          placeholder="เช่น Bangkok Hoops"
        />
      </div>
      <ProvinceCombobox
        allowEmpty
        className="min-w-0 grid-cols-[minmax(0,1fr)] gap-1 sm:gap-1.5"
        defaultValue={initialFilters.provinceCode}
        id="province"
        label="จังหวัด"
        name="province"
      />
      <div className="grid min-w-0 gap-1 sm:gap-1.5">
        <label className="text-xs font-medium" htmlFor="format">รูปแบบ</label>
        <Select
          defaultValue={initialFilters.format ?? null}
          items={[
            { label: "ทั้งหมด", value: null },
            { label: "5x5", value: "FIVE_V_FIVE" },
            { label: "3x3", value: "THREE_V_THREE" },
          ]}
          name="format"
        >
          <SelectTrigger className="h-10! w-full" id="format">
            <SelectValue placeholder="ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>ทั้งหมด</SelectItem>
            <SelectItem value="FIVE_V_FIVE">5x5</SelectItem>
            <SelectItem value="THREE_V_THREE">3x3</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid min-w-0 gap-1 sm:gap-1.5">
        <label className="text-xs font-medium" htmlFor="ageGroup">รุ่นอายุ</label>
        <Select
          defaultValue={initialFilters.ageGroup ?? null}
          items={[
            { label: "ทั้งหมด", value: null },
            ...TOURNAMENT_AGE_GROUPS.map((ageGroup) => ({
              label: ageGroup,
              value: ageGroup,
            })),
          ]}
          name="ageGroup"
        >
          <SelectTrigger className="h-10! w-full" id="ageGroup">
            <SelectValue placeholder="ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>ทั้งหมด</SelectItem>
            {TOURNAMENT_AGE_GROUPS.map((ageGroup) => (
              <SelectItem key={ageGroup} value={ageGroup}>
                {ageGroup}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid min-w-0 gap-1 sm:gap-1.5">
        <label className="text-xs font-medium" htmlFor="venue">สนาม</label>
        <Input
          className="h-10"
          defaultValue={initialFilters.venue}
          id="venue"
          name="venue"
          placeholder="ชื่อสนาม"
        />
      </div>
      <div className="grid min-w-0 gap-1 sm:gap-1.5">
        <label className="text-xs font-medium" htmlFor="date">วันที่แข่ง</label>
        <Input
          aria-label="วันที่แข่ง"
          className="h-10"
          defaultValue={initialFilters.date}
          id="date"
          name="date"
          type="date"
        />
      </div>
      <Button className="h-10 self-end lg:col-span-1" type="submit">
        <Search aria-hidden="true" />
        ค้นหา
      </Button>
    </form>
  )
}
