import type {
  AuthRecoveryGrantRepository,
  ConsumeAuthRecoveryGrantInput,
  CreateAuthRecoveryGrantInput,
} from "@/features/identity/application/ports/auth-recovery-grant-repository"

interface RecoveryGrantDatabaseClient {
  authRecoveryGrant: {
    create(input: {
      data: CreateAuthRecoveryGrantInput
    }): Promise<unknown>
    updateMany(input: {
      where: {
        nonceHash: string
        userId: string
        consumedAt: null
        expiresAt: { gte: Date }
      }
      data: { consumedAt: Date }
    }): Promise<{ count: number }>
  }
}

export class PrismaAuthRecoveryGrantRepository
  implements AuthRecoveryGrantRepository
{
  constructor(
    private readonly prisma: RecoveryGrantDatabaseClient,
  ) {}

  async create(input: CreateAuthRecoveryGrantInput) {
    await this.prisma.authRecoveryGrant.create({ data: input })
  }

  async consume(input: ConsumeAuthRecoveryGrantInput) {
    const result = await this.prisma.authRecoveryGrant.updateMany({
      where: {
        nonceHash: input.nonceHash,
        userId: input.userId,
        consumedAt: null,
        expiresAt: { gte: input.now },
      },
      data: { consumedAt: input.now },
    })
    return result.count === 1
  }
}
