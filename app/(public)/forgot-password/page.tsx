import Link from "next/link"

import { AuthFormLayout } from "@/components/auth/auth-form-layout"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <AuthFormLayout
      description="กรอกอีเมลที่ใช้สมัคร ระบบจะส่งขั้นตอนตั้งรหัสผ่านใหม่หากพบบัญชี"
      eyebrow="ACCOUNT RECOVERY"
      footer={
        <Link className="font-medium text-court hover:underline" href="/login">
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      }
      title="ลืมรหัสผ่าน"
    >
      <ForgotPasswordForm />
    </AuthFormLayout>
  )
}
