import { NextResponse } from "next/server"

import {
  developmentActorIds,
  getDevelopmentSessionDestination,
} from "@/features/identity/infrastructure/cookie-current-actor-provider"
import { isDevelopmentCookieSessionMode } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export async function POST(request: Request) {
  if (!isDevelopmentCookieSessionMode()) {
    return new Response(null, { status: 404 })
  }

  const formData = await request.formData()
  const actorId = formData.get("actorId")?.toString()
  if (!actorId || !developmentActorIds.includes(actorId)) {
    return Response.json({ error: "บัญชีทดสอบไม่ถูกต้อง" }, { status: 422 })
  }

  const response = NextResponse.redirect(
    new URL(getDevelopmentSessionDestination(actorId), request.url),
    303,
  )
  response.cookies.set("courtside-actor", actorId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  })
  return response
}
