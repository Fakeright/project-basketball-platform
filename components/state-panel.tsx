import Link from "next/link"
import { CircleAlert, Inbox, MapPinOff } from "lucide-react"

type StatePanelKind = "empty" | "error" | "not-found"

type StatePanelProps = {
  kind: StatePanelKind
  title?: string
  message?: string
  action?: {
    href: string
    label: string
  }
  children?: React.ReactNode
}

const stateContent = {
  empty: {
    icon: Inbox,
    title: "ยังไม่มีข้อมูล",
    message: "ลองปรับเงื่อนไขการค้นหาหรือกลับมาใหม่อีกครั้ง",
  },
  error: {
    icon: CircleAlert,
    title: "เกิดข้อผิดพลาด",
    message: "ไม่สามารถแสดงข้อมูลได้ในขณะนี้ โปรดลองอีกครั้ง",
  },
  "not-found": {
    icon: MapPinOff,
    title: "ไม่พบหน้าที่ต้องการ",
    message: "ลิงก์นี้อาจไม่ถูกต้อง หรือหน้าดังกล่าวถูกย้ายไปแล้ว",
  },
} satisfies Record<StatePanelKind, { icon: typeof Inbox; title: string; message: string }>

export function StatePanel({ kind, title, message, action, children }: StatePanelProps) {
  const content = stateContent[kind]
  const Icon = content.icon

  return (
    <section className="flex min-h-64 flex-col items-center justify-center border-y border-border px-4 py-12 text-center">
      <Icon aria-hidden="true" className="mb-4 size-7 text-muted-foreground" />
      <h1 className="text-xl font-semibold">{title ?? content.title}</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {message ?? content.message}
      </p>
      {children ? <div className="mt-5">{children}</div> : null}
      {action ? (
        <Link className="mt-5 text-sm font-medium text-foreground underline underline-offset-4" href={action.href}>
          {action.label}
        </Link>
      ) : null}
    </section>
  )
}
