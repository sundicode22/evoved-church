# EVOLVE CHURCH MANAGEMENT SYSTEM (Evolve ChMS)
## Comprehensive Product, Technical & Architectural Specification Document

---

## 1. Executive Summary
Evolve ChMS unifies multi-location church operations, visitor CRM, church-member records (with household relationship tags), dynamic RBAC, fund accounting with audited ledger posting, projects kanban, and a campaigns CMS (email + SMS).

### 1.1 Design
- Canvas `#fbfcfb`, white surfaces, green accent `#16a34a` / `#22c55e`.
- **Shadcn UI only** + Hugeicons. Kanban via **`@dnd-kit`**.
- Shell: sidebar-07 (`AppSidebar` + `SidebarInset`).
- Forms & small/detail info use **inset Sheets** (padded off viewport edges, rounded). Wide detail Sheets for visitors/members (summary + activity tabs + contact rail).
- **Dialog** modals for compact creates; **AlertDialog / ConfirmAction** for approve, reject, ledger post, publish, delete, campaign send.
- **Policies** CMS (`/dashboard/policies`): TipTap editor, module-scoped policy documents.

### 1.2 Location (not “campus” jargon)
A **Location** is one site of the same church (Main, North, Online). UI labels default to Location/Locations via nomenclature. API/DB field remains `campusId`.

---

## 2. Authentication & Dynamic RBAC

### 2.1 Better Auth
Email/password + Google OAuth. Session **cookie stores token only**.

### 2.2 Dynamic roles & permissions
Tables: `app_roles`, `app_permissions`, `role_permissions`, `user_roles`.

- Churches **create roles** and assign a **permission matrix**.
- Built-in **`admin`** role has `isAdmin: true` → **all permissions** (wildcard).
- Permissions never stored in cookies — loaded from DB into `AbilityProvider`.
- UI: `<Can permission="…">`, `<RequireAbility>`, sidebar filtered by `NAV_PERMISSION`.
- API: `requirePermission(userId, key)` → Forbidden/Unauthorized.

### 2.3 Settings CMS tabs
General/Nomenclature · Roles & Permissions · Custom fields · Integrations · Locations.

---

## 3. Church Members & Household Roles

Members are **church members** (not a separate Families product). Household links use:

`father | mother | spouse | son | daughter | guardian | head | other`

Detail Sheet tabs: Profile | Household | Lifecycle | Safety. Lifecycle changes audit **who** changed type.

---

## 4. Visitor Leads & Projects Kanban

Shared `@dnd-kit` board pattern:

| Board | Route | Stages |
| :--- | :--- | :--- |
| Visitors / new leads | `/dashboard/visitors` | first_visit → … → active_partner |
| Projects | `/dashboard/projects` | backlog → in_progress → review → done |

`/dashboard/tasks` redirects to projects.

---

## 5. Campaigns CMS (Email + SMS)

Routes: `/dashboard/campaigns`, `/dashboard/campaigns/[id]`.

- Channels: email | sms | both.
- **Email = Resend only** (`communications/resend.ts`).
- **SMS = separate provider** (`communications/sms.ts`, Twilio by default — never Resend).
- Audience filters, schedule, send logs.
- Permissions: `campaigns.read` / `write` / `send`.
- Automated visitor drips remain under `/dashboard/communications`.

---

## 6. Fund Accounting & FP Reporting

- Manual ledger: draft → explicit **post** with `createdByUserId` / `postedByUserId` (confirm modal required).
- Multi-tier expense approvals with actor history (confirm approve/reject).
- Funds, **budget lines**, expense requisitions (create Sheet), COA, journal.
- `/dashboard/metrics`: budget vs actual, visitor funnel, expense aging, ledger activity. Permission `reports.read`. Scoped by Location.

## 6b. Church Policies

- Module-scoped policies (accounting, giving, visitors, members, safety, documents, campaigns, privacy, general).
- TipTap rich editor; draft → publish (confirm) → archive/delete.
- Permissions: `policies.read` / `policies.write` / `policies.publish`.

---

## 7. App Router Map

| Path | Purpose |
| :--- | :--- |
| `/login`, `/signup`, `/onboarding` | Auth & church setup |
| `/welcome/[campus-slug]` | Public QR card |
| `/dashboard/visitors` | Lead kanban |
| `/dashboard/projects` | Projects kanban |
| `/dashboard/members` | Church members + household roles |
| `/dashboard/groups` | Small groups |
| `/dashboard/accounting` | Funds, expenses, ledger |
| `/dashboard/campaigns` | Email/SMS campaigns CMS |
| `/dashboard/communications` | Visitor drip sequences |
| `/dashboard/documents` | Media vault |
| `/dashboard/metrics` | FP reports |
| `/dashboard/settings` | Nomenclature + dynamic RBAC |
| `/dashboard/services` | Multi-type services + run sheets (`/sunday-services` redirects) |
| `/dashboard/calendar` | Church calendar — programs, dates, assignees |
| `/dashboard/organigram` | Org tree |
| `/dashboard/giving` | Tithes & pledges |

### API prefixes
`/api/visitors`, `/members`, `/projects`, `/campaigns`, `/accounting`, `/services`, `/calendar`, `/import`, `/settings/roles`, `/settings/abilities`, `/settings/permissions`, `/campuses`, `/organigram`, `/attendance`, `/documents`.

### Leaving another ChMS
Export CSV from the old tool → Settings → **Import CSV** → download Evolve template → dry-run → apply. Members/households and giving supported in v0.1 (generic CSV, not vendor APIs).

---

## 8. Sprint acceptance (current)

- [x] Dynamic RBAC + Can + admin wildcard; permissions not in cookies  
- [x] Settings Roles & Permissions matrix  
- [x] Campaigns email/SMS CMS pages  
- [x] Projects kanban + shared board  
- [x] Location nomenclature defaults  
- [x] Household Father/Mother tags + member Sheet  
- [x] FP metrics live hooks  
- [x] SPEC/AGENTS sync  
- [x] Budgets / expenses UX (funds, budget lines, requisition Sheet, confirm approve/post)  
- [x] Policies CMS with TipTap editor + module binding  
- [x] ConfirmAction alerts + Dialog modals where appropriate  
- [x] Multi-service (not Sunday-only)  
- [x] Church calendar programs + assignees  
- [x] CSV migration import (members + giving)  
- [x] First-release smoke (`bun scripts/smoke-first-release.ts` — 11/11)  

## 9. Gracely parity sprint (Sheets + Zod only)

- [x] Gracely-style sidebar IA (People / Finances / Calendar / Communications / Forms / Reports / Portal)  
- [x] Design consistency — inset Sheets + Field/FieldGroup + Evolve green (no Gracely Dialog creates)  
- [x] Onboarding redesign (Location wording) + redirect gates (`onboardingCompletedAt` + cookie)  
- [x] Write-to-books — post journal validates balance, bumps `fund.balance`, ConfirmAction  
- [x] Giving + Batches + Pledges + Funds pages (live)  
- [x] Groups + Families  
- [x] Rooms + Resources + Appointments schedules + Follow Ups + Attendance UI  
- [x] Drips + Announcements (TipTap Sheet)  
- [x] Forms builder + public `/f/[slug]` + member `/portal/[slug]`  
- [x] Settings Custom fields + Locations tabs; Stripe integration stub; invite Resend when keyed  
- [x] Live Home dashboard widgets  


