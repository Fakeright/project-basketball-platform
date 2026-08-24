import type {
  AuthRecoveryGrantRepository,
  ConsumeAuthRecoveryGrantInput,
  CreateAuthRecoveryGrantInput,
} from "@/features/identity/application/ports/auth-recovery-grant-repository"

export function recordRecoveryGrant(
  input: CreateAuthRecoveryGrantInput,
  repository: AuthRecoveryGrantRepository,
) {
  return repository.create(input)
}

export function consumeRecoveryGrant(
  input: ConsumeAuthRecoveryGrantInput,
  repository: AuthRecoveryGrantRepository,
) {
  return repository.consume(input)
}
