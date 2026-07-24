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
    <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6" onSubmit={handleSubmit}>
      <Input
        aria-label="ค้นหาชื่อรายการ"
        className="h-10 lg:col-span-2"
        defaultValue={initialFilters.query}
        name="q"
        placeholder="ค้นหาชื่อรายการ"
      />
      <Input
        aria-label="จังหวัด"
        className="h-10"
        defaultValue={initialFilters.province}
        name="province"
        placeholder="จังหวัด"
      />
      <Select
        defaultValue={initialFilters.format}
        items={[
          { label: "5x5", value: "FIVE_V_FIVE" },
          { label: "3x3", value: "THREE_V_THREE" },
        ]}
        name="format"
      >
        <SelectTrigger aria-label="รูปแบบการแข่งขัน" className="h-10 w-full">
          <SelectValue placeholder="รูปแบบ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="FIVE_V_FIVE">5x5</SelectItem>
          <SelectItem value="THREE_V_THREE">3x3</SelectItem>
        </SelectContent>
      </Select>
      <Input
        aria-label="รุ่นอายุ"
        className="h-10"
        defaultValue={initialFilters.ageGroup}
        name="ageGroup"
        placeholder="รุ่นอายุ"
      />
      <Input
        aria-label="สนามแข่งขัน"
        className="h-10"
        defaultValue={initialFilters.venue}
        name="venue"
        placeholder="สนามแข่งขัน"
      />
      <Input
        aria-label="วันที่แข่งขัน"
        className="h-10"
        defaultValue={initialFilters.date}
        name="date"
        type="date"
      />
      <Button className="h-10 sm:col-span-2 lg:col-span-1" type="submit">
        <Search aria-hidden="true" />
        ค้นหา
      </Button>
    </form>
  )
}
