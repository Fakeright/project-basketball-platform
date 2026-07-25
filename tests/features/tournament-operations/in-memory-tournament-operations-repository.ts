import type {
  AuditEvent,
  TournamentOperation,
  TournamentReview,
} from "@/features/tournament-operations/domain/tournament-operation";
import type {
  TournamentOperationChanges,
  TournamentOperationSideEffects,
  TournamentOperationsRepository,
} from "@/features/tournament-operations/infrastructure/tournament-operations-repository";

export class InMemoryTournamentOperationsRepository
  implements TournamentOperationsRepository
{
  readonly auditEvents: AuditEvent[] = [];
  readonly reviews: TournamentReview[] = [];
  private readonly tournaments = new Map<string, TournamentOperation>();

  constructor(tournaments: TournamentOperation[] = []) {
    for (const tournament of tournaments) {
      this.tournaments.set(tournament.id, structuredClone(tournament));
    }
  }

  async create(tournament: TournamentOperation): Promise<TournamentOperation> {
    this.tournaments.set(tournament.id, structuredClone(tournament));
    return structuredClone(tournament);
  }

  async findById(id: string): Promise<TournamentOperation | null> {
    const tournament = this.tournaments.get(id);
    return tournament ? structuredClone(tournament) : null;
  }

  async updateWithVersion(
    id: string,
    expectedVersion: number,
    changes: TournamentOperationChanges,
    sideEffects: TournamentOperationSideEffects = {},
  ): Promise<TournamentOperation> {
    const current = this.tournaments.get(id);

    if (!current) {
      throw new Error("TOURNAMENT_NOT_FOUND");
    }

    if (current.version !== expectedVersion) {
      throw new Error("CONFLICT");
    }

    const updated: TournamentOperation = {
      ...current,
      ...changes,
      version: current.version + 1,
      updatedAt: new Date("2026-07-25T10:00:00.000Z"),
    };

    this.tournaments.set(id, structuredClone(updated));

    if (sideEffects.review) {
      this.reviews.push(structuredClone(sideEffects.review));
    }

    if (sideEffects.auditEvent) {
      this.auditEvents.push(structuredClone(sideEffects.auditEvent));
    }

    return structuredClone(updated);
  }

  async appendAuditEvent(event: AuditEvent): Promise<void> {
    this.auditEvents.push(structuredClone(event));
  }
}
