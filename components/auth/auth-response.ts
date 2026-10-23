/**
 * COURTSIDE: คำอธิบายไฟล์
 * อ่านผลตอบกลับของ API บัญชีอย่างระมัดระวังและเลือกข้อความผิดพลาดที่แสดงได้
 * เรียกใช้จาก: components/auth/forgot-password-form.tsx, components/auth/login-form.tsx
 */

type AuthResponseBody = {
  message?: unknown
  redirectTo?: unknown
}

// อ่าน response ของ API บัญชีและรับเฉพาะข้อมูลตามรูปแบบที่หน้าจอรองรับ
export async function readAuthResponse(
  response: Response,
): Promise<AuthResponseBody> {
  try {
    const body: unknown = await response.json()
    if (!body || typeof body !== "object" || Array.isArray(body)) return {}
    return body as AuthResponseBody
  } catch {
    return {}
  }
}

// เลือกข้อความตอบกลับที่แสดงได้ และใช้ข้อความสำรองเมื่อรูปแบบไม่ถูกต้อง
export function getAllowedMessage(
  body: AuthResponseBody,
  allowedMessages: readonly string[],
  fallback: string,
) {
  return typeof body.message === "string" &&
    allowedMessages.includes(body.message)
    ? body.message
    : fallback
}

// ตรวจเส้นทางที่จะนำทางจากผล API ก่อนให้เบราว์เซอร์เปลี่ยนหน้า
export function getSafeRedirect(
  body: AuthResponseBody,
  fallback: string,
) {
  if (
    typeof body.redirectTo === "string" &&
    body.redirectTo.startsWith("/") &&
    !body.redirectTo.startsWith("//") &&
    !body.redirectTo.includes("\\")
  ) {
    return body.redirectTo
  }

  return fallback
}
