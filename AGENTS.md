# AGENTS.md — Evolve Church Management System (Evolve ChMS)
**Development Standards, Design Guidelines & Architectural Directives**

---

## 1. Project Mission & North Star
**Evolve ChMS** is a next-generation Church Management System engineered to outperform legacy platforms (Planning Center, Breeze, Pushpay/CCB, Tithe.ly) through:
1. **Ultra-Clean, Delightful UX**: High-contrast, clean minimalist card-based UI with gentle pastel green highlights (`#16a34a` / `#22c55e`), modern typography, and zero clutter.
2. **True All-in-One Architecture**: Eliminates fragmented multi-subscription tool sprawl by unifying multi-campus hierarchy, interactive organigram, non-profit fund accounting, visitor CRM pipeline, and project/task management.
3. **Rock-Solid TypeScript Stack**: Next.js 16 (App Router), ElysiaJS API route engine, Drizzle ORM (PostgreSQL), Zustand (client-side state), and TanStack Query v5 (server-state & optimistic updates).

---

## 2. Technical Stack & Conventions

### 2.1 Frontend Architecture
- **Framework**: Next.js 16 (App Router), React 19.
- **Styling**: Tailwind CSS v4, tw-animate-css, Shadcn UI base components.
- **Icons**: Hugeicons (`@hugeicons/react` and `@hugeicons/core-free-icons`).
- **State Management**:
  - **Client State**: Zustand (`src/store/`) for UI state, current branch/campus selection, active drawers, filter toggles.
  - **Server State & Caching**: TanStack Query v5 (`@tanstack/react-query`). Every data mutation MUST implement optimistic updates or query invalidation for instant perceived speed.
- **Navigation Layout**: Shadcn UI `sidebar-07` collapsible hierarchical navigation with church/branch switcher in the header and user profile in footer.

### 2.2 Backend & API Architecture
- **Driver & ORM**: PostgreSQL via **`postgres.js`** driver + **Drizzle ORM** (`src/lib/db/index.ts`).
- **Layered Clean Architecture**:
  - **Controllers** (`src/features/*/controller.ts`): Request validation with Zod, status codes, delegations.
  - **Services** (`src/features/*/service.ts`): Pure domain logic, Drizzle ORM queries, transactional consistency.
  - **Schemas** (`src/features/*/schemas.ts`): Zod schemas for all validated inputs and inferred TypeScript types.
  - **Hooks** (`src/features/*/hooks/`): TanStack Query v5 custom hooks with query key isolation and optimistic updates.
- **Robust Centralized Error Handling** (`src/lib/errors.ts`):
  - Domain error hierarchy: `AppError`, `NotFoundError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`, `BudgetExceededError`.
  - Standardized JSON error response shape: `{ success: false, error: { code, message, details, timestamp } }`.
- **API Engine**: ElysiaJS integrated directly inside Next.js via `src/app/api/[[...slugs]]/route.ts` using Web standard `Request`/`Response`.
- **Client-to-Server RPC**: `@elysiajs/eden` for end-to-end typed contract without code generation or manual boilerplate.

### 2.3 Media & Document Storage
- **Cloudinary SDK**: Signed uploads for sermon audio/video, high-res member avatars, event media, receipts, and invoices.
- **Folder Vault**: Role-gated folder structure mirroring church departments with dynamic RBAC permissions.

---

## 3. UI/UX Design System (Reference Screenshots)

All user interfaces must strictly respect the aesthetic captured in the design references:

| Element | Specification |
| :--- | :--- |
| **Color Palette** | Pure White (`#ffffff`), Subtle Canvas (`#f8faf9` / `#fbfcfb`), Slate text (`#0f172a`), Soft Green Accent (`#16a34a` / `#22c55e`), Muted Badges (`bg-emerald-50 text-emerald-700 border-emerald-200`). |
| **Kanban Columns** | Clean card columns with header pill: Title, aggregate currency total, total item count, and quick options `...`. |
| **Kanban Cards** | Crisp white cards, rounded-xl (`12px` to `16px`), subtle border (`border-zinc-200/60`), shadow-sm, contact avatar, financial value in bold green/dark, time-elapsed badge (`1m`, `30m`, `2h`), and bottom meta icons (tasks, notes, attachments). |
| **Detail Slide-Over** | Split drawer with top lifecycle stepper (`Stage: Proposal Sent` / `Stage: First-Timer Coffee`), active automation drip indicator, multi-tab layout (`Activity`, `Appointments`, `Giving/Proposals`, `Notes`, `Tasks`), and contact info sidebar. |
| **Sidebar (sidebar-07)** | Grouped collapsible items, sleek active indicator with soft green background and dark text, church/campus switcher at top, collapsible collapse button `<<`. |

---

## 4. Core Domain Modules

1. **Multi-Branch & Visual Organigram**:
   - Dynamic organizational tree of Senior Pastor -> Executive Pastors -> Ministry Directors -> Department Heads -> Small Group Leaders -> Volunteers.
   - Drag-and-drop reorganization with live permission recalculation.
2. **First-Time Visitors & Lead Pipeline**:
   - Intake via digital QR connection card / kiosk.
   - Kanban stage progression: `First Visit -> Welcome Call -> Pastoral Visit / Coffee -> Foundations Class -> Group Integration -> Active Partner`.
   - Automated communication drip triggers.
3. **Non-Profit Fund Accounting**:
   - Strict double-entry ledger (Assets, Liabilities, Net Assets / Fund Balance, Revenues, Expenses).
   - Restricted vs Unrestricted funds (General, Missions, Building, Youth, Benevolence).
   - Tithes, Offerings & Pledges tracking with 501(c)(3) compliant end-of-year tax statements.
   - Invoicing, Purchase Orders, and 2-step Pastoral approval workflow for church expenses.
4. **Member & Groups Management**:
   - Household linking (Primary member, spouse, dependents).
   - Small Groups / Life Groups with attendance tracking, geo-location mapping, and leader reports.
5. **Role-Based Document Management**:
   - Hierarchical church directory for bylaws, board meeting minutes, sermon manuscripts, and media.
   - Granular RBAC: Global vs Branch-specific, pastoral privacy locks for counseling notes.

---

## 5. Agent Workflow & Execution Rules
- Always run sandboxed commands first.
- Maintain type safety across client and server via Elysia + Eden + Drizzle.
- Never write monolithic files: keep components atomic, composable, and cleanly exported.
