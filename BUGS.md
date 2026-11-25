# Bug / polish list

## Fixed
- [x] Google OAuth schema mismatch
- [x] Auth Sonner + password show/hide + Suspense for search params
- [x] Lucide icons (Hugeicons removed)
- [x] Sidebar-07 dropdown location + user
- [x] Visitors / Projects table-first + column customize
- [x] Members / Giving / Campaigns use `TablePanel`
- [x] Canvas unified; **shadows minimized** (`shadow-xs` default)
- [x] Onboarding: nomenclature + campus create API + invite queue + Location wording + redirect gates
- [x] Smoke CSV fixtures complete (11/11 pass)
- [x] Settings `POST /invites` stub (+ Resend when keyed)
- [x] Groups / Giving / Batches / Pledges / Funds live (Sheets + Zod)
- [x] Custom fields + Locations Settings tabs
- [x] Write-to-books fund balance bump on journal post

## Still open (non-blocking)
- [ ] Wire full Add Visitor / Add Person create sheets end-to-end (partial)
- [ ] Native mobile app / drag-drop website studio (out of v1)
- [ ] Full Stripe Payment Element checkout (stub activate only)
- [ ] Metadata still says “visitor CRM” (copy polish only)

## Design defaults
- Shadows: **minimal** (`shadow-xs` / border) — no heavy elevation
- Primary: `#6495ed` / `#4f7fd4` (chrome, links)
- Accent CTA: `#16a34a` / `#15803d` (call buttons)
- Active nav: `#eef3fc` + `#2b4c8c`
- Creates/edits: **inset Sheets** + Field/FieldGroup + Zod only
- Tables first; board optional
- Lucide stroke ~1.75
