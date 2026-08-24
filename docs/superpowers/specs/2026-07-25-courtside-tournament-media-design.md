# COURTSIDE Tournament Media Design

## Goal

Add real Supabase Storage uploads for tournament posters and related documents. Organizers manage media only for tournaments they own, while public tournament details display the approved poster and offer time-limited document downloads once a tournament is publicly visible.

## Scope

This slice delivers one primary poster and zero or more related documents for a tournament. It includes upload, replacement, deletion, metadata persistence, public presentation, and Thai validation/error states. Gallery media, image editing, file previews, and drag-and-drop reordering are outside this slice.

## Storage Model

Two Supabase Storage buckets already exist:

| Asset | Bucket | Visibility | Allowed files | Limit |
| --- | --- | --- | --- | --- |
| Poster | tournament-posters | Public | JPEG, PNG, WebP | 5 MB |
| Document | tournament-documents | Private | PDF, DOC, DOCX | 10 MB |

The application uploads only through authenticated Route Handlers using the server-only service-role key. Browser clients never receive that key. Object paths are deterministic but contain collision-resistant names:

```text
tournaments/{tournamentId}/poster/{assetId}.{extension}
tournaments/{tournamentId}/documents/{assetId}.{extension}
```

Poster rows expose a public URL from the public bucket. Document rows retain only their storage path; a public detail read creates a signed URL with a short lifetime when the tournament has a public lifecycle status.

## Data Model

Add MediaAsset and MediaAssetKind to Prisma:

```text
MediaAssetKind = POSTER | DOCUMENT

MediaAsset
- id, tournamentId, kind, bucket, objectPath
- fileName, contentType, byteSize
- createdById, createdAt, deletedAt
```

Tournament owns mediaAssets. A partial unique constraint is enforced in application code so a tournament has at most one active POSTER; uploading a replacement first persists the new asset and then removes the previous object and marks its row deleted. Documents remain append-only until explicitly deleted. Every upload, replacement, and deletion adds an audit event.

The existing development tournament repository gains the same media metadata shape so the organizer flow remains demonstrable before the Prisma tournament repository replaces it. The production repository persists metadata through Prisma once the Supabase database connection and migration are available.

## Authorization And Visibility

tournament.update plus ownership is required to upload, replace, or delete an organizer's media. Platform admins can perform those operations for any tournament and their action is audited. Route Handlers validate ownership before calling Storage.

Documents are downloadable by any visitor only when the tournament is in PUBLISHED, REGISTRATION_CLOSED, IN_PROGRESS, COMPLETED, or ARCHIVED. Draft, submitted, rejected, suspended, and changes-requested tournaments do not yield document URLs. Poster URLs are public by bucket design, but the application only renders them on public detail pages for visible tournaments.

## Upload Flow

1. The editor selects a poster or one or more documents using labelled file inputs.
2. The client checks the file count, MIME type, and byte size for immediate feedback; the Route Handler repeats every validation authoritatively.
3. The handler resolves the current actor, tournament, and ownership.
4. The storage adapter creates a safe object path and uploads the file.
5. The application persists media metadata and an audit event. If persistence fails, it removes the newly uploaded object before returning an error.
6. The editor refreshes its media list and announces success using Thai copy.

Delete asks for explicit confirmation. A failed storage deletion leaves the metadata intact and returns a recoverable error; a missing remote object is handled as a successful cleanup only after the metadata is safely retired.

## Presentation

The organizer editor gains a Thai Media and Documents section after the tournament fields. It has a portrait poster preview with replace/remove actions, then a structured document list showing file name, type, and size with an icon action for removal. Empty state copy explains what can be uploaded without presenting a decorative card stack.

The public tournament detail uses the poster as a first-viewport signal. On desktop it becomes a 4:5 image column beside the editorial title, status, description, and operational facts. On mobile the image appears directly below the status and above the title. Missing media uses a restrained typographic placeholder rather than an image-like gradient.

Published documents appear in a full-width Thai tournament-documents band below the main details. Each row has a file-type icon, name, size, and an accessible download action. The UI displays loading, no-document, and download-error states in Thai.

## Interfaces

The application layer exposes:

```ts
type UploadableMediaKind = "POSTER" | "DOCUMENT"

interface MediaUploadInput {
  tournamentId: string
  kind: UploadableMediaKind
  file: File
}

interface TournamentMediaAsset {
  id: string
  kind: UploadableMediaKind
  fileName: string
  contentType: string
  byteSize: number
  publicUrl?: string
}
```

The storage port supports upload, remove, getPublicUrl, and createSignedUrl. Route Handlers are POST /api/admin/tournaments/[id]/media and DELETE /api/admin/tournaments/[id]/media/[assetId]. Public read models receive a poster URL and signed document links; they never receive service keys or raw private storage paths.

## Failure Handling And Tests

- Return 401, 403, 404, 409, 413, 415, and 422 with clear Thai messages for authentication, ownership, missing records, replacement races, size, MIME type, and invalid form data.
- Domain/application tests cover one-poster replacement, ownership, type/size validation, compensation after metadata failure, and audit events.
- Route tests cover authorization and status mapping without real Supabase.
- Adapter integration tests run only when all Supabase credentials are present; otherwise they are explicitly skipped rather than simulated as production.
- UI tests cover previews, file validation, removal confirmation, and document rows on the public detail view.
- Responsive verification covers 375px, 768px, and 1440px, including poster crop, document rows, and no horizontal overflow.

## Prerequisites

Before the Prisma migration, the local environment needs a Supabase PostgreSQL DATABASE_URL from the project's Connect panel in addition to the three Storage values already configured. This remains in .env.local and is never committed. The two configured Storage buckets must retain their stated visibility, MIME, and file-size settings.
