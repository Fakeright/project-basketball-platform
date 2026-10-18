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

async function probeImage(data: Uint8Array): Promise<BracketFileProbeResult> {
  const metadata = await sharp(data).metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error("BRACKET_FILE_UNREADABLE")
  }
  return { kind: "IMAGE", width: metadata.width, height: metadata.height }
}
