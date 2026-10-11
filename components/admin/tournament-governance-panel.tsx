import Link from "next/link"
import { ArrowLeft, Edit3, GitBranch, ShieldCheck } from "lucide-react"

import {
  TournamentGovernanceDialog,
  type TournamentGovernanceDialogAction,
} from "@/components/admin/tournament-governance-dialog"

export interface TournamentGovernanceActionView
  extends TournamentGovernanceDialogAction {
  unavailableReasons: string[]
}

interface LabeledValue {
  label: string
  value: string
}

interface TournamentGovernancePanelProps {
  tournament: { id: string; title: string; version: number }
  tournamentStatus: string
  governanceStatus: string
  identity: LabeledValue[]
  dependencies: LabeledValue[]
  actions: TournamentGovernanceActionView[]
  operationsAvailable: boolean
}

export function TournamentGovernancePanel({
  tournament,
  tournamentStatus,
  governanceStatus,
  identity,
  dependencies,
  actions,
  operationsAvailable,
}: TournamentGovernancePanelProps) {
  return (
    <section aria-labelledby="tournament-governance-heading">
      <Link
        className="inline-flex min-h-9 items-center gap-2 text-sm underline underline-offset-4"
        href="/admin/tournaments"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        กลับไปรายการแข่งขัน
      </Link>

      <header className="border-b border-border pb-6 pt-5">
        <p className="text-xs font-semibold text-court">TOURNAMENT GOVERNANCE</p>
        <h1
          className="mt-2 break-words text-2xl font-semibold sm:text-3xl"
          id="tournament-governance-heading"
        >
          {tournament.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ตรวจสอบสถานะ เงื่อนไข และคำสั่งกำกับรายการแข่งขัน
        </p>
      </header>

      <dl className="grid gap-px border-b border-border bg-border sm:grid-cols-2 xl:grid-cols-5">
        {identity.map((item) => (
          <div className="min-w-0 bg-background px-3 py-4" key={item.label}>
            <dt className="text-xs font-medium text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-1 break-words text-sm font-medium">{item.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="governance-status-heading" className="py-7">
        <h2 className="text-lg font-semibold" id="governance-status-heading">
          สถานะรายการ
        </h2>
        <dl className="mt-4 grid gap-px border-y border-border bg-border sm:grid-cols-2">
          <StatusFact label="สถานะการแข่งขัน" value={tournamentStatus} />
          <StatusFact label="สถานะการกำกับ" value={governanceStatus} />
        </dl>
      </section>

      <section aria-labelledby="governance-dependencies-heading" className="border-t border-border py-7">
        <h2 className="text-lg font-semibold" id="governance-dependencies-heading">
          ข้อมูลประกอบการตัดสินใจ
        </h2>
        <dl className="mt-4 divide-y divide-border border-y border-border">
          {dependencies.map((item) => (
            <div
              className="grid gap-1 py-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-5"
              key={item.label}
            >
              <dt className="text-sm text-muted-foreground">{item.label}</dt>
              <dd className="break-words text-sm font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {operationsAvailable ? (
        <nav
          aria-label="พื้นที่ดำเนินงานรายการแข่งขัน"
          className="flex flex-col gap-2 border-t border-border py-6 sm:flex-row sm:flex-wrap"
        >
          <OperationLink
            href={`/organizer/tournaments/${tournament.id}`}
            label="เปิดข้อมูลรายการ"
          >
            <Edit3 aria-hidden="true" />
          </OperationLink>
          <OperationLink
            href={`/organizer/tournaments/${tournament.id}/bracket`}
            label="เปิดสายการแข่งขัน"
          >
            <GitBranch aria-hidden="true" />
          </OperationLink>
          <OperationLink
            href={`/admin/tournaments/${tournament.id}/results`}
            label="กำกับผลการแข่งขัน"
          >
            <ShieldCheck aria-hidden="true" />
          </OperationLink>
        </nav>
      ) : (
        <p className="border-y border-border py-4 text-sm text-muted-foreground">
          ต้องคืนรายการสู่สถานะกำกับปกติก่อนเข้าสู่พื้นที่ดำเนินงาน
        </p>
      )}

      <section aria-labelledby="governance-actions-heading" className="pt-7">
        <h2 className="text-lg font-semibold" id="governance-actions-heading">
          คำสั่งกำกับ
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          ทุกคำสั่งต้องมีเหตุผลและจะถูกบันทึกในประวัติการตรวจสอบ
        </p>
        <div className="mt-4 divide-y divide-border border-y border-border">
          {actions.map((action) => (
            <TournamentGovernanceDialog
              action={action}
              key={action.action}
              tournament={tournament}
              unavailableReasons={action.unavailableReasons}
            />
          ))}
        </div>
      </section>
    </section>
  )
}

function StatusFact({ label, value }: LabeledValue) {
  return (
    <div className="bg-background px-4 py-4">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  )
}

function OperationLink({
  children,
  href,
  label,
}: {
  children: React.ReactNode
  href: string
  label: string
}) {
  return (
    <Link
      className="inline-flex min-h-10 items-center justify-center gap-2 border border-border px-3 text-sm font-medium hover:border-foreground sm:justify-start"
      href={href}
    >
      {children}
      {label}
    </Link>
  )
}
