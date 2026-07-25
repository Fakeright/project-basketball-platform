import "server-only"

import { cookies } from "next/headers"

import { CookieCurrentActorProvider } from "./cookie-current-actor-provider"

export function createNextCookieCurrentActorProvider() {
  return new CookieCurrentActorProvider(async () => {
    const cookieStore = await cookies()
    return cookieStore.get("courtside-actor")?.value
  }, process.env.NODE_ENV !== "production")
}
