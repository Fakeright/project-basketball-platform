import type {
  Actor,
  CurrentActorProvider,
} from "@/features/identity/domain/actor"

const developmentActors: Readonly<Record<string, Actor>> = {
  "admin-1": {
    id: "admin-1",
    role: "PLATFORM_ADMIN",
    email: "admin@courtside.local",
    displayName: "Platform Admin",
  },
  "organizer-1": {
    id: "organizer-1",
    role: "TOURNAMENT_ORGANIZER",
    email: "organizer-1@courtside.local",
    displayName: "Organizer One",
  },
  "organizer-2": {
    id: "organizer-2",
    role: "TOURNAMENT_ORGANIZER",
    email: "organizer-2@courtside.local",
    displayName: "Organizer Two",
  },
  "team-manager-1": {
    id: "team-manager-1",
    role: "TEAM_MANAGER",
    email: "team-manager-1@courtside.local",
    displayName: "Team Manager",
  },
}

export const developmentActorIds = Object.keys(developmentActors)

export function getDevelopmentSessionDestination(actorId: string) {
  const role = developmentActors[actorId]?.role
  if (role === "TEAM_MANAGER") return "/team"
  if (role === "TOURNAMENT_ORGANIZER") return "/organizer"
  return "/admin"
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
