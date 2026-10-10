import { withdrawRegistration } from "@/features/registrations/application/withdraw-registration"
import { getRegistrationRepository } from "@/features/registrations/infrastructure/get-registration-repository"
import { handleWithdrawRegistration } from "@/features/registrations/presentation/registration-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; registrationId: string }> },
) {
  const { id, registrationId } = await params
  const registrations = getRegistrationRepository()
  return handleWithdrawRegistration(id, registrationId, request, {
    actorProvider: createNextCookieCurrentActorProvider(),
    withdraw: (input, actor) =>
      withdrawRegistration(input, actor, {
        registrations,
        now: () => new Date(),
      }),
  })
}
