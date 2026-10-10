export type MediaCleanupOperation =
  | "media.upload.compensate"
  | "media.upload.retired_object"
  | "media.delete.restore"
  | "media.delete.cleanup"

export interface MediaCleanupLogger {
  error(event: {
    operation: MediaCleanupOperation
    assetId: string
    errorType: "Error" | "NonError"
  }): void
}

export function reportMediaCleanupFailure(
  operation: MediaCleanupOperation,
  assetId: string,
  error: unknown,
  logger?: MediaCleanupLogger,
) {
  const event = {
    operation,
    assetId,
    errorType: error instanceof Error ? ("Error" as const) : ("NonError" as const),
  }
  try {
    ;(logger ?? defaultMediaCleanupLogger).error(event)
  } catch {}
}

const defaultMediaCleanupLogger: MediaCleanupLogger = {
  error(event) {
    console.error(event)
  },
}
