import type { AdminDashboardReadModel } from "../application/ports/admin-dashboard-repository"

export interface AdminDashboardViewModel {
  metrics: Array<{
    key: string
    label: string
    value: number
    summary?: string
    emphasized?: boolean
  }>
  recentAudits: Array<{
    id: string
    actionLabel: string
    actorName: string
    subject: string
    occurredAt: string
    occurredAtValue: string
  }>
}

const actionLabels: Record<string, string> = {
  "tournament.created": "สร้างรายการแข่งขัน",
  "tournament.updated": "แก้ไขรายการแข่งขัน",
  "tournament.submitted": "ส่งรายการเข้าตรวจสอบ",
  "tournament.reviewed": "บันทึกผลตรวจสอบ",
  "tournament.published": "เผยแพร่รายการแข่งขัน",
  "tournament.registration_closed": "ปิดรับสมัคร",
  "tournament.admin_override": "ผู้ดูแลดำเนินการแทน",
  "media.uploaded": "อัปโหลดสื่อ",
  "media.replaced": "เปลี่ยนโปสเตอร์",
  "media.deleted": "ลบสื่อ",
  "media.admin_override": "ผู้ดูแลจัดการสื่อแทน",
  "team.created": "สร้างทีม",
  "team.updated": "แก้ไขทีม",
  "team.member_added": "เพิ่มสมาชิกทีม",
  "team.member_deactivated": "นำสมาชิกออกจากทีม",
  "team.admin_override": "ผู้ดูแลจัดการทีมแทน",
  "registration.created": "สมัครแข่งขัน",
  "registration.cancelled": "ยกเลิกการสมัคร",
  "registration.approved": "อนุมัติการสมัคร",
  "registration.rejected": "ปฏิเสธการสมัคร",
  "registration.withdrawn": "ถอนทีมจากการแข่งขัน",
  "registration.admin_override": "ผู้ดูแลจัดการการสมัครแทน",
}

const bangkokDateTimeFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Bangkok",
})

export function createAdminDashboardViewModel(
  dashboard: AdminDashboardReadModel,
): AdminDashboardViewModel {
  return {
    metrics: [
      {
        key: "pendingReviews",
        label: "รายการรอตรวจ",
        value: dashboard.metrics.pendingReviews,
        summary: `${dashboard.metrics.pendingReviews} รายการรอตรวจ`,
        emphasized: true,
      },
      {
        key: "tournaments",
        label: "การแข่งขันทั้งหมด",
        value: dashboard.metrics.tournaments,
      },
      {
        key: "publishedTournaments",
        label: "รายการเผยแพร่แล้ว",
        value: dashboard.metrics.publishedTournaments,
      },
      {
        key: "activeTournaments",
        label: "รายการที่กำลังแข่ง",
        value: dashboard.metrics.activeTournaments,
      },
      {
        key: "teams",
        label: "ทีมทั้งหมด",
        value: dashboard.metrics.teams,
      },
      {
        key: "users",
        label: "ผู้ใช้ทั้งหมด",
        value: dashboard.metrics.users,
      },
      {
        key: "registrations",
        label: "การสมัครทั้งหมด",
        value: dashboard.metrics.registrations,
      },
    ],
    recentAudits: dashboard.recentAudits.map((audit) => ({
      id: audit.id,
      actionLabel: actionLabels[audit.action] ?? "บันทึกกิจกรรมระบบ",
      actorName: audit.actorName,
      subject:
        audit.tournamentTitle ??
        `${audit.entityType} · ${audit.entityId}`,
      occurredAt: bangkokDateTimeFormatter.format(new Date(audit.createdAt)),
      occurredAtValue: audit.createdAt,
    })),
  }
}
