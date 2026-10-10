import "server-only"

import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto"

import {
  consumeRecoveryGrant,
  recordRecoveryGrant,
} from "@/features/identity/application/manage-recovery-grant"
import type {
  AuthRecoveryGrantRepository,
  VerifiedRecoveryTransaction,
} from "@/features/identity/application/ports/auth-recovery-grant-repository"

const recoveryCookieName = "courtside-recovery"
const recoveryGrantLifetimeSeconds = 10 * 60
const recoveryCookiePath = "/api/auth/reset-password"

interface RecoveryCookieStore {
  get(name: string): { value: string } | undefined
  set(
    name: string,
    value: string,
    options: {
      httpOnly: boolean
      sameSite: "lax"
      secure: boolean
      path: string
      maxAge: number
    },
  ): void
}

interface RecoveryGrantOptions {
  secret: string
  cookieStore: RecoveryCookieStore
  now?: () => number
  secure: boolean
  repository: AuthRecoveryGrantRepository
}

interface RecoveryGrantPayload {
  subject: string
  expiresAt: number
  nonce: string
}

interface RecoveryTransactionPayload {
  emailHash: string
  expiresAt: number
  nonce: string
}

export class HmacRecoveryGrantService {
  private readonly now: () => number

  constructor(private readonly options: RecoveryGrantOptions) {
    if (Buffer.byteLength(options.secret, "utf8") < 32) {
      throw new Error("AUTH_RECOVERY_SECRET_TOO_SHORT")
    }
    this.now = options.now ?? Date.now
  }

  async issueTransactionState(email: string) {
    const payload: RecoveryTransactionPayload = {
      emailHash: hashNormalizedEmail(email),
      expiresAt:
        this.now() + recoveryGrantLifetimeSeconds * 1_000,
      nonce: randomBytes(16).toString("base64url"),
    }
    const encodedPayload = encodePayload(payload)
    return `${encodedPayload}.${this.sign(
      "transaction",
      encodedPayload,
    )}`
  }

  async verifyTransactionState(
    state: string,
  ): Promise<VerifiedRecoveryTransaction | null> {
    const encodedPayload = this.verifySignedValue(
      state,
      "transaction",
    )
    if (!encodedPayload) return null

    try {
      const payload = JSON.parse(
        Buffer.from(encodedPayload, "base64url").toString("utf8"),
      ) as Partial<RecoveryTransactionPayload>
      if (
        typeof payload.emailHash !== "string" ||
        typeof payload.expiresAt !== "number" ||
        payload.expiresAt < this.now() ||
        typeof payload.nonce !== "string"
      ) {
        return null
      }
      return { emailHash: payload.emailHash }
    } catch {
      return null
    }
  }

  matchesTransactionEmail(
    transaction: VerifiedRecoveryTransaction,
    email: string,
  ) {
    const expected = Buffer.from(transaction.emailHash, "base64url")
    const actual = Buffer.from(
      hashNormalizedEmail(email),
      "base64url",
    )
    return (
      expected.length === actual.length &&
      timingSafeEqual(expected, actual)
    )
  }

  async issue(userId: string) {
    const nonce = randomBytes(32).toString("base64url")
    const expiresAt =
      this.now() + recoveryGrantLifetimeSeconds * 1_000
    const payload: RecoveryGrantPayload = {
      subject: userId,
      expiresAt,
      nonce,
    }
    const encodedPayload = encodePayload(payload)
    const token = `${encodedPayload}.${this.sign(
      "grant",
      encodedPayload,
    )}`

    await recordRecoveryGrant(
      {
        nonceHash: hashNonce(nonce),
        userId,
        expiresAt: new Date(expiresAt),
      },
      this.options.repository,
    )
    this.options.cookieStore.set(recoveryCookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: this.options.secure,
      path: recoveryCookiePath,
      maxAge: recoveryGrantLifetimeSeconds,
    })
  }

  async consume(userId: string) {
    const token =
      this.options.cookieStore.get(recoveryCookieName)?.value
    this.clear()
    if (!token) return false

    const encodedPayload = this.verifySignedValue(token, "grant")
    if (!encodedPayload) return false

    try {
      const payload = JSON.parse(
        Buffer.from(encodedPayload, "base64url").toString("utf8"),
      ) as Partial<RecoveryGrantPayload>
      const nonce =
        typeof payload.nonce === "string" ? payload.nonce : null
      if (
        payload.subject !== userId ||
        typeof payload.expiresAt !== "number" ||
        payload.expiresAt < this.now() ||
        nonce === null
      ) {
        return false
      }

      return consumeRecoveryGrant(
        {
          nonceHash: hashNonce(nonce),
          userId,
          now: new Date(this.now()),
        },
        this.options.repository,
      )
    } catch {
      return false
    }
  }

  private clear() {
    this.options.cookieStore.set(recoveryCookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: this.options.secure,
      path: recoveryCookiePath,
      maxAge: 0,
    })
  }

  private verifySignedValue(value: string, purpose: string) {
    const [encodedPayload, encodedSignature, extra] = value.split(".")
    if (!encodedPayload || !encodedSignature || extra) return null

    const actualBuffer = Buffer.from(encodedSignature, "utf8")
    const expectedBuffer = Buffer.from(
      this.sign(purpose, encodedPayload),
      "utf8",
    )
    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return null
    }
    return encodedPayload
  }

  private sign(purpose: string, encodedPayload: string) {
    return createHmac("sha256", this.options.secret)
      .update(`${purpose}:${encodedPayload}`)
      .digest("base64url")
  }
}

function encodePayload(payload: object) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  )
}

function hashNormalizedEmail(email: string) {
  return createHash("sha256")
    .update(email.trim().toLowerCase(), "utf8")
    .digest("base64url")
}

function hashNonce(nonce: string) {
  return createHash("sha256")
    .update(nonce, "utf8")
    .digest("hex")
}
