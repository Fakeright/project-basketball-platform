import Link from "next/link"

export function HomeAuthActions({
  isAuthenticated,
}: {
  isAuthenticated: boolean
}) {
  if (isAuthenticated) {
    return null
  }

  return (
    <div aria-label="บัญชีผู้ใช้" className="mt-4 flex flex-wrap gap-2">
      <Link
        className="inline-flex min-h-11 items-center bg-foreground px-4 text-sm font-medium text-background"
        href="/login"
      >
        เข้าสู่ระบบ
      </Link>
      <Link
        className="inline-flex min-h-11 items-center border border-foreground px-4 text-sm font-medium"
        href="/register"
      >
        สมัครสมาชิก
      </Link>
    </div>
  )
}
