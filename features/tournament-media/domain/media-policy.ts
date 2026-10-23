/**
 * COURTSIDE: คำอธิบายไฟล์
 * จำกัดชนิดและขนาดไฟล์ พร้อมตรวจลายเซ็นเนื้อไฟล์ให้ตรงชนิดที่แจ้ง
 * เรียกใช้จาก: components/admin/tournament-media-manager.tsx, features/tournament-media/application/upload-tournament-media.ts
 */

import type { MediaAssetKind, MediaFileDescriptor } from "./media-asset"

const mediaConstraints = {
  POSTER: {
    maximumBytes: 4_000_000,
    contentTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  DOCUMENT: {
    maximumBytes: 4_000_000,
    contentTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  BRACKET_DOCUMENT: {
    maximumBytes: 4_000_000,
    contentTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
  },
} as const

// ตรวจ MIME type และขนาดตามชนิด asset ก่อนอ่านเนื้อไฟล์หรืออัปโหลด
export function validateMediaFile(
  input: MediaFileDescriptor & { kind: MediaAssetKind },
): void {
  const constraint = mediaConstraints[input.kind]
  const allowedType = constraint.contentTypes.some(
    (contentType) => contentType === input.contentType,
  )
  if (!allowedType) {
    throw new Error("MEDIA_FILE_TYPE_INVALID")
  }
  if (input.byteSize > constraint.maximumBytes) {
    throw new Error("MEDIA_FILE_TOO_LARGE")
  }
}

export function getMediaMaximumBytes(kind: MediaAssetKind): number {
  return mediaConstraints[kind].maximumBytes
}

// เทียบลายเซ็น byte ของเนื้อไฟล์กับชนิดที่แจ้ง เพื่อไม่เชื่อเพียงนามสกุลหรือ MIME จากผู้ส่ง
export function validateMediaFileContent(input: {
  contentType: string
  data: Uint8Array
}): void {
  let valid = false

  switch (input.contentType) {
    case "image/jpeg":
      valid = startsWith(input.data, [0xff, 0xd8, 0xff])
      break
    case "image/png":
      valid = startsWith(input.data, [
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ])
      break
    case "image/webp":
      valid = isWebP(input.data)
      break
    case "application/pdf":
      valid = startsWith(input.data, [0x25, 0x50, 0x44, 0x46, 0x2d])
      break
    case "application/msword":
      valid = startsWith(input.data, [
        0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
      ])
      break
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      valid = isDocx(input.data)
      break
  }

  if (!valid) throw new Error("MEDIA_FILE_CONTENT_INVALID")
}

function startsWith(data: Uint8Array, signature: number[]) {
  return (
    data.length >= signature.length &&
    signature.every((value, index) => data[index] === value)
  )
}

function isWebP(data: Uint8Array) {
  return (
    startsWith(data, [0x52, 0x49, 0x46, 0x46]) &&
    data.length >= 12 &&
    data[8] === 0x57 &&
    data[9] === 0x45 &&
    data[10] === 0x42 &&
    data[11] === 0x50
  )
}

// ตรวจว่าเป็นไฟล์ ZIP ที่มีโครงสร้าง Word ที่ต้องพบใน DOCX
function isDocx(data: Uint8Array) {
  if (!startsWith(data, [0x50, 0x4b, 0x03, 0x04])) return false
  const archiveText = new TextDecoder("latin1").decode(data)
  return (
    archiveText.includes("[Content_Types].xml") &&
    archiveText.includes("word/")
  )
}
