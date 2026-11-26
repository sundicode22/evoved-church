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
  unique,
  uniqueIndex,
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
  "first_visit",
  "welcome_call",
  "pastoral_visit",
  "foundations_class",
  "group_integration",
  "active_partner",
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
  churchEmail: varchar("church_email", { length: 255 }),
  churchPhone: varchar("church_phone", { length: 50 }),
  churchAddress: text("church_address"),
  churchCity: varchar("church_city", { length: 100 }),
  churchState: varchar("church_state", { length: 50 }),
  churchZip: varchar("church_zip", { length: 20 }),
  logoUrl: text("logo_url"),
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
  onboardingCompletedAt: timestamp("onboarding_completed_at"),
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
  // Better Auth two-factor plugin
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
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

// Better Auth organization plugin tables
export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const organizationMembers = pgTable("organization_members", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  role: text("role").default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const twoFactors = pgTable("two_factors", {
  id: text("id").primaryKey(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").notNull(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  verified: boolean("verified").default(false),
  failedVerificationCount: integer("failed_verification_count").default(0),
  lockedUntil: timestamp("locked_until"),
})

// ==========================================
// MULTI-BRANCH / CAMPUSES
// ==========================================
export const campuses = pgTable("campuses", {
  id: uuid("id").defaultRandom().primaryKey(),
  /** Better Auth organization id — tenant boundary for multi-church SaaS. */
  organizationId: text("organization_id").references(() => organizations.id),
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
// SAAS PRICING / TENANT SUBSCRIPTIONS
// ==========================================
/** Product catalog for Evolve ChMS (church SaaS), not church giving Stripe. */
export const saasPlans = pgTable("saas_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  priceMonthlyCents: integer("price_monthly_cents").default(0).notNull(),
  currencyCode: varchar("currency_code", { length: 10 }).default("USD").notNull(),
  maxLocations: integer("max_locations").default(1).notNull(),
  maxSeats: integer("max_seats").default(3).notNull(),
  features: jsonb("features").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const tenantSubscriptions = pgTable(
  "tenant_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /** Better Auth organization id (or legacy nomenclature tenant string). */
    organizationId: text("organization_id").notNull(),
    planId: uuid("plan_id")
      .references(() => saasPlans.id)
      .notNull(),
    status: varchar("status", { length: 40 }).default("active").notNull(), // trial | active | past_due | canceled
    billingInterval: varchar("billing_interval", { length: 20 }).default("month").notNull(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 120 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 120 }),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    trialEndsAt: timestamp("trial_ends_at"),
    canceledAt: timestamp("canceled_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("tenant_subscriptions_org_uidx").on(t.organizationId)]
)

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

export const householdRoleEnum = pgEnum("household_role", [
  "father",
  "mother",
  "spouse",
  "son",
  "daughter",
  "guardian",
  "head",
  "other",
])

export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  householdId: uuid("household_id").references(() => households.id),
  householdRole: householdRoleEnum("household_role"),
  personType: personTypeEnum("person_type").default("covenant_member").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  preferredName: varchar("preferred_name", { length: 100 }),
  email: varchar("email", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 50 }),
  avatarUrl: text("avatar_url"),
  recordedTitle: varchar("recorded_title", { length: 100 }), // "Reverend", "Elder", "Deacon", "Dr."
  gender: varchar("gender", { length: 30 }), // male | female | unspecified
  maritalStatus: varchar("marital_status", { length: 40 }), // single | married | widowed | divorced | separated
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  country: varchar("country", { length: 100 }).default("US"),
  occupation: varchar("occupation", { length: 150 }),
  notes: text("notes"),
  membershipDate: timestamp("membership_date"),
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
  leadNumber: varchar("lead_number", { length: 50 }).notNull(), // "#192748"
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  /** Flexible kanban column key (see kanban_columns). */
  stage: varchar("stage", { length: 80 }).default("first_visit").notNull(),
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
export const accountingFunds = pgTable(
  "accounting_funds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campusId: uuid("campus_id").references(() => campuses.id).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    type: fundTypeEnum("type").default("unrestricted").notNull(),
    budgetAmount: decimal("budget_amount", { precision: 14, scale: 2 }).default("0.00").notNull(),
    encumberedAmount: decimal("encumbered_amount", { precision: 14, scale: 2 }).default("0.00").notNull(), // Locked for approved requisitions
    expendedAmount: decimal("expended_amount", { precision: 14, scale: 2 }).default("0.00").notNull(), // Actually paid out
    balance: decimal("balance", { precision: 14, scale: 2 }).default("0.00").notNull(), // Liquid cash balance
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique("accounting_funds_campus_code_unique").on(table.campusId, table.code)]
)

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

export const chartOfAccounts = pgTable(
  "chart_of_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campusId: uuid("campus_id").references(() => campuses.id).notNull(),
    fundId: uuid("fund_id").references(() => accountingFunds.id),
    accountNumber: varchar("account_number", { length: 50 }).notNull(),
    accountName: varchar("account_name", { length: 255 }).notNull(),
    category: accountCategoryEnum("category").notNull(),
    description: text("description"),
    openingBalance: decimal("opening_balance", { precision: 14, scale: 2 }).default("0.00").notNull(),
    openingBalanceDate: timestamp("opening_balance_date"),
    connectWithFunds: boolean("connect_with_funds").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("chart_of_accounts_campus_number_unique").on(table.campusId, table.accountNumber),
  ]
)

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
  status: varchar("status", { length: 50 }).default("draft").notNull(), // draft | posted
  createdByUserId: text("created_by_user_id").references(() => users.id).notNull(),
  postedByUserId: text("posted_by_user_id").references(() => users.id),
  postedAt: timestamp("posted_at"),
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

export const givingFrequencyEnum = pgEnum("giving_frequency", ["one_time", "recurring"])
export const givingChannelEnum = pgEnum("giving_channel", ["in_person", "online"])
export const givingStatusEnum = pgEnum("giving_status", ["draft", "recorded", "posted_to_ledger"])
export const givingBatchStatusEnum = pgEnum("giving_batch_status", ["open", "archived"])
export const pledgeFrequencyEnum = pgEnum("pledge_frequency", [
  "weekly",
  "monthly",
  "yearly",
  "one_time",
])
export const pledgeStatusEnum = pgEnum("pledge_status", ["active", "completed", "cancelled"])
export const groupTypeEnum = pgEnum("group_type", ["private", "public", "team"])
export const groupMemberRoleEnum = pgEnum("group_member_role", ["leader", "member", "guest"])
export const resourceCategoryEnum = pgEnum("resource_category", ["equipment", "supply", "other"])
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
])
export const appointmentScheduleStatusEnum = pgEnum("appointment_schedule_status", [
  "open_for_bookings",
  "closed",
])
export const appointmentBookingStatusEnum = pgEnum("appointment_booking_status", [
  "upcoming",
  "completed",
  "cancelled",
])
export const announcementStatusEnum = pgEnum("announcement_status", [
  "draft",
  "scheduled",
  "posted",
])
export const blogPostStatusEnum = pgEnum("blog_post_status", ["draft", "published", "archived"])
export const formFieldTypeEnum = pgEnum("form_field_type", [
  "short_text",
  "long_text",
  "multiple_choice",
  "checkboxes",
  "email",
  "phone",
  "number",
  "date",
  "time",
])

export const givingBatches = pgTable("giving_batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  batchDate: timestamp("batch_date").notNull(),
  status: givingBatchStatusEnum("status").default("open").notNull(),
  notes: text("notes"),
  createdByUserId: text("created_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const givingPledges = pgTable("giving_pledges", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  memberId: uuid("member_id").references(() => members.id).notNull(),
  fundId: uuid("fund_id").references(() => accountingFunds.id).notNull(),
  amountTotal: decimal("amount_total", { precision: 12, scale: 2 }).notNull(),
  amountGiven: decimal("amount_given", { precision: 12, scale: 2 }).default("0.00").notNull(),
  frequency: pledgeFrequencyEnum("frequency").default("monthly").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: pledgeStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const givingContributions = pgTable("giving_contributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  memberId: uuid("member_id").references(() => members.id),
  fundId: uuid("fund_id").references(() => accountingFunds.id).notNull(),
  batchId: uuid("batch_id").references(() => givingBatches.id),
  pledgeId: uuid("pledge_id").references(() => givingPledges.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  method: givingMethodEnum("method").notNull(),
  frequency: givingFrequencyEnum("frequency").default("one_time").notNull(),
  channel: givingChannelEnum("channel").default("in_person").notNull(),
  status: givingStatusEnum("status").default("recorded").notNull(),
  journalEntryId: uuid("journal_entry_id").references(() => journalEntries.id),
  donorDisplayName: varchar("donor_display_name", { length: 255 }),
  notes: text("notes"),
  transactionReference: varchar("transaction_reference", { length: 150 }),
  isTaxDeductible: boolean("is_tax_deductible").default(true).notNull(),
  contributionDate: timestamp("contribution_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const ministryGroups = pgTable("ministry_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: groupTypeEnum("type").default("public").notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  leaderMemberId: uuid("leader_member_id").references(() => members.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const groupMemberships = pgTable("group_memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id")
    .references(() => ministryGroups.id, { onDelete: "cascade" })
    .notNull(),
  memberId: uuid("member_id")
    .references(() => members.id, { onDelete: "cascade" })
    .notNull(),
  role: groupMemberRoleEnum("role").default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
})

export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  capacity: integer("capacity"),
  locationNote: text("location_note"),
  requiresApproval: boolean("requires_approval").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const resources = pgTable("resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: resourceCategoryEnum("category").default("equipment").notNull(),
  description: text("description"),
  quantity: integer("quantity").default(1).notNull(),
  requiresApproval: boolean("requires_approval").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const appointmentSchedules = pgTable("appointment_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerUserId: text("owner_user_id").references(() => users.id),
  ownerDisplayName: varchar("owner_display_name", { length: 255 }),
  durationMinutes: integer("duration_minutes").default(30).notNull(),
  windowStart: timestamp("window_start").notNull(),
  windowEnd: timestamp("window_end").notNull(),
  status: appointmentScheduleStatusEnum("status").default("open_for_bookings").notNull(),
  bookingUrlSlug: varchar("booking_url_slug", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const appointmentBookings = pgTable("appointment_bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  scheduleId: uuid("schedule_id")
    .references(() => appointmentSchedules.id, { onDelete: "cascade" })
    .notNull(),
  guestName: varchar("guest_name", { length: 255 }).notNull(),
  guestEmail: varchar("guest_email", { length: 255 }),
  memberId: uuid("member_id").references(() => members.id),
  startsAt: timestamp("starts_at").notNull(),
  status: appointmentBookingStatusEnum("status").default("upcoming").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const followUps = pgTable("follow_ups", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  relatedMemberId: uuid("related_member_id").references(() => members.id),
  relatedLeadId: uuid("related_lead_id").references(() => visitorLeads.id),
  assignedToUserId: text("assigned_to_user_id").references(() => users.id),
  dueAt: timestamp("due_at"),
  status: varchar("status", { length: 50 }).default("open").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const announcements = pgTable("announcements", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id),
  title: varchar("title", { length: 255 }).notNull(),
  bodyHtml: text("body_html").notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  status: announcementStatusEnum("status").default("draft").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  postedAt: timestamp("posted_at"),
  postedByUserId: text("posted_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const dripSequences = pgTable("drip_sequences", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id),
  name: varchar("name", { length: 255 }).notNull(),
  triggerEvent: varchar("trigger_event", { length: 100 }).default("first_visit").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const dripSteps = pgTable("drip_steps", {
  id: uuid("id").defaultRandom().primaryKey(),
  sequenceId: uuid("sequence_id")
    .references(() => dripSequences.id, { onDelete: "cascade" })
    .notNull(),
  stepOrder: integer("step_order").default(1).notNull(),
  delayHours: integer("delay_hours").default(2).notNull(),
  channel: varchar("channel", { length: 20 }).default("email").notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
})

export const dripEnrollments = pgTable("drip_enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  sequenceId: uuid("sequence_id")
    .references(() => dripSequences.id, { onDelete: "cascade" })
    .notNull(),
  leadId: uuid("lead_id").references(() => visitorLeads.id),
  memberId: uuid("member_id").references(() => members.id),
  currentStep: integer("current_step").default(0).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
})

export const churchForms = pgTable("church_forms", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  description: text("description"),
  /** general | visitor_intake — visitor_intake submissions create visitor leads */
  purpose: varchar("purpose", { length: 40 }).default("general").notNull(),
  status: varchar("status", { length: 30 }).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const churchFormFields = pgTable("church_form_fields", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id")
    .references(() => churchForms.id, { onDelete: "cascade" })
    .notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  fieldType: formFieldTypeEnum("field_type").default("short_text").notNull(),
  required: boolean("required").default(false).notNull(),
  options: jsonb("options").$type<string[]>().default([]),
  orderIndex: integer("order_index").default(0).notNull(),
})

export const churchFormSubmissions = pgTable("church_form_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id")
    .references(() => churchForms.id, { onDelete: "cascade" })
    .notNull(),
  answers: jsonb("answers").$type<Record<string, unknown>>().default({}),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
})

/** Member-facing blog / stories with cover image + rich HTML body. */
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  excerpt: text("excerpt"),
  coverImageUrl: text("cover_image_url"),
  bodyHtml: text("body_html").notNull(),
  authorName: varchar("author_name", { length: 150 }),
  status: blogPostStatusEnum("status").default("draft").notNull(),
  publishedAt: timestamp("published_at"),
  createdByUserId: text("created_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ==========================================
// BUDGET LINES (per fund / fiscal period)
// ==========================================
export const budgetLines = pgTable("budget_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  fundId: uuid("fund_id").references(() => accountingFunds.id).notNull(),
  accountId: uuid("account_id").references(() => chartOfAccounts.id),
  fiscalYear: integer("fiscal_year").notNull(),
  department: varchar("department", { length: 150 }),
  label: varchar("label", { length: 255 }).notNull(),
  allocatedAmount: decimal("allocated_amount", { precision: 14, scale: 2 }).default("0.00").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ==========================================
// CHURCH POLICIES (module-scoped, rich HTML body)
// ==========================================
export const churchPolicies = pgTable("church_policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id),
  title: varchar("title", { length: 255 }).notNull(),
  module: varchar("module", { length: 50 }).notNull(), // accounting | visitors | safety…
  summary: text("summary"),
  bodyHtml: text("body_html").notNull(),
  status: varchar("status", { length: 30 }).default("draft").notNull(), // draft | published | archived
  version: integer("version").default(1).notNull(),
  updatedByUserId: text("updated_by_user_id").references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// ==========================================
// DYNAMIC RBAC (roles + permissions — never stored in cookies)
// ==========================================
export const appRoles = pgTable("app_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  isSystem: boolean("is_system").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(), // wildcard: all permissions
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const appPermissions = pgTable("app_permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 150 }).notNull().unique(), // e.g. accounting.journal.post
  label: varchar("label", { length: 255 }).notNull(),
  groupName: varchar("group_name", { length: 100 }).notNull(), // Visitors, Members, Accounting…
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const rolePermissions = pgTable("role_permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  roleId: uuid("role_id")
    .references(() => appRoles.id, { onDelete: "cascade" })
    .notNull(),
  permissionId: uuid("permission_id")
    .references(() => appPermissions.id, { onDelete: "cascade" })
    .notNull(),
})

export const userRoles = pgTable("user_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  roleId: uuid("role_id")
    .references(() => appRoles.id, { onDelete: "cascade" })
    .notNull(),
  campusId: uuid("campus_id").references(() => campuses.id), // optional location scope
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ==========================================
// CAMPAIGNS CMS (email + SMS)
// ==========================================
export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id),
  name: varchar("name", { length: 255 }).notNull(),
  channel: varchar("channel", { length: 20 }).default("email").notNull(), // email | sms | both
  status: varchar("status", { length: 30 }).default("draft").notNull(), // draft | scheduled | sending | sent
  subject: varchar("subject", { length: 255 }),
  emailBody: text("email_body"),
  smsBody: text("sms_body"),
  audienceFilter: jsonb("audience_filter").$type<Record<string, unknown>>().default({}),
  scheduleAt: timestamp("schedule_at"),
  createdByUserId: text("created_by_user_id").references(() => users.id),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const campaignSends = pgTable("campaign_sends", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id")
    .references(() => campaigns.id, { onDelete: "cascade" })
    .notNull(),
  recipientName: varchar("recipient_name", { length: 255 }),
  recipientEmail: varchar("recipient_email", { length: 255 }),
  recipientPhone: varchar("recipient_phone", { length: 50 }),
  channel: varchar("channel", { length: 20 }).notNull(),
  status: varchar("status", { length: 30 }).default("queued").notNull(),
  providerId: varchar("provider_id", { length: 150 }),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ==========================================
// FLEXIBLE KANBAN COLUMNS (visitors + projects)
// ==========================================
export const kanbanColumns = pgTable(
  "kanban_columns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    boardType: varchar("board_type", { length: 40 }).notNull(),
    key: varchar("key", { length: 80 }).notNull(),
    label: varchar("label", { length: 120 }).notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    color: varchar("color", { length: 40 }),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("kanban_columns_board_key_uidx").on(t.boardType, t.key)]
)

// ==========================================
// PROJECTS KANBAN
// ==========================================
export const projectStageEnum = pgEnum("project_stage", [
  "backlog",
  "in_progress",
  "review",
  "done",
])

export const projectCards = pgTable("project_cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  /** Flexible kanban column key (see kanban_columns). */
  stage: varchar("stage", { length: 80 }).default("backlog").notNull(),
  priority: varchar("priority", { length: 30 }).default("normal").notNull(),
  assigneeName: varchar("assignee_name", { length: 150 }),
  projectName: varchar("project_name", { length: 255 }),
  dueLabel: varchar("due_label", { length: 100 }),
  orderIndex: integer("order_index").default(0).notNull(),
  stageChangedAt: timestamp("stage_changed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ==========================================
// MULTI-SERVICE DEFINITIONS (not Sunday-only)
// ==========================================
export const serviceTypeEnum = pgEnum("service_type", [
  "sunday_worship",
  "midweek",
  "prayer",
  "youth",
  "kids",
  "special",
  "other",
])

export const serviceDefinitions = pgTable("service_definitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id),
  name: varchar("name", { length: 255 }).notNull(),
  type: serviceTypeEnum("type").default("sunday_worship").notNull(),
  locationLabel: varchar("location_label", { length: 255 }),
  defaultDayOfWeek: integer("default_day_of_week"), // 0=Sun … 6=Sat
  defaultStartTime: varchar("default_start_time", { length: 10 }), // HH:mm
  recurrence: varchar("recurrence", { length: 50 }).default("weekly").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const serviceSegments = pgTable("service_segments", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceId: uuid("service_id")
    .references(() => serviceDefinitions.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  leader: varchar("leader", { length: 255 }),
  durationMinutes: integer("duration_minutes").default(10).notNull(),
  details: text("details"),
  orderIndex: integer("order_index").default(0).notNull(),
})

export const serviceVolunteerSlots = pgTable("service_volunteer_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceId: uuid("service_id")
    .references(() => serviceDefinitions.id, { onDelete: "cascade" })
    .notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  assigneeName: varchar("assignee_name", { length: 255 }),
  status: varchar("status", { length: 50 }).default("needed").notNull(),
  orderIndex: integer("order_index").default(0).notNull(),
})

// ==========================================
// CHURCH CALENDAR — programs / occurrences / assignees
// ==========================================
export const churchPrograms = pgTable("church_programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).default("ministry").notNull(),
  description: text("description"),
  locationLabel: varchar("location_label", { length: 255 }),
  serviceId: uuid("service_id").references(() => serviceDefinitions.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const programOccurrences = pgTable("program_occurrences", {
  id: uuid("id").defaultRandom().primaryKey(),
  programId: uuid("program_id")
    .references(() => churchPrograms.id, { onDelete: "cascade" })
    .notNull(),
  campusId: uuid("campus_id").references(() => campuses.id),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),
  allDay: boolean("all_day").default(false).notNull(),
  status: varchar("status", { length: 30 }).default("scheduled").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const programAssignees = pgTable("program_assignees", {
  id: uuid("id").defaultRandom().primaryKey(),
  occurrenceId: uuid("occurrence_id")
    .references(() => programOccurrences.id, { onDelete: "cascade" })
    .notNull(),
  memberId: uuid("member_id").references(() => members.id),
  userId: text("user_id").references(() => users.id),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  roleLabel: varchar("role_label", { length: 50 }).default("volunteer").notNull(), // lead | volunteer | speaker
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const roomBookings = pgTable("room_bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: uuid("room_id")
    .references(() => rooms.id, { onDelete: "cascade" })
    .notNull(),
  occurrenceId: uuid("occurrence_id").references(() => programOccurrences.id),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  requestedByUserId: text("requested_by_user_id").references(() => users.id),
  status: bookingStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const resourceBookings = pgTable("resource_bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  resourceId: uuid("resource_id")
    .references(() => resources.id, { onDelete: "cascade" })
    .notNull(),
  occurrenceId: uuid("occurrence_id").references(() => programOccurrences.id),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  requestedByUserId: text("requested_by_user_id").references(() => users.id),
  status: bookingStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/** Immutable activity trail for compliance / FP audit. */
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id),
  actorUserId: text("actor_user_id").references(() => users.id),
  actorName: varchar("actor_name", { length: 255 }),
  action: varchar("action", { length: 100 }).notNull(), // e.g. ledger.post, member.create
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }),
  summary: text("summary").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
