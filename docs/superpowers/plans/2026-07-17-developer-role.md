# Developer Role + Admin Management — Implementation Plan

> **For agentic workers:** Implement task-by-task. Spec: `docs/superpowers/specs/2026-07-17-developer-role-design.md`.

**Goal:** Add `DEVELOPER` role above `ADMIN`, `User.isActive`, and a dashboard UI for developers to create/edit/deactivate admins, reset passwords, and change roles.

**Architecture:** Extend Prisma `UserRole` + `isActive`; centralize `isStaff` / `isDeveloper` helpers; treat DEVELOPER as staff everywhere ADMIN is staff; gate admin-management actions and `/dashboard/admins` to DEVELOPER only.

## File map

| File | Responsibility |
|------|----------------|
| `prisma/schema.prisma` | `DEVELOPER` enum + `isActive` |
| `prisma/seed.ts` | Seed as DEVELOPER |
| `src/lib/roles.ts` | `isStaff`, `isDeveloper` helpers |
| `src/lib/auth-guard.ts` | Staff/developer guards; login-related redirects |
| `src/auth.ts` | Reject inactive users; refresh role |
| `src/lib/actions/admin-user.ts` | Create/update/deactivate/reset/change-role |
| `src/lib/validations/admin-user.ts` | Zod schemas |
| `src/lib/email-templates.ts` | `emailAdminCreated` |
| `src/app/.../dashboard/admins/page.tsx` | List + create |
| `src/components/dashboard/admin-user-*` | Forms/actions UI |
| `src/lib/dashboard-nav.ts` | Nav item for DEVELOPER |
| All `role === ADMIN` staff checks | Also allow DEVELOPER via `isStaff` |
| `messages/es.json`, `en.json` | i18n |

## Tasks

1. Schema + seed + generate + migrate/push  
2. Role helpers + auth inactive check + widen staff guards  
3. Server actions + validations + email template  
4. Dashboard UI `/dashboard/admins` + nav + i18n  
5. Build verify + commit
