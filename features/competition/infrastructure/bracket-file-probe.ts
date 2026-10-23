/**
 * COURTSIDE: คำอธิบายไฟล์
 * อ่านโครงสร้าง PDF หรือภาพด้วยไลบรารีฝั่งเซิร์ฟเวอร์ เพื่อยืนยันว่าไฟล์เปิดได้จริงก่อนเก็บ
 * เรียกใช้จาก: app/api/organizer/tournaments/[id]/bracket/external/revisions/route.ts, features/competition/application/upload-external-bracket.ts
 * ตามการทำงานต่อ: features/competition/domain/external-bracket-policy.ts
 */

import "server-only"

import { PDFDocument } from "pdf-lib"
import sharp from "sharp"

import {
  getExternalBracketFileKind,
  type ExternalBracketContentType,
} from "@/features/competition/domain/external-bracket-policy"

export type BracketFileProbeResult =
  | { kind: "PDF"; pageCount: number }
  | { kind: "IMAGE"; width: number; height: number }

// เลือกตัวอ่าน PDF หรือภาพจากชนิดไฟล์ แล้วตรวจว่าเนื้อไฟล์ใช้งานได้จริง
export async function probeBracketFile(input: {
  contentType: ExternalBracketContentType
  data: Uint8Array
}): Promise<BracketFileProbeResult> {
  try {
    const kind = getExternalBracketFileKind(input.contentType)
    if (kind === "PDF") return await probePdf(input.data)
    return await probeImage(input.data)
  } catch {
    throw new Error("BRACKET_FILE_UNREADABLE")
  }
}

// ใช้ pdf-lib อ่าน PDF ฝั่งเซิร์ฟเวอร์ โดยไม่พึ่ง canvas หรือ DOM ของเบราว์เซอร์
async function probePdf(data: Uint8Array): Promise<BracketFileProbeResult> {
  const document = await PDFDocument.load(data, {
    throwOnInvalidObject: true,
    updateMetadata: false,
  })
  const pageCount = document.getPageCount()
  if (pageCount < 1) throw new Error("BRACKET_FILE_UNREADABLE")
  document.getPage(0)
  return { kind: "PDF", pageCount }
}

// ใช้ตัวอ่านภาพตรวจขนาดและโครงสร้างจริงของไฟล์ก่อนเก็บเป็นสาย
async function probeImage(data: Uint8Array): Promise<BracketFileProbeResult> {
  const metadata = await sharp(data).metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error("BRACKET_FILE_UNREADABLE")
  }
  return { kind: "IMAGE", width: metadata.width, height: metadata.height }
}
