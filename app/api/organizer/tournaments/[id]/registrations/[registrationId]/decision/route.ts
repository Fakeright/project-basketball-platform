import { decideRegistration } from "@/features/registrations/application/decide-registration"
import { getRegistrationRepository } from "@/features/registrations/infrastructure/get-registration-repository"
import { handleDecideRegistration } from "@/features/registrations/presentation/registration-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; registrationId: string }> },
) {
  const { id, registrationId } = await params
  const registrations = getRegistrationRepository()
  return handleDecideRegistration(id, registrationId, request, {
    actorProvider: createNextCookieCurrentActorProvider(),
    decide: (input, actor) =>
      decideRegistration(input, actor, {
        registrations,
        now: () => new Date(),
      }),
  })
}
