type AuthResponseBody = {
  message?: unknown
  redirectTo?: unknown
}

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
