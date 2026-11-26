/**
 * Canonical permission keys for Evolve ChMS.
 * Stored in DB as app_permissions; admin role bypasses all checks.
 */
export const PERMISSION_CATALOG = [
  // Visitors / leads
  { key: "visitors.read", label: "View visitor pipeline", groupName: "Visitors" },
  { key: "visitors.write", label: "Create & edit visitors", groupName: "Visitors" },
  { key: "visitors.stage", label: "Move visitor stages", groupName: "Visitors" },
  // Members
  { key: "members.read", label: "View church members", groupName: "Members" },
  { key: "members.write", label: "Edit members & households", groupName: "Members" },
  { key: "members.lifecycle", label: "Change person lifecycle", groupName: "Members" },
  // Groups
  { key: "groups.read", label: "View groups", groupName: "Groups" },
  { key: "groups.write", label: "Manage groups & rosters", groupName: "Groups" },
  // Accounting
  { key: "accounting.read", label: "View funds & requisitions", groupName: "Accounting" },
  { key: "accounting.requisitions", label: "Create & approve expenses", groupName: "Accounting" },
  { key: "accounting.journal.post", label: "Post journal entries", groupName: "Accounting" },
  { key: "accounting.transfers", label: "Authorize fund transfers", groupName: "Accounting" },
  { key: "accounting.budgets", label: "Manage budget lines", groupName: "Accounting" },
  // Policies
  { key: "policies.read", label: "View church policies", groupName: "Policies" },
  { key: "policies.write", label: "Create & edit policies", groupName: "Policies" },
  { key: "policies.publish", label: "Publish policies", groupName: "Policies" },
  // Campaigns
  { key: "campaigns.read", label: "View campaigns", groupName: "Campaigns" },
  { key: "campaigns.write", label: "Create & edit campaigns", groupName: "Campaigns" },
  { key: "campaigns.send", label: "Send email / SMS campaigns", groupName: "Campaigns" },
  // Projects
  { key: "projects.read", label: "View projects board", groupName: "Projects" },
  { key: "projects.write", label: "Manage project cards", groupName: "Projects" },
  // Documents
  { key: "documents.read", label: "View documents", groupName: "Documents" },
  { key: "documents.write", label: "Upload & manage documents", groupName: "Documents" },
  // Reports
  { key: "reports.read", label: "View financial & ministry reports", groupName: "Reports" },
  // Organigram / services
  { key: "organigram.read", label: "View organigram", groupName: "Structure" },
  { key: "organigram.write", label: "Edit organigram", groupName: "Structure" },
  { key: "services.read", label: "View church services", groupName: "Services" },
  { key: "services.write", label: "Edit services & run sheets", groupName: "Services" },
  // Calendar
  { key: "calendar.read", label: "View church calendar", groupName: "Calendar" },
  { key: "calendar.write", label: "Manage programs & assignees", groupName: "Calendar" },
  // Facilities
  { key: "facilities.read", label: "View rooms & resources", groupName: "Facilities" },
  { key: "facilities.write", label: "Manage rooms & resources", groupName: "Facilities" },
  // Appointments / follow-ups
  { key: "appointments.read", label: "View appointment schedules", groupName: "Appointments" },
  { key: "appointments.write", label: "Manage appointment schedules", groupName: "Appointments" },
  { key: "followups.read", label: "View follow-ups", groupName: "Follow-ups" },
  { key: "followups.write", label: "Manage follow-ups", groupName: "Follow-ups" },
  // Attendance
  { key: "attendance.read", label: "View attendance sessions", groupName: "Attendance" },
  { key: "attendance.write", label: "Manage check-in sessions", groupName: "Attendance" },
  // Announcements / forms
  { key: "announcements.read", label: "View announcements", groupName: "Announcements" },
  { key: "announcements.write", label: "Create & post announcements", groupName: "Announcements" },
  { key: "blog.read", label: "View blog posts", groupName: "Blog" },
  { key: "blog.write", label: "Write & publish blog posts", groupName: "Blog" },
  { key: "forms.read", label: "View church forms", groupName: "Forms" },
  { key: "forms.write", label: "Create & publish forms", groupName: "Forms" },
  // Import / migration
  { key: "import.write", label: "Import CSV from other ChMS", groupName: "Settings" },
  // Settings
  { key: "settings.read", label: "View settings", groupName: "Settings" },
  { key: "settings.write", label: "Edit nomenclature & integrations", groupName: "Settings" },
  { key: "settings.roles", label: "Manage roles & permissions", groupName: "Settings" },
] as const

export type PermissionKey = (typeof PERMISSION_CATALOG)[number]["key"]

export const NAV_PERMISSION: Record<string, PermissionKey | PermissionKey[]> = {
  "/dashboard": "visitors.read",
  "/dashboard/visitors": "visitors.read",
  "/dashboard/appointments": "appointments.read",
  "/dashboard/follow-ups": "followups.read",
  "/dashboard/attendance": "attendance.read",
  "/dashboard/rooms": "facilities.read",
  "/dashboard/resources": "facilities.read",
  "/dashboard/sunday-services": "services.read",
  "/dashboard/services": "services.read",
  "/dashboard/calendar": "calendar.read",
  "/dashboard/tasks": "projects.read",
  "/dashboard/projects": "projects.read",
  "/dashboard/organigram": "organigram.read",
  "/dashboard/members": "members.read",
  "/dashboard/families": "members.read",
  "/dashboard/groups": "groups.read",
  "/dashboard/accounting": "accounting.read",
  "/dashboard/giving": "accounting.read",
  "/dashboard/batches": "accounting.read",
  "/dashboard/pledges": "accounting.read",
  "/dashboard/funds": "accounting.read",
  "/dashboard/documents": "documents.read",
  "/dashboard/policies": "policies.read",
  "/dashboard/communications": "campaigns.read",
  "/dashboard/campaigns": "campaigns.read",
  "/dashboard/announcements": "announcements.read",
  "/dashboard/blog": "blog.read",
  "/dashboard/forms": "forms.read",
  "/dashboard/metrics": "reports.read",
  "/dashboard/reports": "reports.read",
  "/dashboard/settings": "settings.read",
}
