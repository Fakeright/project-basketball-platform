import type {
  Actor,
  CurrentActorProvider,
} from "@/features/identity/domain/actor"

const developmentActors: Readonly<Record<string, Actor>> = {
  "admin-1": { id: "admin-1", role: "PLATFORM_ADMIN" },
  "organizer-1": {
    id: "organizer-1",
    role: "TOURNAMENT_ORGANIZER",
  },
  "organizer-2": {
    id: "organizer-2",
    role: "TOURNAMENT_ORGANIZER",
  },
}

export const developmentActorIds = Object.keys(developmentActors)

export function getDevelopmentSessionDestination(actorId: string) {
  return developmentActors[actorId]?.role === "TOURNAMENT_ORGANIZER"
    ? "/organizer"
    : "/admin"
}

export class CookieCurrentActorProvider implements CurrentActorProvider {
  constructor(
    private readonly readActorCookie: () => Promise<string | undefined>,
    private readonly developmentSessionEnabled: boolean,
  ) {}

  async getCurrentActor(): Promise<Actor | null> {
    if (!this.developmentSessionEnabled) return null

    const actorId = await this.readActorCookie()
    return actorId ? developmentActors[actorId] ?? null : null
  }
}
