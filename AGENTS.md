# AGENTS.md — Evolve Church Management System (Evolve ChMS)

## 1. Mission
Premium all-in-one ChMS: multi-location ops, visitor CRM, church members with household tags, dynamic RBAC, fund accounting (audited ledger), projects kanban, campaigns CMS (email + SMS).

## 2. Stack
- Next.js 16 App Router, React 19, Tailwind v4, **Shadcn UI only**, Hugeicons.
- Elysia + Eden, Drizzle + postgres.js, TanStack Query v5, Zustand.
- DnD: **`@dnd-kit`** for all kanban boards.
- Auth: Better Auth (email + Google). Cookie = **session token only**.

## 3. Nomenclature
- UI default: **Location** / **Locations** (API field `campusId`).
- Never ship sales CRM copy: no `deals` / `pipeline` product names in routes.
- Visitors API: `/api/visitors`. Members: `/api/members`.

## 4. Dynamic RBAC (critical)
- Tables: `app_roles`, `app_permissions`, `role_permissions`, `user_roles`.
- **`admin` / `isAdmin`** → all permissions.
- Churches define custom roles + permission matrix in Settings.
- **Never store roles/permissions in cookies** — load via `/api/settings/abilities` into `AbilityProvider`.
- UI: `<Can permission="…">`, `<RequireAbility>`. Sidebar uses `NAV_PERMISSION`.
- Server: `requirePermission(userId, key)`.

## 5. Domain rules
- **Members** = church members; household roles: father, mother, spouse, son, daughter, guardian, head, other.
- **Kanban**: visitors (lead stages) + projects (`backlog`→`done`) via shared board.
- **Campaigns**: `/dashboard/campaigns`. **Email = Resend only** (`features/communications/resend.ts`). **SMS = separate provider** (`features/communications/sms.ts`, Twilio adapter by default — never Resend). Drips under communications.
- **Ledger**: never silent auto-post; always record who created / who posted.

## 6. UI
- Shell: `SidebarProvider` → `AppSidebar` → `SidebarInset`, canvas `#fbfcfb`, accent `#16a34a`.
- Lists: Shadcn `Table` + `TableToolbar` (ButtonGroup export/filter/more) + row `DropdownMenu` actions + `Empty` + server `Pagination` + `ScrollArea`.
- Forms & detail: inset `Sheet`. Compact create: `Dialog`. Confirms: `ConfirmAction`. Forms use `Field` / `FieldGroup`; receipts via `FileAttachment`.
- Accounting COA: `Accordion` by account class; ⌘K `Command` jump; `HoverCard` for codes/hints; `NavigationMenu` for guidance links.
- Policies: `/dashboard/policies` TipTap editor, module-scoped.
- Forms: Shadcn inputs + DatePicker/TimePicker.

## 7. Agent rules
- Type-safe controllers → services → Zod → hooks.
- Atomic files; sandboxed commands first.
- Follow SPECIFICATION.md acceptance criteria.
