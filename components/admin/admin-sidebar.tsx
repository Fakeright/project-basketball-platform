import Link from "next/link"

export function AdminSidebar() {
  return <aside className="border-b border-border pb-4 lg:w-56 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6"><p className="text-sm font-semibold tracking-[0.08em]">COURTSIDE ADMIN</p><nav aria-label="เมนูผู้ดูแล" className="mt-4 flex gap-4 overflow-x-auto lg:block lg:space-y-2"><Link className="block whitespace-nowrap py-2 text-sm hover:text-court" href="/admin">ภาพรวม</Link><Link className="block whitespace-nowrap py-2 text-sm hover:text-court" href="/admin/reviews">คิวตรวจสอบ</Link><Link className="block whitespace-nowrap py-2 text-sm hover:text-court" href="/organizer">รายการของฉัน</Link></nav></aside>
}
