# COURTSIDE

COURTSIDE is a Thai-first responsive basketball tournament platform for public visitors, players, coaches, team managers, tournament organizers, and platform admins.

The current release covers tournament discovery, authentication, tournament approval and publication, team rosters, registrations, posters, and documents. Bracket generation, scheduling mutations, results, notifications, and advanced analytics remain on the roadmap.

## Technology

The installed stack is:

- Next.js `16.2.11` with App Router
- React `19.2.4` and React DOM `19.2.4`
- TypeScript `^5`
- Tailwind CSS `^4`, `@tailwindcss/postcss` `^4`, and `tw-animate-css` `^1.4.0`
- shadcn `^4.14.1` and Base UI React `^1.6.0`
- Prisma `^7.9.0` with `@prisma/client` `^7.9.0`, `@prisma/adapter-pg` `^7.9.0`, and PostgreSQL driver `pg` `^8.22.0`
- Supabase JS `^2.110.8` and Supabase SSR `^0.12.4`
- Zod `^4.4.3`, Lucide React `^1.26.0`, `clsx` `^2.1.1`, `tailwind-merge` `^3.6.0`, and class-variance-authority `^0.7.1`
- Vitest `^4.1.10`, React Testing Library `^16.3.2`, Testing Library User Event `^14.6.1`, and JSDOM `^29.1.1`
- ESLint `^9` with `eslint-config-next` `16.2.11`

The architecture follows this dependency direction:

```text
presentation -> application -> domain
infrastructure -> application/domain contracts
```

Server Components are the default. Route Handlers own HTTP mutations. Application use cases enforce permissions and ownership. Prisma and Supabase are infrastructure adapters.

## Roles

| Role | Current scope |
| --- | --- |
| `PLAYER` | Registered identity; dedicated self-service workspace is still planned. |
| `COACH` | Registered identity; dedicated self-service workspace is still planned. |
| `TEAM_MANAGER` | Manages team rosters and registrations in the current release. |
| `TOURNAMENT_ORGANIZER` | Creates and operates owned tournaments; organizers record results in the planned competition workflow. |
| `PLATFORM_ADMIN` | Reviews and governs tournaments across the platform. |

There is no referee role. Results are part of the planned competition workflow and are recorded by organizers.

## Prerequisites

Install or provision:

- Node.js 20 or newer
- npm
- A Supabase project
- PostgreSQL connection details

Copy `.env.example` to `.env.local` and populate only your local file. Use these variable names without committing their values:

```dotenv
DATABASE_URL=
APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_RECOVERY_SECRET=
```

Never commit `.env.local`, service-role keys, or database passwords. Rotate any credential exposed in chat, logs, screenshots, or source history.

## Installation

Run the verified setup sequence from the project root:

```powershell
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

`npm run reset:development` is destructive and may only be used against an explicitly confirmed development database.

## Quality Checks

```powershell
npm run test
npm run lint
npm run build
```

- `npm run test` runs the Vitest test suite.
- `npm run lint` checks the project with ESLint.
- `npm run build` creates a production build.

## Project Map

- `app/` - Next.js App Router pages, layouts, loading and error states, and Route Handlers.
- `components/` - Shared presentation components and UI primitives.
- `features/` - Feature-oriented domain, application, infrastructure, and presentation modules.
- `prisma/` - Prisma schema, migrations, and seed data.
- `tests/` - Unit, integration, and UI tests.
- `docs/` - Product specifications, implementation plans, and operational documentation.

See the [roadmap](docs/ROADMAP.md) for planned work. The dated documents in [docs/superpowers/specs/](docs/superpowers/specs/) and [docs/superpowers/plans/](docs/superpowers/plans/) are historical implementation records.
