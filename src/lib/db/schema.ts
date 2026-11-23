import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
  decimal,
  integer,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ==========================================
// ENUMS
// ==========================================
export const personTypeEnum = pgEnum("person_type", [
  "visitor",            // 1st time newcomer / lead
  "prospect",           // 2nd/3rd time guest in follow-up
  "regular_attender",   // Attends regularly, non-member
  "covenant_member",    // Fully confirmed covenant member
  "volunteer",          // Active serving volunteer
  "leader",             // Small group / team leader
  "staff_minister",     // Ordained pastoral / ministry staff
  "donor_only",         // Financial partner without local attendance
  "inactive_alumni",    // Moved, relocated, or transferred
])

export const campusTypeEnum = pgEnum("campus_type", [
  "main",
  "regional",
  "satellite",
  "church_plant",
  "online",
])

export const visitorStageEnum = pgEnum("visitor_stage", [
  "new_leads",
  "request_received",
  "in_draft",
  "proposal_sent",
  "approved",
  "rejected",
  "integrated_member",
])

export const fundTypeEnum = pgEnum("fund_type", [
  "unrestricted",
  "temporarily_restricted",
  "permanently_restricted",
])

export const accountCategoryEnum = pgEnum("account_category", [
  "asset",
  "liability",
  "net_assets",
  "revenue",
  "expense",
])

export const approvalStatusEnum = pgEnum("approval_status", [
  "draft",
  "pending_tier_1",
  "pending_tier_2",
  "pending_tier_3",
  "approved",
  "rejected",
  "disbursed",
])

export const givingMethodEnum = pgEnum("giving_method", [
  "card",
  "ach_bank",
  "cash_envelope",
  "check",
  "crypto",
])

// ==========================================
// TENANT / CHURCH SETTINGS & NOMENCLATURE
// ==========================================
// Allows churches to dynamically rename terms (e.g. "Members" -> "Parishioners", "Small Groups" -> "Cells")
export const tenantNomenclatures = pgTable("tenant_nomenclatures", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: varchar("tenant_id", { length: 100 }).notNull().unique(), // Church domain / ID
  churchName: varchar("church_name", { length: 255 }).default("Evolve Church").notNull(),
  memberTermSingular: varchar("member_term_singular", { length: 100 }).default("Member").notNull(), // "Partner", "Parishioner", "Disciple"
  memberTermPlural: varchar("member_term_plural", { length: 100 }).default("Members").notNull(),
  visitorTermSingular: varchar("visitor_term_singular", { length: 100 }).default("First-Time Guest").notNull(),
  visitorTermPlural: varchar("visitor_term_plural", { length: 100 }).default("First-Time Guests").notNull(),
  groupTermSingular: varchar("group_term_singular", { length: 100 }).default("Small Group").notNull(), // "Life Group", "Cell", "Connect Group"
  groupTermPlural: varchar("group_term_plural", { length: 100 }).default("Small Groups").notNull(),
  campusTermSingular: varchar("campus_term_singular", { length: 100 }).default("Campus").notNull(), // "Branch", "Parish", "Assembly"
  campusTermPlural: varchar("campus_term_plural", { length: 100 }).default("Campuses").notNull(),
  pastorTermSingular: varchar("pastor_term_singular", { length: 100 }).default("Pastor").notNull(), // "Minister", "Priest", "Elder"
  givingTerm: varchar("giving_term", { length: 100 }).default("Tithes & Offerings").notNull(), // "Stewardship", "First Fruits"
  currencyCode: varchar("currency_code", { length: 10 }).default("USD").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ==========================================
// DYNAMIC USER CATEGORIES / ROLES
// ==========================================
// Churches dynamically create categories of people with custom badges, permissions & pastoral notes
export const userCategories = pgTable("user_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // "Covenant Partner", "Elder", "Youth", "VIP Guest", "Deacon"
  slug: varchar("slug", { length: 100 }).notNull(),
  badgeColor: varchar("badge_color", { length: 50 }).default("emerald").notNull(), // Tailwind color badge
  description: text("description"),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  isSystem: boolean("is_system").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ==========================================
// DYNAMIC CUSTOM FIELDS ENGINE
// ==========================================
// Allows arbitrary user-defined metadata per entity (Members, Visitors, Groups, Transactions)
export const customFieldDefinitions = pgTable("custom_field_definitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: varchar("tenant_id", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // "member", "visitor", "group", "donation"
  fieldKey: varchar("field_key", { length: 100 }).notNull(), // e.g. "spiritual_gifts", "t_shirt_size"
  fieldLabel: varchar("field_label", { length: 255 }).notNull(),
  fieldType: varchar("field_type", { length: 50 }).notNull(), // "text", "number", "date", "boolean", "select", "multi_select"
  options: jsonb("options").$type<string[]>(), // Dropdown choices
  isRequired: boolean("is_required").default(false).notNull(),
  isConfidential: boolean("is_confidential").default(false).notNull(), // E.g. pastoral care or counseling only
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const customFieldValues = pgTable("custom_field_values", {
  id: uuid("id").defaultRandom().primaryKey(),
  fieldDefinitionId: uuid("field_definition_id").references(() => customFieldDefinitions.id).notNull(),
  entityId: uuid("entity_id").notNull(), // ID of member, visitor, etc.
  valueText: text("value_text"),
  valueNumber: decimal("value_number", { precision: 14, scale: 4 }),
  valueDate: timestamp("value_date"),
  valueBoolean: boolean("value_boolean"),
  valueJson: jsonb("value_json"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ==========================================
// BETTER AUTH CORE TABLES
// ==========================================
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Extended ChMS fields
  campusId: uuid("campus_id"),
  role: text("role").default("member").notNull(),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
})

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").references(() => users.id).notNull(),
  activeOrganizationId: text("active_organization_id"),
})

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// ==========================================
// MULTI-BRANCH / CAMPUSES
// ==========================================
export const campuses = pgTable("campuses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  type: campusTypeEnum("type").default("regional").notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  country: varchar("country", { length: 50 }).default("US"),
  phoneNumber: varchar("phone_number", { length: 50 }),
  email: varchar("email", { length: 150 }),
  isMainCampus: boolean("is_main_campus").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ==========================================
// ORGANIGRAM NODES (DYNAMIC REPORTING TREE)
// ==========================================
export const organigramNodes = pgTable("organigram_nodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id),
  userId: text("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(), // "Senior Pastor", "Worship Director"
  department: varchar("department", { length: 100 }).notNull(),
  parentId: uuid("parent_id"), // Drag & drop parent
  orderIndex: integer("order_index").default(0).notNull(),
  spanOfCareCount: integer("span_of_care_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ==========================================
// PEOPLE & MEMBERS (EXPLICIT DISTINCTION)
// ==========================================
export const households = pgTable("households", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(), // "The Cooper Household"
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  householdId: uuid("household_id").references(() => households.id),
  personType: personTypeEnum("person_type").default("covenant_member").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 50 }),
  avatarUrl: text("avatar_url"),
  recordedTitle: varchar("recorded_title", { length: 100 }), // "Reverend", "Elder", "Deacon", "Dr."
  ministryRoles: jsonb("ministry_roles").$type<string[]>().default([]), // ["Worship Team", "Youth Mentor"]
  isHeadOfHousehold: boolean("is_head_of_household").default(false).notNull(),
  birthDate: timestamp("birth_date"),
  envelopeNumber: varchar("envelope_number", { length: 50 }),
  // Milestones & Spiritual Records
  salvationDate: timestamp("salvation_date"),
  baptismDate: timestamp("baptism_date"),
  baptismOfficiant: varchar("baptism_officiant", { length: 150 }),
  confirmationDate: timestamp("confirmation_date"),
  ordinationDate: timestamp("ordination_date"),
  ordinationCredentials: text("ordination_credentials"),
  // Background check for working with children & youth
  backgroundCheckStatus: varchar("background_check_status", { length: 50 }).default("none"), // "cleared", "pending", "expired"
  backgroundCheckExpiresAt: timestamp("background_check_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
})

// ==========================================
// QR CODE CHECK-IN & ATTENDANCE SESSIONS
// ==========================================
export const attendanceSessions = pgTable("attendance_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  sessionName: varchar("session_name", { length: 255 }).notNull(), // "Sunday 10:00 AM Main Service"
  sessionDate: timestamp("session_date").notNull(),
  sessionType: varchar("session_type", { length: 50 }).default("service").notNull(), // "service", "kids", "youth", "class"
  qrToken: varchar("qr_token", { length: 100 }).notNull().unique(), // Scannable QR token
  headcountAdults: integer("headcount_adults").default(0).notNull(),
  headcountChildren: integer("headcount_children").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const childCheckinBadges = pgTable("child_checkin_badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").references(() => attendanceSessions.id).notNull(),
  childMemberId: uuid("child_member_id").references(() => members.id).notNull(),
  guardianMemberId: uuid("guardian_member_id").references(() => members.id).notNull(),
  securityPickupCode: varchar("security_pickup_code", { length: 20 }).notNull(), // Matching 4-character code
  allergies: text("allergies"),
  specialNeeds: text("special_needs"),
  isCheckedOut: boolean("is_checked_out").default(false).notNull(),
  checkedInAt: timestamp("checked_in_at").defaultNow().notNull(),
  checkedOutAt: timestamp("checked_out_at"),
})

// ==========================================
// VISITOR & LEADS CRM PIPELINE
// ==========================================
export const visitorLeads = pgTable("visitor_leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  dealNumber: varchar("deal_number", { length: 50 }).notNull(), // "#192748"
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  stage: visitorStageEnum("stage").default("new_leads").notNull(),
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  source: varchar("source", { length: 100 }), // "QR Check-in", "Sunday Kiosk", "Friend"
  value: decimal("value", { precision: 12, scale: 2 }).default("0.00").notNull(),
  assignedToUserId: text("assigned_to_user_id").references(() => users.id),
  tags: jsonb("tags").$type<string[]>().default([]),
  activeSequence: varchar("active_sequence", { length: 150 }).default("Welcome Drip Sequence"),
  nextDripAction: varchar("next_drip_action", { length: 255 }),
  stageChangedAt: timestamp("stage_changed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const visitorActivities = pgTable("visitor_activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").references(() => visitorLeads.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  performedByUserId: text("performed_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const visitorAppointments = pgTable("visitor_appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").references(() => visitorLeads.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  startTime: varchar("start_time", { length: 20 }),
  endTime: varchar("end_time", { length: 20 }),
  location: text("location"),
  assignedStaffId: text("assigned_staff_id").references(() => users.id),
  status: varchar("status", { length: 50 }).default("scheduled"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ==========================================
// DYNAMIC FUND ACCOUNTING & EXPENSE CONTROLS
// ==========================================
export const accountingFunds = pgTable("accounting_funds", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  type: fundTypeEnum("type").default("unrestricted").notNull(),
  budgetAmount: decimal("budget_amount", { precision: 14, scale: 2 }).default("0.00").notNull(),
  encumberedAmount: decimal("encumbered_amount", { precision: 14, scale: 2 }).default("0.00").notNull(), // Locked for approved requisitions
  expendedAmount: decimal("expended_amount", { precision: 14, scale: 2 }).default("0.00").notNull(), // Actually paid out
  balance: decimal("balance", { precision: 14, scale: 2 }).default("0.00").notNull(), // Liquid cash balance
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const fundTransfers = pgTable("fund_transfers", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  fromFundId: uuid("from_fund_id").references(() => accountingFunds.id).notNull(),
  toFundId: uuid("to_fund_id").references(() => accountingFunds.id).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  transferReason: text("transfer_reason").notNull(),
  authorizedByUserId: text("authorized_by_user_id").references(() => users.id).notNull(),
  transferDate: timestamp("transfer_date").defaultNow().notNull(),
})

export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  fundId: uuid("fund_id").references(() => accountingFunds.id),
  accountNumber: varchar("account_number", { length: 50 }).notNull().unique(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  category: accountCategoryEnum("category").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const expenseApprovalRules = pgTable("expense_approval_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  tierLevel: integer("tier_level").notNull(), // 1, 2, 3, 4
  minAmount: decimal("min_amount", { precision: 12, scale: 2 }).notNull(),
  maxAmount: decimal("max_amount", { precision: 12, scale: 2 }).notNull(),
  requiredRole: varchar("required_role", { length: 100 }).notNull(), // "department_head", "campus_pastor", "finance_director", "board"
  description: text("description"),
})

export const expenseRequisitions = pgTable("expense_requisitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  requisitionNumber: varchar("requisition_number", { length: 50 }).notNull().unique(),
  requestedByUserId: text("requested_by_user_id").references(() => users.id).notNull(),
  fundId: uuid("fund_id").references(() => accountingFunds.id).notNull(),
  accountId: uuid("account_id").references(() => chartOfAccounts.id).notNull(),
  vendorName: varchar("vendor_name", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  receiptUrl: text("receipt_url"), // Cloudinary URL
  status: approvalStatusEnum("status").default("draft").notNull(),
  currentTierLevel: integer("current_tier_level").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const expenseApprovals = pgTable("expense_approvals", {
  id: uuid("id").defaultRandom().primaryKey(),
  requisitionId: uuid("requisition_id").references(() => expenseRequisitions.id).notNull(),
  approverUserId: text("approver_user_id").references(() => users.id).notNull(),
  tierLevel: integer("tier_level").notNull(),
  decision: varchar("decision", { length: 50 }).notNull(), // "approved", "rejected", "requested_revision"
  comments: text("comments"),
  decidedAt: timestamp("decided_at").defaultNow().notNull(),
})

export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  entryNumber: varchar("entry_number", { length: 50 }).notNull().unique(),
  entryDate: timestamp("entry_date").notNull(),
  memo: text("memo").notNull(),
  status: varchar("status", { length: 50 }).default("draft").notNull(),
  approvedByUserId: text("approved_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const journalLines = pgTable("journal_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  journalEntryId: uuid("journal_entry_id").references(() => journalEntries.id).notNull(),
  accountId: uuid("account_id").references(() => chartOfAccounts.id).notNull(),
  fundId: uuid("fund_id").references(() => accountingFunds.id).notNull(),
  debit: decimal("debit", { precision: 14, scale: 2 }).default("0.00").notNull(),
  credit: decimal("credit", { precision: 14, scale: 2 }).default("0.00").notNull(),
  memo: text("memo"),
})

export const givingContributions = pgTable("giving_contributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  memberId: uuid("member_id").references(() => members.id),
  fundId: uuid("fund_id").references(() => accountingFunds.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  method: givingMethodEnum("method").notNull(),
  transactionReference: varchar("transaction_reference", { length: 150 }),
  isTaxDeductible: boolean("is_tax_deductible").default(true).notNull(),
  contributionDate: timestamp("contribution_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ==========================================
// DOCUMENTS & MEDIA VAULT (CLOUDINARY)
// ==========================================
export const documentFolders = pgTable("document_folders", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id),
  name: varchar("name", { length: 255 }).notNull(),
  parentId: uuid("parent_id"),
  minRoleRequired: varchar("min_role_required", { length: 50 }).default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const churchDocuments = pgTable("church_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  folderId: uuid("folder_id").references(() => documentFolders.id),
  campusId: uuid("campus_id").references(() => campuses.id),
  uploadedByUserId: text("uploaded_by_user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  cloudinaryPublicId: text("cloudinary_public_id").notNull(),
  cloudinaryUrl: text("cloudinary_url").notNull(),
  format: varchar("format", { length: 20 }),
  fileSizeBytes: integer("file_size_bytes"),
  minRoleRequired: varchar("min_role_required", { length: 50 }).default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
