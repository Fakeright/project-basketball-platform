export class RequestBodyTooLargeError extends Error {
  constructor() {
    super("REQUEST_BODY_TOO_LARGE")
  }
}

export async function readRequestBodyWithLimit(
  request: Request,
  maximumBytes: number,
): Promise<ArrayBuffer | null> {
  const contentLength = request.headers.get("content-length")
  if (contentLength) {
    const declaredBytes = Number(contentLength)
    if (Number.isFinite(declaredBytes) && declaredBytes > maximumBytes) {
      throw new RequestBodyTooLargeError()
    }
  }
  if (!request.body) return null

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalBytes += value.byteLength
    if (totalBytes > maximumBytes) {
      try {
        await reader.cancel()
      } catch {}
      throw new RequestBodyTooLargeError()
    }
    chunks.push(value)
  }

  const body = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return body.buffer
}
