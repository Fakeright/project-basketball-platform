import type { TournamentMediaAsset } from "@/features/tournament-media/domain/media-asset"

export const externalBracketRevisionStatuses = [
  "DRAFT",
  "PUBLISHED",
  "RETIRED",
] as const

export type ExternalBracketRevisionStatus =
  (typeof externalBracketRevisionStatuses)[number]

export interface ExternalBracketRevision {
  id: string
  bracketId: string
  revision: number
  status: ExternalBracketRevisionStatus
  publishedAt: string | null
  retiredAt: string | null
  createdById: string
  createdByName: string
  createdAt: string
  mediaAsset: TournamentMediaAsset
}

export interface ExternalBracketWorkspace {
  bracketId: string
  bracketVersion: number
  revisions: ExternalBracketRevision[]
  publishedRevision: ExternalBracketRevision | null
}

export interface ExternalBracketWorkspaceContext extends ExternalBracketWorkspace {
  tournamentId: string
  tournamentTitle: string
  organizerId: string
  bracketStatus: string
  bracketMode: "EXTERNAL_DOCUMENT"
  hasStartedMatch: boolean
}

export interface BracketModeSelectionContext {
  tournamentId: string
  organizerId: string
  bracketId: string
  bracketVersion: number
  bracketStatus: string
  bracketMode: "SYSTEM_GENERATED" | "EXTERNAL_DOCUMENT"
  hasStartedMatch: boolean
}

export interface SelectBracketModeInput {
  tournamentId: string
  bracketId: string
  targetMode: "SYSTEM_GENERATED" | "EXTERNAL_DOCUMENT"
  expectedVersion: number
  actorId: string
  adminOverride: boolean
  reason: string | null
  at: string
}

export interface SelectedBracketMode {
  bracketId: string
  bracketVersion: number
  bracketMode: "SYSTEM_GENERATED" | "EXTERNAL_DOCUMENT"
}

export interface PublicExternalBracket {
  tournamentId: string
  tournamentTitle: string
  tournamentSlug: string
  bracketId: string
  revision: ExternalBracketRevision
}

export interface CommitExternalRevisionInput {
  tournamentId: string
  bracketId: string
  expectedVersion: number
  asset: Omit<TournamentMediaAsset, "createdAt" | "deletedAt"> & {
    kind: "BRACKET_DOCUMENT"
  }
  actorId: string
  adminOverride: boolean
  reason: string | null
}

export interface PublishExternalRevisionInput {
  tournamentId: string
  bracketId: string
  revisionId: string
  expectedVersion: number
  actorId: string
  adminOverride: boolean
  reason: string | null
}

export type RetireExternalRevisionInput = PublishExternalRevisionInput

export interface ExternalBracketRepository {
  findModeSelectionContext(
    tournamentId: string,
  ): Promise<BracketModeSelectionContext | null>
  selectMode(input: SelectBracketModeInput): Promise<SelectedBracketMode>
  commitUploadedRevision(
    input: CommitExternalRevisionInput,
  ): Promise<ExternalBracketRevision>
  publishRevision(
    input: PublishExternalRevisionInput,
  ): Promise<ExternalBracketWorkspace>
  retireRevision(
    input: RetireExternalRevisionInput,
  ): Promise<ExternalBracketRevision>
  findWorkspace(
    tournamentId: string,
  ): Promise<ExternalBracketWorkspaceContext | null>
  findPublicByTournamentSlug(
    slug: string,
  ): Promise<PublicExternalBracket | null>
}
