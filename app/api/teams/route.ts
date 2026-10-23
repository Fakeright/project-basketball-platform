/**
 * COURTSIDE: คำอธิบายไฟล์
 * API POST /api/teams: รับคำขอ HTTP แล้วส่งต่อ handleCreateTeam
 * ตามการทำงานต่อ: features/team-management/application/create-team.ts, features/team-management/infrastructure/prisma-team-repository.ts, features/team-management/presentation/team-handler.ts
 */

import { createTeam } from "@/features/team-management/application/create-team"
import { PrismaTeamRepository } from "@/features/team-management/infrastructure/prisma-team-repository"
import { handleCreateTeam } from "@/features/team-management/presentation/team-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"
import { withSafeRouteBoundary } from "@/features/shared/presentation/safe-http"
import { getPrismaClient } from "@/lib/server/prisma"

// รับข้อมูลจาก TeamEditor แล้วส่งให้ team-handler ตรวจคำขอ ก่อน createTeam บันทึกผ่าน repository
export async function POST(request: Request) {
  return withSafeRouteBoundary("team.create", async () => {
    const repository = new PrismaTeamRepository(getPrismaClient())
    return handleCreateTeam(request, {
      actorProvider: createNextCookieCurrentActorProvider(),
      create: (input, actor) => createTeam(input, actor, { teams: repository }),
    })
  })
}
