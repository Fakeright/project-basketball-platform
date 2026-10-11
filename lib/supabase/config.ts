import { AuthDependencyUnavailableError } from "@/features/identity/application/auth-errors"

type Environment = Record<string, string | undefined>
type RuntimeEnvironment = "development" | "test" | "production"

export function getPublicSupabaseConfiguration(
  environment: Environment = process.env,
) {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey =
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !publishableKey) {
    throw new AuthDependencyUnavailableError(
      "SUPABASE_PUBLIC_CONFIGURATION_MISSING",
    )
  }

  try {
    const parsedUrl = new URL(url)
    if (
      (parsedUrl.protocol !== "http:" &&
        parsedUrl.protocol !== "https:") ||
      parsedUrl.username ||
      parsedUrl.password
    ) {
      throw new Error("invalid")
    }
  } catch {
    throw new AuthDependencyUnavailableError(
      "SUPABASE_PUBLIC_CONFIGURATION_INVALID",
    )
  }

  return { url, publishableKey }
}

export function resolvePublicSupabaseConfigurationForRuntime(
  environment: Environment = process.env,
  runtimeEnvironment: RuntimeEnvironment = process.env
    .NODE_ENV as RuntimeEnvironment,
) {
  const hasConfiguration = Boolean(
    environment.NEXT_PUBLIC_SUPABASE_URL &&
      environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )
  if (!hasConfiguration && runtimeEnvironment === "development") {
    return null
  }
  return getPublicSupabaseConfiguration(environment)
}

export function getApplicationUrl(
  environment: Environment = process.env,
  runtimeEnvironment: RuntimeEnvironment = process.env
    .NODE_ENV as RuntimeEnvironment,
) {
  const configuredUrl =
    environment.APP_URL ??
    (runtimeEnvironment === "development"
      ? "http://localhost:3000"
      : undefined)
  if (!configuredUrl) {
    throw new AuthDependencyUnavailableError("APP_URL_MISSING")
  }

  try {
    const url = new URL(configuredUrl)
    const isLoopback =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "[::1]"
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      (runtimeEnvironment === "production" &&
        url.protocol !== "https:") ||
      (url.protocol === "http:" && !isLoopback) ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      throw new Error("invalid")
    }
    return url
  } catch {
    throw new AuthDependencyUnavailableError("APP_URL_INVALID")
  }
}

export function getRecoverySecret(
  environment: Environment = process.env,
) {
  const secret = environment.AUTH_RECOVERY_SECRET
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new AuthDependencyUnavailableError(
      "AUTH_RECOVERY_SECRET_MISSING_OR_SHORT",
    )
  }
  return secret
}

export function getAdminSupabaseConfiguration(
  environment: Environment = process.env,
) {
  const url = environment.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    throw new AuthDependencyUnavailableError(
      "SUPABASE_ADMIN_CONFIGURATION_MISSING",
    )
  }
  return { url, serviceRoleKey }
}
