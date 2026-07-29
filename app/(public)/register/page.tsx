import Link from "next/link"

import { AuthFormLayout } from "@/components/auth/auth-form-layout"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <AuthFormLayout
      description="สร้างบัญชีและเลือกบทบาทหลักสำหรับเข้าร่วมทีม ดูแลทีม หรือจัดการแข่งขัน"
      eyebrow="CREATE ACCOUNT"
      footer={
        <p>
          มีบัญชีแล้ว?{" "}
          <Link className="font-medium text-court hover:underline" href="/login">
            เข้าสู่ระบบ
          </Link>
        </p>
      }
      title="สมัครสมาชิก COURTSIDE"
    >
      <RegisterForm />
    </AuthFormLayout>
  )
}
