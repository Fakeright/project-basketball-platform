import { findProvinceByCode } from "@/features/provinces/domain/thai-provinces"

export function assertProvinceCode(code: string): string {
  if (!findProvinceByCode(code)) {
    throw new Error("INVALID_PROVINCE_CODE")
  }

  return code
}
