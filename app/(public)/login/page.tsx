import Link from "next/link"

import { AuthFormLayout } from "@/components/auth/auth-form-layout"
import { LoginForm } from "@/components/auth/login-form"
import { isDevelopmentCookieSessionMode } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[]
    error?: string | string[]
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams
  const nextPath = typeof query.next === "string" ? query.next : undefined
  const recoveryError =
    typeof query.error === "string" &&
    ["auth_callback", "recovery_invalid"].includes(query.error)

  return (
    <AuthFormLayout
      description="เข้าสู่พื้นที่จัดการตามบทบาทของคุณด้วยบัญชี COURTSIDE"
      eyebrow="COURTSIDE ACCESS"
      footer={
        <p>
          ยังไม่มีบัญชี?{" "}
          <Link className="font-medium text-court hover:underline" href="/register">
            สมัครสมาชิก
          </Link>
        </p>
      }
      title="เข้าสู่ระบบ"
    >
      {recoveryError ? (
        <p
          className="mb-5 border-l-2 border-destructive pl-3 text-sm text-destructive"
          role="alert"
        >
          ลิงก์ตั้งรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว
        </p>
      ) : null}
      <LoginForm nextPath={nextPath} />
      {isDevelopmentCookieSessionMode() ? (
        <details className="mt-8 border-t border-dashed border-border pt-4 text-sm">
          <summary className="cursor-pointer font-medium">
            เครื่องมือ session สำหรับ Local Development
          </summary>
          <div className="mt-3 grid gap-2">
            {[
              ["admin-1", "Platform Admin"],
              ["organizer-1", "Tournament Organizer"],
              ["team-manager-1", "Team Manager"],
            ].map(([actorId, label]) => (
              <form action="/api/dev/session" key={actorId} method="post">
                <input name="actorId" type="hidden" value={actorId} />
                <button
                  className="min-h-9 w-full border border-border px-3 text-left hover:border-foreground"
                  type="submit"
                >
                  Local: {label}
                </button>
              </form>
            ))}
          </div>
        </details>
      ) : null}
    </AuthFormLayout>
  )
}
