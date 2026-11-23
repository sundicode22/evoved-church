# EVOLVE CHURCH MANAGEMENT SYSTEM (Evolve ChMS)
## Comprehensive Product, Technical & Architectural Specification Document

---

## 1. Executive Summary & Competitive Research

### 1.1 The Market Opportunity
The global Church Management Software (ChMS) market is characterized by aging legacy platforms, fragmented modular subscriptions, and outdated user experiences. Churches today operate as complex, multi-faceted organizations encompassing spiritual care, multi-campus operations, event logistics, volunteer coordination, compliance, and multi-million dollar non-profit fund accounting.

### 1.2 Competitive Benchmark & Gap Analysis

| Platform | Core Strengths | Critical Pain Points & Gaps | How Evolve ChMS Wins |
| :--- | :--- | :--- | :--- |
| **Planning Center (PCO)** | Gold standard for volunteer scheduling & service orders (`Services`); decent check-ins. | Fragmented modular pricing (pay per app); no built-in double-entry fund accounting; weak CRM lead/visitor pipeline; no visual organigram. | **Unified all-in-one suite** with modern integrated fund accounting, visual drag-and-drop organigram, and zero nickel-and-diming per module. |
| **Pushpay / CCB** | Strong enterprise donor management and multi-campus giving. | Extremely high enterprise price tag; rigid legacy UI; slow performance; steep onboarding curve. | **Blazingly fast Next.js + ElysiaJS architecture**; instant optimistic updates; accessible modern pricing and modern CRM Kanban pipelines. |
| **Breeze ChMS** | Simple interface; flat $72/month pricing; great for small churches. | Severely lacks advanced features: no true multi-fund accounting, no multi-tier organigram, no advanced custom pipelines. | **Maintains Breeze's simplicity** for daily volunteers while offering enterprise multi-campus power, deep accounting, and advanced pipelines. |
| **Tithe.ly** | Strong mobile giving and digital check-ins. | Weak project management; limited multi-branch pastoral hierarchy; rudimentary reporting. | **Comprehensive Kanban project management** and automated drip sequences directly integrated with member and pastoral records. |
| **Rock RMS** | Highly customizable; open-source core; robust data modeling. | Heavy .NET legacy stack; requires dedicated IT engineers; poor default UI/UX; painful upgrades. | **Modern TypeScript full-stack (Next.js 16 + Drizzle ORM + ElysiaJS)** with turnkey cloud deployments and modern design aesthetics. |

### 1.3 Design Benchmark & Aesthetics (Reference Screenshots)
Based on the approved design language:
- **Canvas & Tone**: Pristine white surfaces (`#ffffff`) over subtle warm/neutral canvas (`#f8faf9`), with generous spacing, soft rounded corners (`rounded-xl` / `rounded-2xl`), and thin borders (`border-zinc-200/70`).
- **Accent Identity**: Distinctive fresh green (`#16a34a` / `#22c55e`) used with restraint for primary actions, active navigation pills, stage highlights, and financial totals.
- **Kanban Board Aesthetics**:
  - Column headers with stage title, aggregate monetary sum (`$6,500.00`), total card count (`8 deals`), and action menus.
  - Cards containing entity title, location, primary contact with colored avatar initials, pledge/financial amount, elapsed time indicator (`1m`, `30m`, `5h`), and task/note/attachment counter badges.
  - Slide-over detail drawer with stage pipeline progress breadcrumb (`New Leads -> Request Rec... -> In Draft -> Proposal Sent -> Approved`), sequence automation triggers, tabbed navigation (`Activity`, `Appointments`, `Proposals/Giving`, `Invoices`, `Notes`, `Tasks`), and contact metadata.
- **Sidebar (sidebar-07)**:
  - Collapsible hierarchical navigation, Church/Campus switcher at the top, clear section grouping (Dashboard, Management, Accounting, Media Vault), and user footer profile.

---

## 2. Structural & Multi-Branch Organizational Management (Organigram)

### 2.1 Multi-Campus / Multi-Branch Model
Modern churches operate across multiple physical and digital locations:
1. **Global Headquarters / Central Campus**: Core governance, unified accounting consolidated ledger, master bylaws, global roles.
2. **Regional Campuses**: Dedicated campus pastors, local service times, localized budgets, local small group networks.
3. **Church Plants / Satellite Hubs**: Seed initiatives with restricted autonomy, monitored by central leadership.
4. **Online / Digital Campus**: Virtual community, international members, digital connection cards.

### 2.2 Interactive Visual Organigram
The Organigram module provides an interactive tree/chart visualizing the church's structural hierarchy:
- **Leadership Hierarchy**:
  - `Senior Pastor / Bishop / Board of Elders`
  - `Executive Pastors` (Spiritual Oversight, Operations, Finance)
  - `Campus Pastors & Ministry Directors` (Worship, Children/Youth, Pastoral Care, Outreach)
  - `Department Heads / Coordinators` (Production, Hospitality, Security, Sound)
  - `Small Group / Life Group Network Leaders` (Zone Leaders -> Cell Leaders)
  - `Volunteers & Ministry Servants`
- **Interactive Capabilities**:
  - **Drag-and-Drop Reorganization**: Reassign department heads or reporting relationships with automated permission recalculation.
  - **Branch-Filtered Views**: Toggle between global church view or isolated campus view.
  - **Capacity & Span of Care**: Visual indicator of how many members or volunteers each leader is currently shepherding.
  - **Export & Print**: High-resolution vector export (PDF/SVG) for board meetings and governance filings.

---

## 3. First-Time Visitors & Lead Management (Kanban CRM)

### 3.1 The Spiritual Visitor Journey
In church growth, first-time visitors are the vital "leads". Transforming a guest into an active disciple requires a structured, multi-touch pipeline:
```
[1. First Visit / QR Card] 
       ↓
[2. Welcome Contact (SMS/Call within 24h)]
       ↓
[3. Pastoral Coffee / Discovery Meeting]
       ↓
[4. Foundations / Growth Track Class]
       ↓
[5. Small Group / Life Group Integration]
       ↓
[6. Water Baptism & Ministry Partner]
```

### 3.2 Kanban Pipeline Features (Screen Reference Replicated)
- **Dynamic Columns**:
  - `NEW GUESTS (LEADS)`: Automatically populated when a guest fills a digital QR card or check-in kiosk.
  - `WELCOME CONTACTED`: Assigned shepherd has initiated SMS/WhatsApp or phone call.
  - `PASTORAL APPOINTMENT`: Scheduled face-to-face or virtual pastoral discovery session.
  - `FOUNDATIONS CLASS`: Enrolled in new believer/church membership classes.
  - `CELL GROUP PLACED`: Actively attending a localized small group.
  - `PARTNER COMMITTED`: Completed membership vows, baptized, active giver.
- **Card Metadata**:
  - Visitor Name & Photo/Initials.
  - Family / Household size (e.g. `Jane Doe + 2 kids`).
  - First visit date & time badge (`1d ago`, `3h ago`).
  - Assigned Shepherd / Minister avatar.
  - Tags: `[HOT LEAD]`, `[SALVATION DECISION]`, `[NEEDS PRAYER]`, `[YOUTH]`.
  - Pledged Giving / First offering value if recorded.
- **Detail Slide-Over Drawer**:
  - Top pipeline progress stepper with active stage highlighting and dwell-time indicator (`Been this stage for 3 days`).
  - **Automated Drip Sequences**: Trigger scheduled SMS/Email templates (+2 hours: "Thank you for joining us!", +2 days: "Pastor's welcome video", +5 days: "Join us for coffee this Sunday").
  - **Tabbed Interface**:
    - **Activity**: Chronological timeline of visits, calls, SMS deliveries, and stage shifts.
    - **Appointments**: Calendar scheduling for pastoral visits and coffees.
    - **Giving / Contributions**: First-time donation records and pledge commitments.
    - **Notes**: Confidential pastoral care notes with privacy locks.
    - **Tasks**: Checklists assigned to church hospitality teams.

---

## 4. Full-Blown Non-Profit Church Fund Accounting

### 4.1 Strict Double-Entry & Fund Accounting Foundation
Churches and non-profit organizations must adhere to fund accounting standards (FASB ASC 958 in the US and equivalent international non-profit GAAP). Funds cannot simply be treated as standard bank accounts; they require restricted vs. unrestricted categorization:
1. **Unrestricted Funds**:
   - `General Operating Fund`: Tithes, general offerings, facility maintenance, staff salaries, utilities.
2. **Temporarily Restricted Funds**:
   - `Building & Capital Campaign Fund`: Donor-designated for sanctuary expansion or property purchase.
   - `Missions Fund`: Designated for overseas missionaries and regional church plants.
   - `Youth Camp Scholarship Fund`: Designated for youth ministry events.
   - `Benevolence / Alms Fund`: Designated for vulnerable community members and emergency food aid.
3. **Permanently Restricted Funds**:
   - `Endowment Fund`: Principal is preserved; only interest earnings may be distributed.

### 4.2 Standard Church Chart of Accounts (COA)
- **1000–1999 ASSETS**:
  - 1010 Operating Checking Account (Chase / Bank of America)
  - 1020 Building Fund Savings Account
  - 1030 Petty Cash
  - 1050 Undeposited Funds (Cash & Checks from Sunday services)
  - 1500 Land & Buildings
  - 1600 Sanctuary Equipment & Instruments (Capital Assets)
  - 1700 Accumulated Depreciation
- **2000–2999 LIABILITIES**:
  - 2010 Accounts Payable (Vendor bills)
  - 2030 Payroll Liabilities (Taxes withheld)
  - 2500 Sanctuary Mortgage / Bank Loan Payable
- **3000–3999 NET ASSETS / EQUITY**:
  - 3010 General Net Assets (Unrestricted)
  - 3020 Temporarily Restricted Net Assets
  - 3030 Permanently Restricted Net Assets
- **4000–4999 REVENUES & GIVING**:
  - 4010 Tithes (General)
  - 4020 Sunday Morning Offerings
  - 4030 Building Pledges
  - 4040 Missions Giving
  - 4050 Benevolence Contributions
  - 4060 Bookshop & Cafe Sales
- **5000–5999 MINISTRY & OPERATIONAL EXPENSES**:
  - 5010 Pastoral & Staff Compensation
  - 5020 Facilities Rent & Utilities
  - 5030 Worship & AV Production Equipment
  - 5040 Children & Youth Curriculum
  - 5050 Missions Disbursements
  - 5060 Benevolence Payouts
  - 5070 Software Subscriptions & Web Services

### 4.3 Contribution & Giving Management
- **Omni-Channel Giving**:
  - Stripe / Card / Apple Pay / Google Pay.
  - ACH Direct Bank Transfers (low fee for large tithes).
  - Sunday Cash/Check physical envelope entry with batch reconciliation.
- **Pledge Campaigns**:
  - Set financial targets for building expansions or vision projects.
  - Track "Pledged vs. Realized" in real-time with donor milestone reminders.
- **End-of-Year Tax Receipts (501(c)(3) Compliant)**:
  - Automated batch generation of IRS-compliant annual charitable donation statements.
  - Member self-service portal to download tax receipts anytime.

### 4.4 Accounts Payable, Invoices & Expense Approvals
- **Purchase Orders & Requisitions**: Ministry leaders submit purchase requests with attached invoices/quotes.
- **Two-Tier Pastoral Approval Workflow**:
  - Under \$500: Department Head sign-off.
  - \$500 – \$5,000: Campus Pastor / Finance Director sign-off.
  - Over \$5,000: Senior Pastor & Board of Elders approval.
- **Vendor Management**: Keep track of audio suppliers, contractors, utility providers, and 1099 tax contractors.

### 4.5 Financial Statements & Analytics
- **Statement of Financial Position** (Balance Sheet with Net Assets breakdown).
- **Statement of Activities** (Income & Expense statement filtered by fund).
- **Cash Flow Statement**.
- **Fund Transfer Audit Log** (strict tracing of funds moved between operating and restricted funds).

---

## 5. Member Directory, Households & Small Groups

### 5.1 Member Profiles & Life Stages
- **Comprehensive Profiles**: Demographics, occupation, spiritual gifts, baptized status, salvation date, pastoral notes.
- **Household / Family Unit Modeling**:
  - Primary Contact (Head of Household).
  - Spouse & Dependents.
  - Shared family giving records or individualized giving.
  - Emergency contacts and authorized pickup adults for Children's Church.

### 5.2 Small Groups / Life Groups (Cell Ministry)
- **Group Profiles**: Name, leader, co-leader, host home address, meeting day/time, max capacity.
- **Interactive Map**: Geocoded visual map for visitors to find nearby small groups.
- **Attendance Logging**: Weekly mobile attendance report submitted by cell leaders (Number of attendees, first-time visitors, prayer requests, offering collected).
- **Curriculum & Study Guides**: Distribute weekly sermon discussion questions directly to group leaders.

---

## 6. Kanban Project & Service Management

### 6.1 Sunday Service Planning
- **Run of Service (Order of Service)**:
  - Minute-by-minute cue sheet (Pre-service countdown, Worship set [songs, keys, BPM, sheet music links], Welcome & Announcements, Tithe & Offering, Sermon, Altar Call, Post-service).
- **Volunteer Scheduling & Roster**:
  - Teams: Sound & Audio, Lighting, Camera/Broadcast, Ushers, Greeters, Kids Check-in, Parking.
  - Automated SMS/Email RSVP confirmation ("Accept" / "Decline" with substitute request).

### 6.2 Church Facility & Event Project Boards
- Drag-and-drop Kanban boards for church conferences, outreach initiatives, summer camps, and building maintenance.
- Task assignments, checklists, due dates, file attachments, and milestone dependencies.

---

## 7. Cloudinary Media Vault & Document Directory

### 7.1 Architecture & Asset Types
- **Sermon Media**: Full HD video recordings, podcast audio (MP3), presentation slides (PPT/PDF).
- **Member & Staff Avatars**: Auto-cropped, optimized face thumbnails delivered via Cloudinary URL transformations.
- **Church Documents Vault**:
  - Legal & Governance: Church Constitution, 501(c)(3) determination letters, Board meeting minutes.
  - Financials: Monthly financial statements, audit reports, vendor contracts.
  - Ministry Packs: Volunteer handbooks, child protection policies, training manuals.
- **Receipts & Invoices**: Scanned financial backup documentation tied to ledger transactions.

### 7.2 Role-Gated Access Control
- Folders with inheritance permissions:
  - `Public Resources` (Open to congregation).
  - `Volunteer Resources` (Active church volunteers).
  - `Pastoral & Leadership` (Staff and pastors).
  - `Confidential Board & Finance` (Elders and Finance Committee only).

---

## 8. Dynamic Role-Based Access Control (RBAC) & Multi-Campus Security

### 8.1 Granular Roles Matrix

| Role | Campus Scope | Member Directory | Giving & Accounting | Visitor Pipeline | Sermons & Media | Organigram |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin / Senior Pastor** | Global (All) | Full Read/Write | Full Read/Write/Approve | Full Management | Full Management | Edit / Reorganize |
| **Executive Pastor** | Global (All) | Full Read/Write | View Reports / Approve | Full Management | Full Management | View / Suggest |
| **Campus Pastor** | Assigned Campus | Campus Read/Write | View Local Budget / Requisition | Full Local Pipeline | Manage Local Media | View Local Tree |
| **Finance Director** | Global or Campus | View (No Pastoral Notes)| Full Accounting / Ledger / Tax | View Giving Only | Restricted | View Only |
| **Ministry Director** | Assigned Dept | Dept Read/Write | Submit Requisitions | Manage Dept Leads | Manage Dept Media | View Dept Tree |
| **Small Group Leader** | Assigned Group | Group Members Only | None | View Group Visitors | View Training Files | View Group Node |
| **Volunteer** | Team Assigned | Team Roster Only | None | Assigned Follow-up Tasks| View Volunteer Guides| View Only |
| **Church Member** | Self & Family | View Public Directory | View Own Giving & Tax PDF | View Public Events | View Sermons & Files | View Public Org |

---

## 9. Technical Architecture & Implementation Blueprint

### 9.1 Stack Overview
- **Runtime**: Bun / Node.js
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide/Hugeicons, Shadcn UI base components (`sidebar-07` layout).
- **Client State**: Zustand (`src/store/`) for lightweight, decoupled client state.
- **Server Cache & Sync**: TanStack Query v5 (`@tanstack/react-query`) with optimistic mutation rollbacks.
- **API Engine**: ElysiaJS inside Next.js (`src/app/api/[[...slugs]]/route.ts`) + Eden Treaty for zero-overhead, end-to-end typed RPC.
- **Database & ORM**: PostgreSQL + Drizzle ORM (`drizzle-kit` for type-safe schema migrations).
- **Storage**: Cloudinary API with signed client-side upload presets.

---

## 10. Agile Sprint Roadmap (Sprint 0 through Sprint 6)

### Sprint 0: Foundation & Core Infrastructure (Week 1–2)
- **Epic**: Repository scaffolding, Database schema definition, ElysiaJS API route layer, Zustand stores, TanStack Query provider, and Shadcn `sidebar-07` navigation layout.
- **Deliverables**:
  - Drizzle PostgreSQL schema covering Campuses, Users, Roles, Members, Accounts, Transactions, Visitors, and Documents.
  - Next.js 16 + ElysiaJS route handler with Eden Treaty typed client.
  - Shadcn `sidebar-07` component fully customized with church switcher and modular navigation.
  - UI Theme and tokens matching reference screenshots.

### Sprint 1: Multi-Branch & Visual Organigram (Week 3–4)
- **Epic**: Multi-Campus configuration and interactive drag-and-drop church organizational tree.
- **Deliverables**:
  - Campus switcher with multi-tenant scoping in Zustand.
  - Interactive Organigram tree with drag-and-drop reporting lines and role updates.
  - Span-of-care metrics and PDF/SVG export.

### Sprint 2: Visitor CRM & Leads Kanban Pipeline (Week 5–6)
- **Epic**: Guest onboarding, visual Kanban pipeline, follow-up automations, and detail slide-over.
- **Deliverables**:
  - Kanban board matching reference screenshots (columns with totals, card metrics, time elapsed).
  - Detail slide-over drawer with stage stepper, activity timeline, appointments, and notes.
  - Automated communication sequences (SMS/Email triggers).
  - Public mobile-responsive QR connection card for new visitors.

### Sprint 3: Member Directory & Small Groups (Week 7–8)
- **Epic**: Household relationship graph, member profiles, and cell group network management.
- **Deliverables**:
  - Member directory with advanced filtering (baptism, age, campus, ministry).
  - Household linking with emergency contact management.
  - Small group directory, meeting attendance logger, and interactive map.

### Sprint 4: Non-Profit Church Fund Accounting (Week 9–10)
- **Epic**: Double-entry ledger, Chart of Accounts, tithe/offering contribution tracking, and restricted fund management.
- **Deliverables**:
  - Chart of Accounts management with fund allocation (General, Missions, Building).
  - Tithe & Offering batch entry with check/cash deposit reconciliation.
  - Online giving portal (Stripe integration) and recurring schedules.
  - Automated 501(c)(3) tax receipt generation.
  - Requisition & 2-tier expense approval workflow.
  - Statement of Financial Position and Statement of Activities reports.

### Sprint 5: Project Management & Sunday Service Planner (Week 11–12)
- **Epic**: Service run-sheet builder, volunteer scheduling, and church project boards.
- **Deliverables**:
  - Service order cue sheet with song chords, song keys, and timing.
  - Volunteer scheduling with automated SMS/Email RSVP.
  - General church project Kanban boards for events and facilities.

### Sprint 6: Cloudinary Media Vault, RBAC Hardening & Launch (Week 13–14)
- **Epic**: Role-based document directory, Cloudinary media vault, security audits, and production hardening.
- **Deliverables**:
  - Cloudinary signed upload widget and media browser.
  - Role-gated document library with download controls.
  - Granular RBAC permission enforcement across all API endpoints.
  - End-to-end automated tests and production deployment guidelines.
