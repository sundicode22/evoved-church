# Bug / polish list

## Fixed
- [x] Google OAuth schema mismatch
- [x] Auth Sonner + password show/hide + Suspense for search params
- [x] Lucide icons (Hugeicons removed)
- [x] Sidebar-07 dropdown location + user
- [x] Visitors / Projects table-first + column customize
- [x] Members / Giving / Campaigns use `TablePanel`
- [x] Canvas `#f4f6f5` unified; **shadows minimized** (`shadow-xs` default)
- [x] Onboarding: nomenclature + campus create API + invite queue
- [x] Smoke CSV fixtures complete (11/11 pass)
- [x] Settings `POST /invites` stub

## Still open (non-blocking)
- [ ] Wire full Add Visitor / Add Person create sheets end-to-end
- [ ] Groups page: same TablePanel + column customize pattern
- [ ] Invite emails actually sent via Resend when `RESEND_API_KEY` set
- [ ] Metadata still says “visitor CRM” (copy polish only)

## Design defaults
- Shadows: **minimal** (`shadow-xs` / border) — no heavy elevation
- Accent: `#16a34a` / `#22c55e`
- Active nav: `#eaf5ea` + `#1b5e20`
- Tables first; board optional
- Lucide stroke ~1.75
