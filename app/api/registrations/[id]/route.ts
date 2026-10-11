import { cancelRegistration } from "@/features/registrations/application/cancel-registration"
import { getRegistrationRepository } from "@/features/registrations/infrastructure/get-registration-repository"
import { handleCancelRegistration } from "@/features/registrations/presentation/registration-handler"
import { createNextCookieCurrentActorProvider } from "@/features/identity/infrastructure/next-cookie-current-actor-provider"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const registrations = getRegistrationRepository()
  return handleCancelRegistration(id, request, {
    actorProvider: createNextCookieCurrentActorProvider(),
    cancel: (input, actor) => cancelRegistration(input, actor, {
      registrations,
      now: () => new Date(),
    }),
  })
}
