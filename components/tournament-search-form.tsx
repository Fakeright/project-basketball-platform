"use client"

import { useRouter } from "next/navigation"
import type { FormEvent } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TournamentSearchFilters } from "@/features/tournaments/domain/tournament"
import { toTournamentSearchParams } from "@/features/tournaments/presentation/tournament-search-params"

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
      province: formData.get("province")?.toString(),
      format: formData.get("format")?.toString() as TournamentSearchFilters["format"],
      ageGroup: formData.get("ageGroup")?.toString(),
      venue: formData.get("venue")?.toString(),
      date: formData.get("date")?.toString(),
    }
    const params = toTournamentSearchParams(filters)

    router.push(`/tournaments?${params}`)
  }

  return (
    <form className="grid grid-cols-3 gap-3 sm:grid-cols-2 lg:grid-cols-6" onSubmit={handleSubmit}>
      <div className="col-span-3 grid gap-1.5 sm:col-span-2 lg:col-span-2">
        <label className="text-xs font-medium" htmlFor="q">ค้นหาชื่อรายการ</label>
        <Input
          className="h-10"
          defaultValue={initialFilters.query}
          id="q"
          name="q"
          placeholder="เช่น Bangkok Hoops"
        />
      </div>
      <div className="grid gap-1.5">
        <label className="text-xs font-medium" htmlFor="province">จังหวัด</label>
        <Input
          className="h-10"
          defaultValue={initialFilters.province}
          id="province"
          name="province"
          placeholder="กรุงเทพฯ"
        />
      </div>
      <div className="grid gap-1.5">
        <label className="text-xs font-medium" htmlFor="format">รูปแบบ</label>
        <Select
          defaultValue={initialFilters.format}
          items={[
            { label: "5x5", value: "FIVE_V_FIVE" },
            { label: "3x3", value: "THREE_V_THREE" },
          ]}
          name="format"
        >
          <SelectTrigger className="h-10 w-full" id="format">
            <SelectValue placeholder="ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FIVE_V_FIVE">5x5</SelectItem>
            <SelectItem value="THREE_V_THREE">3x3</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <label className="text-xs font-medium" htmlFor="ageGroup">รุ่นอายุ</label>
        <Input
          className="h-10"
          defaultValue={initialFilters.ageGroup}
          id="ageGroup"
          name="ageGroup"
          placeholder="U18"
        />
      </div>
      <div className="grid gap-1.5">
        <label className="text-xs font-medium" htmlFor="venue">สนาม</label>
        <Input
          className="h-10"
          defaultValue={initialFilters.venue}
          id="venue"
          name="venue"
          placeholder="ชื่อสนาม"
        />
      </div>
      <div className="grid gap-1.5">
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
      <Button className="h-10 sm:col-span-2 lg:col-span-1" type="submit">
        <Search aria-hidden="true" />
        ค้นหา
      </Button>
    </form>
  )
}
