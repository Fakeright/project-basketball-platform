import "server-only"

import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs"
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
  const loadingTask = getDocument({
    data: Uint8Array.from(data),
    useWorkerFetch: false,
  })

  try {
    const document = await loadingTask.promise
    if (document.numPages < 1) throw new Error("BRACKET_FILE_UNREADABLE")
    await document.getPage(1)
    return { kind: "PDF", pageCount: document.numPages }
  } finally {
    await loadingTask.destroy()
  }
}

async function probeImage(data: Uint8Array): Promise<BracketFileProbeResult> {
  const metadata = await sharp(data).metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error("BRACKET_FILE_UNREADABLE")
  }
  return { kind: "IMAGE", width: metadata.width, height: metadata.height }
}
