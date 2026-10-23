/**
 * COURTSIDE: คำอธิบายไฟล์
 * หน้า /reset-password: เปิดฟอร์มตั้งรหัสผ่านใหม่สำหรับกระบวนการ recovery
 * ตามการทำงานต่อ: components/auth/auth-form-layout.tsx, components/auth/reset-password-form.tsx
 */

import Link from "next/link"

import { AuthFormLayout } from "@/components/auth/auth-form-layout"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <AuthFormLayout
      description="กำหนดรหัสผ่านใหม่สำหรับบัญชีที่เปิดจากลิงก์กู้คืนล่าสุด"
      eyebrow="ACCOUNT RECOVERY"
      footer={
        <Link className="font-medium text-court hover:underline" href="/login">
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      }
      title="ตั้งรหัสผ่านใหม่"
    >
      <ResetPasswordForm />
    </AuthFormLayout>
  )
}
