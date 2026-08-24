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
  async commitUpload(input: {
    asset: Omit<TournamentMediaAsset, "createdAt" | "deletedAt">
    actorId: string
    adminOverride: boolean
  }) {
    const state = await readState()
    const retiredAsset =
      input.asset.kind === "POSTER"
        ? (state.mediaAssets.find(
            (asset) =>
              asset.tournamentId === input.asset.tournamentId &&
              asset.kind === "POSTER" &&
              asset.deletedAt === null,
          ) ?? null)
        : null
    if (retiredAsset) retiredAsset.deletedAt = new Date().toISOString()
    const created = {
      ...input.asset,
      createdAt: new Date().toISOString(),
      deletedAt: null,
    }
    state.mediaAssets.push(created)
    state.auditEvents.push({
      actorId: input.actorId,
      tournamentId: input.asset.tournamentId,
      action: retiredAsset ? "media.replaced" : "media.uploaded",
      entityId: created.id,
      createdAt: new Date().toISOString(),
    })
    if (input.adminOverride) {
      state.auditEvents.push({
        actorId: input.actorId,
        tournamentId: input.asset.tournamentId,
        action: "media.admin_override",
        entityId: created.id,
        createdAt: new Date().toISOString(),
      })
    }
    await writeState(state)
    return { asset: created, retiredAsset }
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

  async retireWithAudit(input: {
    tournamentId: string
    assetId: string
    actorId: string
    adminOverride: boolean
  }) {
    const state = await readState()
    const asset = state.mediaAssets.find(
      (candidate) =>
        candidate.id === input.assetId &&
        candidate.tournamentId === input.tournamentId &&
        candidate.deletedAt === null,
    )
    if (!asset) throw new Error("MEDIA_ASSET_NOT_FOUND")
    asset.deletedAt = new Date().toISOString()
    state.auditEvents.push({
      actorId: input.actorId,
      tournamentId: input.tournamentId,
      action: "media.deleted",
      entityId: asset.id,
      createdAt: new Date().toISOString(),
    })
    if (input.adminOverride) {
      state.auditEvents.push({
        actorId: input.actorId,
        tournamentId: input.tournamentId,
        action: "media.admin_override",
        entityId: asset.id,
        createdAt: new Date().toISOString(),
      })
    }
    await writeState(state)
    return asset
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
