import "server-only"

import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import type { TournamentMediaRepository } from "@/features/tournament-media/application/ports/tournament-media-repository"
import type { MediaAssetKind, TournamentMediaAsset } from "@/features/tournament-media/domain/media-asset"

interface DevelopmentMediaState {
  [key: string]: unknown
  mediaAssets?: TournamentMediaAsset[]
  auditEvents?: Array<{
    actorId: string
    tournamentId: string
    action: string
    entityId: string
    createdAt: string
  }>
}

const stateDirectory = path.join(process.cwd(), ".superpowers")
const statePath = path.join(stateDirectory, "development-tournaments.json")

export class DevelopmentTournamentMediaRepository
  implements TournamentMediaRepository
{
  async createAsset(
    asset: Omit<TournamentMediaAsset, "createdAt" | "deletedAt">,
  ): Promise<TournamentMediaAsset> {
    const state = await readState()
    const created = {
      ...asset,
      createdAt: new Date().toISOString(),
      deletedAt: null,
    }
    state.mediaAssets.push(created)
    await writeState(state)
    return created
  }

  async findActivePoster(tournamentId: string) {
    const state = await readState()
    return (
      state.mediaAssets
        .filter(
          (asset) =>
            asset.tournamentId === tournamentId &&
            asset.kind === "POSTER" &&
            asset.deletedAt === null,
        )
        .at(-1) ?? null
    )
  }

  async findActiveAsset(tournamentId: string, assetId: string) {
    const state = await readState()
    return (
      state.mediaAssets.find(
        (asset) =>
          asset.tournamentId === tournamentId &&
          asset.id === assetId &&
          asset.deletedAt === null,
      ) ?? null
    )
  }

  async listActiveAssets(tournamentId: string) {
    const state = await readState()
    return state.mediaAssets.filter(
      (asset) => asset.tournamentId === tournamentId && asset.deletedAt === null,
    )
  }

  async retireAsset(assetId: string) {
    const state = await readState()
    const asset = state.mediaAssets.find((candidate) => candidate.id === assetId)
    if (!asset) throw new Error("MEDIA_ASSET_NOT_FOUND")
    asset.deletedAt = new Date().toISOString()
    await writeState(state)
  }

  async appendAuditEvent(input: {
    actorId: string
    tournamentId: string
    action: "media.uploaded" | "media.replaced" | "media.deleted"
    entityId: string
  }) {
    const state = await readState()
    state.auditEvents.push({ ...input, createdAt: new Date().toISOString() })
    await writeState(state)
  }

  async hasActiveAssetOfKind(tournamentId: string, kind: MediaAssetKind) {
    return (await this.listActiveAssets(tournamentId)).some(
      (asset) => asset.kind === kind,
    )
  }
}

async function readState(): Promise<
  DevelopmentMediaState & {
    mediaAssets: TournamentMediaAsset[]
    auditEvents: NonNullable<DevelopmentMediaState["auditEvents"]>
  }
> {
  try {
    const state = JSON.parse(await readFile(statePath, "utf8")) as DevelopmentMediaState
    return {
      ...state,
      mediaAssets: state.mediaAssets ?? [],
      auditEvents: state.auditEvents ?? [],
    }
  } catch {
    await mkdir(stateDirectory, { recursive: true })
    return { mediaAssets: [], auditEvents: [] }
  }
}

async function writeState(state: DevelopmentMediaState) {
  await mkdir(stateDirectory, { recursive: true })
  await writeFile(statePath, JSON.stringify(state, null, 2), "utf8")
}
