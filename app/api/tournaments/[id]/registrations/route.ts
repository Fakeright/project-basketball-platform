import { applyToTournament } from "@/features/registrations/application/apply-to-tournament"
import { getRegistrationRepository } from "@/features/registrations/infrastructure/get-registration-repository"
import { handleApplyToTournament } from "@/features/registrations/presentation/registration-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const registrations = getRegistrationRepository()
  return handleApplyToTournament(id, request, {
    actorProvider: createNextCookieCurrentActorProvider(),
    apply: (input, actor) => applyToTournament(input, actor, {
      registrations,
      now: () => new Date(),
    }),
  })
}
