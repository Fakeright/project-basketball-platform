import "server-only"

import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"

import type {
  CommitExternalRevisionInput,
  ExternalBracketRepository,
  ExternalBracketRevision,
  ExternalBracketWorkspaceContext,
  PublishExternalRevisionInput,
  RetireExternalRevisionInput,
  SelectBracketModeInput,
} from "@/features/competition/application/ports/external-bracket-repository"
import type { TournamentMediaAsset } from "@/features/tournament-media/domain/media-asset"

interface DevelopmentExternalBracketWorkspace
  extends Omit<
    ExternalBracketWorkspaceContext,
    | "revisions"
    | "publishedRevision"
    | "bracketMode"
    | "latestConfirmedResultAt"
  > {
  bracketMode: "SYSTEM_GENERATED" | "EXTERNAL_DOCUMENT"
  tournamentSlug: string
  latestConfirmedResultAt?: string | null
}

interface DevelopmentAuditEvent {
  actorId: string
  tournamentId: string
  action: string
  entityId: string
  before: unknown
  after: unknown
  createdAt: string
}

interface DevelopmentExternalBracketState {
  [key: string]: unknown
  externalBracketWorkspaces?: DevelopmentExternalBracketWorkspace[]
  externalBracketRevisions?: ExternalBracketRevision[]
  mediaAssets?: TournamentMediaAsset[]
  auditEvents?: DevelopmentAuditEvent[]
}

type NormalizedState = DevelopmentExternalBracketState & {
  externalBracketWorkspaces: DevelopmentExternalBracketWorkspace[]
  externalBracketRevisions: ExternalBracketRevision[]
  mediaAssets: TournamentMediaAsset[]
  auditEvents: DevelopmentAuditEvent[]
}

const defaultStatePath = path.join(
  process.cwd(),
  ".superpowers",
  "development-tournaments.json",
)
const mutationQueues = new Map<string, Promise<void>>()

export class DevelopmentExternalBracketRepository
  implements ExternalBracketRepository
{
  constructor(
    private readonly statePath = defaultStatePath,
    private readonly createId: () => string = randomUUID,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async findModeSelectionContext(tournamentId: string) {
    const state = await readState(this.statePath)
    const workspace = state.externalBracketWorkspaces.find(
      (candidate) =>
        candidate.tournamentId === tournamentId &&
        candidate.bracketStatus !== "ARCHIVED",
    )
    if (!workspace) return null
    return {
      tournamentId: workspace.tournamentId,
      organizerId: workspace.organizerId,
      bracketId: workspace.bracketId,
      bracketVersion: workspace.bracketVersion,
      bracketStatus: workspace.bracketStatus,
      bracketMode: workspace.bracketMode,
      hasStartedMatch: workspace.hasStartedMatch,
    }
  }

  selectMode(input: SelectBracketModeInput) {
    return this.mutate((state) => {
      const workspace = state.externalBracketWorkspaces.find(
        (candidate) =>
          candidate.tournamentId === input.tournamentId &&
          candidate.bracketId === input.bracketId &&
          candidate.bracketStatus !== "ARCHIVED",
      )
      if (!workspace) throw new Error("NOT_FOUND")
      assertVersion(workspace, input.expectedVersion)
      if (workspace.bracketStatus !== "DRAFT" || workspace.hasStartedMatch) {
        throw new Error("BRACKET_MODE_LOCKED")
      }
      const previousMode = workspace.bracketMode
      workspace.bracketMode = input.targetMode
      workspace.bracketVersion += 1
      appendAudit(state, input, {
        action: "BRACKET_MODE_CHANGED",
        entityId: input.bracketId,
        before: { mode: previousMode, version: input.expectedVersion },
        after: {
          mode: input.targetMode,
          version: workspace.bracketVersion,
          reason: input.reason,
          adminOverride: input.adminOverride,
        },
        createdAt: input.at,
      })
      return {
        bracketId: input.bracketId,
        bracketVersion: workspace.bracketVersion,
        bracketMode: input.targetMode,
      }
    })
  }

  commitUploadedRevision(input: CommitExternalRevisionInput) {
    return this.mutate((state) => {
      if (
        input.asset.tournamentId !== input.tournamentId ||
        input.asset.kind !== "BRACKET_DOCUMENT"
      ) {
        throw new Error("INVALID_EXTERNAL_BRACKET_ASSET")
      }
      const workspace = requireWorkspace(state, input)
      assertVersion(workspace, input.expectedVersion)
      if (state.mediaAssets.some((asset) => asset.id === input.asset.id)) {
        throw new Error("CONFLICT")
      }

      const timestamp = this.now().toISOString()
      const revisionNumber =
        Math.max(
          0,
          ...state.externalBracketRevisions
            .filter((revision) => revision.bracketId === input.bracketId)
            .map((revision) => revision.revision),
        ) + 1
      const mediaAsset: TournamentMediaAsset = {
        ...input.asset,
        createdAt: timestamp,
        deletedAt: null,
      }
      const revision: ExternalBracketRevision = {
        id: this.createId(),
        bracketId: input.bracketId,
        revision: revisionNumber,
        status: "DRAFT",
        publishedAt: null,
        retiredAt: null,
        createdById: input.actorId,
        createdByName: input.actorId,
        createdAt: timestamp,
        mediaAsset,
      }
      workspace.bracketVersion += 1
      state.mediaAssets.push(mediaAsset)
      state.externalBracketRevisions.push(revision)
      appendAudit(state, input, {
        action: "EXTERNAL_BRACKET_REVISION_UPLOADED",
        entityId: revision.id,
        before: null,
        after: {
          bracketId: input.bracketId,
          revision: revisionNumber,
          mediaAssetId: mediaAsset.id,
          adminOverride: input.adminOverride,
          reason: input.reason,
        },
        createdAt: timestamp,
      })
      return revision
    })
  }

  publishRevision(input: PublishExternalRevisionInput) {
    return this.mutate((state) => {
      const workspace = requireWorkspace(state, input)
      assertVersion(workspace, input.expectedVersion)
      const selected = state.externalBracketRevisions.find(
        (revision) =>
          revision.id === input.revisionId &&
          revision.bracketId === input.bracketId &&
          revision.status === "DRAFT" &&
          revision.mediaAsset.deletedAt === null,
      )
      if (!selected) throw new Error("EXTERNAL_BRACKET_REVISION_NOT_PUBLISHABLE")

      const timestamp = this.now().toISOString()
      const current = state.externalBracketRevisions.find(
        (revision) =>
          revision.bracketId === input.bracketId &&
          revision.status === "PUBLISHED",
      )
      if (current) {
        current.status = "RETIRED"
        current.retiredAt = timestamp
      }
      selected.status = "PUBLISHED"
      selected.publishedAt = timestamp
      workspace.bracketStatus = "PUBLISHED"
      workspace.bracketVersion += 1
      appendAudit(state, input, {
        action: "EXTERNAL_BRACKET_REVISION_PUBLISHED",
        entityId: selected.id,
        before: { publishedRevisionId: current?.id ?? null },
        after: {
          publishedRevisionId: selected.id,
          reason: input.reason,
          adminOverride: input.adminOverride,
        },
        createdAt: timestamp,
      })
      return toWorkspace(state, workspace)
    })
  }

  retireRevision(input: RetireExternalRevisionInput) {
    return this.mutate((state) => {
      const workspace = requireWorkspace(state, input)
      assertVersion(workspace, input.expectedVersion)
      const selected = state.externalBracketRevisions.find(
        (revision) =>
          revision.id === input.revisionId &&
          revision.bracketId === input.bracketId &&
          revision.status === "DRAFT",
      )
      if (!selected) throw new Error("EXTERNAL_BRACKET_REVISION_NOT_RETIRABLE")

      const before = structuredClone(selected)
      const timestamp = this.now().toISOString()
      selected.status = "RETIRED"
      selected.retiredAt = timestamp
      workspace.bracketVersion += 1
      appendAudit(state, input, {
        action: "EXTERNAL_BRACKET_REVISION_RETIRED",
        entityId: selected.id,
        before,
        after: {
          ...selected,
          reason: input.reason,
          adminOverride: input.adminOverride,
        },
        createdAt: timestamp,
      })
      return selected
    })
  }

  async findWorkspace(tournamentId: string) {
    const state = await readState(this.statePath)
    const workspace = state.externalBracketWorkspaces.find(
      (candidate) => candidate.tournamentId === tournamentId,
    )
    return workspace ? toWorkspaceContext(state, workspace) : null
  }

  async findPublicByTournamentSlug(slug: string) {
    const state = await readState(this.statePath)
    const workspace = state.externalBracketWorkspaces.find(
      (candidate) =>
        candidate.tournamentSlug === slug &&
        candidate.bracketStatus === "PUBLISHED",
    )
    if (!workspace) return null
    const revision = state.externalBracketRevisions.find(
      (candidate) =>
        candidate.bracketId === workspace.bracketId &&
        candidate.status === "PUBLISHED" &&
        candidate.mediaAsset.deletedAt === null,
    )
    if (!revision) return null
    return {
      tournamentId: workspace.tournamentId,
      tournamentTitle: workspace.tournamentTitle,
      tournamentSlug: workspace.tournamentSlug,
      bracketId: workspace.bracketId,
      revision,
    }
  }

  private mutate<T>(operation: (state: NormalizedState) => T | Promise<T>) {
    return withStateMutation(this.statePath, operation)
  }
}

function requireWorkspace(
  state: NormalizedState,
  input: { tournamentId: string; bracketId: string },
) {
  const workspace = state.externalBracketWorkspaces.find(
    (candidate) =>
      candidate.tournamentId === input.tournamentId &&
      candidate.bracketId === input.bracketId &&
      candidate.bracketMode === "EXTERNAL_DOCUMENT" &&
      candidate.bracketStatus !== "ARCHIVED",
  )
  if (!workspace) throw new Error("NOT_FOUND")
  return workspace
}

function assertVersion(
  workspace: DevelopmentExternalBracketWorkspace,
  expectedVersion: number,
) {
  if (workspace.bracketVersion !== expectedVersion) throw new Error("CONFLICT")
}

function toWorkspace(
  state: NormalizedState,
  workspace: DevelopmentExternalBracketWorkspace,
) {
  const revisions = state.externalBracketRevisions
    .filter((revision) => revision.bracketId === workspace.bracketId)
    .sort((left, right) => right.revision - left.revision)
  return {
    bracketId: workspace.bracketId,
    bracketVersion: workspace.bracketVersion,
    revisions,
    publishedRevision:
      revisions.find((revision) => revision.status === "PUBLISHED") ?? null,
  }
}

function toWorkspaceContext(
  state: NormalizedState,
  workspace: DevelopmentExternalBracketWorkspace,
): ExternalBracketWorkspaceContext {
  if (workspace.bracketMode !== "EXTERNAL_DOCUMENT") {
    throw new Error("BRACKET_MODE_NOT_EXTERNAL")
  }
  return {
    ...workspace,
    bracketMode: "EXTERNAL_DOCUMENT",
    latestConfirmedResultAt: workspace.latestConfirmedResultAt ?? null,
    ...toWorkspace(state, workspace),
  }
}

function appendAudit(
  state: NormalizedState,
  input: { actorId: string; tournamentId: string },
  event: Omit<DevelopmentAuditEvent, "actorId" | "tournamentId">,
) {
  state.auditEvents.push({
    actorId: input.actorId,
    tournamentId: input.tournamentId,
    ...event,
  })
}

async function readState(statePath: string): Promise<NormalizedState> {
  try {
    const state = JSON.parse(
      await readFile(statePath, "utf8"),
    ) as DevelopmentExternalBracketState
    return {
      ...state,
      externalBracketWorkspaces: state.externalBracketWorkspaces ?? [],
      externalBracketRevisions: state.externalBracketRevisions ?? [],
      mediaAssets: state.mediaAssets ?? [],
      auditEvents: state.auditEvents ?? [],
    }
  } catch {
    return {
      externalBracketWorkspaces: [],
      externalBracketRevisions: [],
      mediaAssets: [],
      auditEvents: [],
    }
  }
}

async function writeState(statePath: string, state: NormalizedState) {
  await mkdir(path.dirname(statePath), { recursive: true })
  await writeFile(statePath, JSON.stringify(state, null, 2), "utf8")
}

async function withStateMutation<T>(
  statePath: string,
  operation: (state: NormalizedState) => T | Promise<T>,
) {
  const previous = mutationQueues.get(statePath) ?? Promise.resolve()
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  const tail = previous.then(() => gate)
  mutationQueues.set(statePath, tail)
  await previous
  try {
    const state = await readState(statePath)
    const result = await operation(state)
    await writeState(statePath, state)
    return result
  } finally {
    release()
    if (mutationQueues.get(statePath) === tail) mutationQueues.delete(statePath)
  }
}
