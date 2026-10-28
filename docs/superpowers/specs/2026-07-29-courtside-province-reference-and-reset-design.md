# COURTSIDE Province Reference And Clean Reset Design

## Goal

Replace free-text province values with a normalized 77-province reference
model, provide a searchable Thai-first selector wherever a team or tournament
province is chosen, and reset the approved development Supabase project before
seeding a consistent new dataset.

## Scope

This slice includes:

- A `Province` reference model seeded with all 77 Thai provinces.
- Standard two-digit Ministry of Interior province codes, stored as values such
  as `10` for Bangkok and `92` for Trang. The code list is based on the
  two-digit province-code convention referenced by Thai government materials.
- `provinceCode` foreign keys on `Team` and `Tournament`.
- Thai and English province names for display and searchable matching.
- One accessible searchable province combobox used by tournament discovery,
  tournament create/edit, and team create/edit.
- Exact province-code filtering for public tournament search.
- Removal of anonymous Login/Register actions from the Home hero; those actions
  remain only in the shared header and mobile navigation sheet.
- A one-time approved clean reset of Supabase PostgreSQL data, Supabase Auth
  users, and all objects in `tournament-posters` and `tournament-documents`.
- New development seed data that uses province codes and is immediately usable
  for public tournament discovery.

This slice does not add province administration screens, a public API for
reference data, multi-country support, email verification, or production user
impersonation.

## Reference Data Model

`Province` is immutable application reference data. It has a two-character
`code` primary key, a unique `nameTh`, and a unique `nameEn`. The application
ships the 77-record source list in a domain-owned module and the Prisma seed
upserts it before any sample teams or tournaments.

`Team` and `Tournament` replace the existing free-text `province` column with
`provinceCode`. Each relation is required, indexed, and uses `Restrict` delete
behavior so a reference row cannot be removed while business data depends on
it. Public read models expose both `provinceCode` and the Thai display name
where consumers need them; UI copy shows `nameTh`.

Server commands accept only a known `provinceCode`. Zod validation and
application boundaries reject an unknown or missing code with a Thai `422`
message. Search parameters use the code, never a display name.

## Searchable Province Selector

The selector is a focused client component using the installed Base UI
Combobox primitive. It accepts `name`, `value`, and an optional all-provinces
mode for search. It renders a visible label, keyboard-operable input, selected
Thai name, and a hidden form value containing the code.

Typing filters against Thai and English names without changing the canonical
value. Tournament search supplies an `ทุกจังหวัด` clear option. Team and
tournament editors require a selection and do not permit arbitrary province
text. The popup is constrained to the viewport and remains scrollable on
narrow screens.

## Home Authentication Entry

The anonymous Home hero action row is removed. Login and Register remain in
the desktop header and mobile navigation sheet only. Authenticated users
continue to see their Supabase-linked account controls; anonymous users never
see a role label.

## Approved Clean Reset

The reset is an explicit, local-only script and is not part of a request path.
It must refuse to run unless all of these are true:

- `NODE_ENV` is not `production`.
- `COURTSIDE_ALLOW_DESTRUCTIVE_RESET` equals `true`.
- Required Supabase URL and service-role configuration are present.

The execution order is:

1. Delete every object in the two configured tournament-media buckets,
   including nested paths.
2. Delete every Supabase Auth user through the service-role Admin API, using
   pagination until no users remain.
3. Reset PostgreSQL through Prisma migrations and run the new seed.
4. Verify that 77 province rows exist, sample data references valid codes, and
   the affected storage buckets are empty.

The script reports aggregate counts only. It never prints keys, passwords,
emails, object paths, or user identifiers. It must not be runnable against a
production environment.

## Seed Data

Seed data creates the province reference rows first, then a small public
tournament set across multiple provinces, with teams and approved registrations
where required by existing public views. It creates no Supabase Auth users and
does not embed test passwords. Real accounts are created through the existing
registration flow.

## Testing And Verification

Tests cover:

- The reference list contains exactly 77 unique codes and names.
- Province-code input validation accepts known codes and rejects arbitrary
  text.
- Prisma repositories map province relations, filter exact codes, and do not
  query by display names.
- The combobox searches Thai and English names, submits the code, clears
  search filters, and remains keyboard accessible.
- Tournament and team editors require a selected province.
- Home has no hero Login/Register actions while anonymous header actions stay
  available.
- The destructive reset guard rejects production, missing confirmation, and
  incomplete Supabase configuration before any deletion API call.

Verification includes focused tests, the full Vitest suite, lint, production
build, Prisma validation and migration status, a non-destructive reset-script
guard test, and browser checks at 375px, 768px, and 1440px.
