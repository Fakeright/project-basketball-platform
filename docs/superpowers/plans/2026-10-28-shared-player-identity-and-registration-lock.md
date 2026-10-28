# Shared Player Identity And Registration Lock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ผู้เล่นเดิมมี identity เดียวในบัญชีผู้จัดการทีมและไม่ถูกส่งสมัครซ้อนระหว่างที่ยังติดใบสมัครอื่น

**Architecture:** `PlayerIdentity` เป็นคนจริงในบัญชีเดียว; `TeamPlayer` เป็น membership รายทีม; `RegistrationPlayer` เป็น snapshot ตอนส่งสมัครและคีย์สำหรับตรวจการจองตัวใน transaction. ใช้ use case เดิมและ Prisma adapters เดิม ไม่ย้ายกฎสิทธิ์ไป client.

**Tech Stack:** Next.js App Router 16, React 19, TypeScript, Prisma, Supabase PostgreSQL, Vitest

**Spec:** `docs/superpowers/specs/2026-10-28-shared-player-identity-and-registration-lock-design.md`

**ข้อกำหนดล่าสุด:** กันใบสมัครซ้ำเฉพาะรายการที่ช่วงวันเวลาแข่งขันทับกัน; รายการที่วันเวลาไม่ทับกันใช้ผู้เล่นคนเดิมได้ แม้รายการเดิมยังไม่จบ

## Global Constraints

- ไม่ลบข้อมูลทีม/ใบสมัคร/ผลการแข่งขันเดิม; migration แบบเพิ่มข้อมูลและ backfill
- ภาษาไทยใน UI; server ตรวจ ownership เสมอ; ไม่เปิดเผย PII ใน audit/log
- ใช้ active roster ทั้งทีมตอนสมัคร, ไม่เพิ่มหน้าคัดผู้เล่น
- ทำบน worktree ปัจจุบัน; ไม่ commit/push จนผู้ใช้ขอ

## Review Focus

- คนชื่อและวันเกิดซ้ำในบัญชีเดียวกัน: backfill ต้องรวมตามกฎและไม่สร้าง identity ซ้ำเมื่อสร้างทีมใหม่
- source identity ของบัญชีอื่น: API ต้องปฏิเสธ แม้ payload ใส่ชื่อเดียวกัน
- active registrations ในข้อมูลเก่า: ต้อง backfill snapshot และบล็อกใบสมัครใหม่โดยไม่ยกเลิกเดิม
- สองคำขอสมัครพร้อมกัน: ต้องมีได้ไม่เกินหนึ่งคำขอที่จอง identity ชุดเดียวกัน
- เปลี่ยน roster หลังสมัคร: หน้าผู้จัดต้องยังแสดงรายชื่อ ณ วันที่สมัคร

---

### Task 1: Data Model And Backfill

**Files:** `prisma/schema.prisma`, `prisma/migrations/20261028090000_shared_player_identity/migration.sql`, tests migration script

**Interfaces:** `PlayerIdentity(id, ownerId, firstName, lastName, birthDate, normalizedFirstName, normalizedLastName)`, `TeamPlayer.playerIdentityId`, `RegistrationPlayer(registrationId, playerIdentityId, teamPlayerId, firstNameSnapshot, lastNameSnapshot, birthDateSnapshot, jerseyNumberSnapshot, positionSnapshot, backfilled)`

- [ ] Write failing migration/model tests: owner-scoped normalized identity merge, TeamPlayer IDs unchanged, active legacy registration snapshots, no duplicate registration player
- [ ] Run focused tests and verify red
- [ ] Add schema and additive migration with deterministic backfill and indexes/uniqueness; preserve legacy fields
- [ ] Run focused tests and `prisma validate`/generate; verify counts against development database without reset

### Task 2: Team Reuse By Identity

**Files:** `features/team-management/domain/team.ts`, `features/team-management/domain/team-player-history.ts`, `features/team-management/application/{create-team,add-team-players,list-reusable-team-players}.ts`, `features/team-management/application/ports/team-repository.ts`, `features/team-management/infrastructure/prisma-team-repository.ts`, `features/team-management/presentation/team-handler.ts`, `components/team/{team-editor,team-creation-roster-editor,reusable-player-selector}.tsx`, focused tests

**Interfaces:** `TeamPlayer.playerIdentityId`; create payload `players: (TeamPlayerDraft | { playerIdentityId: string; jerseyNumber: number | null; position: TeamPlayerPosition | null })[]`. Repository resolves IDs under team owner in transaction. New manual player gets or creates identity by normalized name/date. Membership row may be new, identity row must be reused.

- [ ] Write failing use-case/repository/UI/route tests for reuse by ID, foreign-owner rejection, normalized manual dedupe, team-specific jersey/position
- [ ] Run focused tests and verify red
- [ ] Implement repository identity resolution and membership writes; preserve deactivate/reactivate and audit semantics
- [ ] Change selector/form payload to use stable ID and keep manual fields; update read models and edits to show canonical person
- [ ] Run focused tests; verify existing team create/edit tests

### Task 3: Registration Lock And Snapshot

**Files:** `features/registrations/application/{apply-to-tournament,ports/registration-repository}.ts`, `features/registrations/infrastructure/prisma-registration-repository.ts`, `features/registrations/presentation/registration-handler.ts`, focused tests

**Interfaces:** `RegistrationRepositoryTransaction.findConflictingPlayers(playerIdentityIds, { startsAt, endsAt })` and `createPending({ ..., playerSnapshots })`. SQL locks identities sorted by ID, then checks active `PENDING`/`APPROVED` registrations in unfinished tournaments whose interval overlaps the new tournament (`old.startsAt < new.endsAt` and `old.endsAt > new.startsAt`); returns `409 PLAYER_ALREADY_COMPETING` only for an overlap.

- [ ] Write failing domain/use-case/route/repository tests: first application, pending/approved blocked, terminal statuses released, completed tournament released, legacy conflict, concurrent requests
- [ ] Run focused tests and verify red
- [ ] Extend transaction to lock identities, check conflicts, store snapshot with registration, map 409 Thai message
- [ ] Change organizer registration projection to read snapshot for new/backfilled registrations; legacy completed registration uses old projection
- [ ] Run focused tests and broader registration/competition tests

### Task 4: Verification And Delivery

**Files:** documentation and focused integration tests only where required

- [ ] Run migration against development database only after read-only preflight, then verify identity/membership/snapshot counts and existing registration collisions
- [ ] Run `npm run test`, `npm run lint`, `npm run build`, `git diff --check`, `git status --short`
- [ ] Verify team create/reuse and registration errors at desktop/mobile widths; no changes to unrelated files
- [ ] Report code, migration/deployment status, existing-data limitations, and exact next step for production; do not claim live deployment without commit/push and migration verification
