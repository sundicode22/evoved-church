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
export const roleTypeEnum = pgEnum("role_type", [
  "super_admin",
  "senior_pastor",
  "executive_pastor",
  "campus_pastor",
  "finance_director",
  "ministry_director",
  "small_group_leader",
  "volunteer",
  "member",
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

export const transactionStatusEnum = pgEnum("transaction_status", [
  "draft",
  "pending_approval",
  "posted",
  "voided",
])

export const givingMethodEnum = pgEnum("giving_method", [
  "card",
  "ach_bank",
  "cash_envelope",
  "check",
  "crypto",
])

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
// USERS & RBAC
// ==========================================
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  avatarUrl: text("avatar_url"),
  role: roleTypeEnum("role").default("member").notNull(),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ==========================================
// ORGANIGRAM NODES (ORGANIZATION HIERARCHY)
// ==========================================
export const organigramNodes = pgTable("organigram_nodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id),
  userId: uuid("user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(), // e.g. "Senior Pastor", "Worship Director"
  department: varchar("department", { length: 100 }).notNull(), // e.g. "Pastoral", "Creative Arts"
  parentId: uuid("parent_id"), // Self-referencing reporting line
  orderIndex: integer("order_index").default(0).notNull(),
  spanOfCareCount: integer("span_of_care_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ==========================================
// MEMBERS & HOUSEHOLDS
// ==========================================
export const households = pgTable("households", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(), // e.g. "The Cooper Family"
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
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 50 }),
  avatarUrl: text("avatar_url"),
  isHeadOfHousehold: boolean("is_head_of_household").default(false).notNull(),
  maritalStatus: varchar("marital_status", { length: 50 }),
  birthDate: timestamp("birth_date"),
  baptismDate: timestamp("baptism_date"),
  salvationDate: timestamp("salvation_date"),
  membershipStatus: varchar("membership_status", { length: 50 }).default("active"),
  envelopeNumber: varchar("envelope_number", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ==========================================
// SMALL GROUPS (CELL GROUPS)
// ==========================================
export const smallGroups = pgTable("small_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  leaderId: uuid("leader_id").references(() => members.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // "Young Adults", "Couples", "Men"
  meetingDay: varchar("meeting_day", { length: 20 }).notNull(), // "Wednesday"
  meetingTime: varchar("meeting_time", { length: 20 }).notNull(), // "19:00"
  meetingAddress: text("meeting_address"),
  maxCapacity: integer("max_capacity").default(15).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ==========================================
// VISITOR & LEADS CRM PIPELINE (KANBAN BOARD)
// ==========================================
export const visitorLeads = pgTable("visitor_leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  dealNumber: varchar("deal_number", { length: 50 }).notNull(), // e.g. "#192748"
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(), // e.g. "Paint & Drywall Repairs" or "First Visit: Cooper Family"
  location: varchar("location", { length: 255 }), // e.g. "2972 Washington Ave"
  stage: visitorStageEnum("stage").default("new_leads").notNull(),
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  source: varchar("source", { length: 100 }), // e.g. "Sunday Service QR", "Friend Invite", "LinkedIn"
  value: decimal("value", { precision: 12, scale: 2 }).default("0.00").notNull(), // Pledged amount or deal value
  assignedToUserId: uuid("assigned_to_user_id").references(() => users.id),
  tags: jsonb("tags").$type<string[]>().default([]), // ["HOT LEADS", "REPEAT", "YOUTH"]
  activeSequence: varchar("active_sequence", { length: 150 }).default("Welcome Drip Sequence"),
  nextDripAction: varchar("next_drip_action", { length: 255 }).default("Follow-up call tomorrow 12:30 PM"),
  stageChangedAt: timestamp("stage_changed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const visitorActivities = pgTable("visitor_activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").references(() => visitorLeads.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "email_delivered", "stage_change", "call", "note"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  performedByUserId: uuid("performed_by_user_id").references(() => users.id),
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
  assignedStaffId: uuid("assigned_staff_id").references(() => users.id),
  status: varchar("status", { length: 50 }).default("scheduled"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ==========================================
// CHURCH & NON-PROFIT FUND ACCOUNTING
// ==========================================
export const accountingFunds = pgTable("accounting_funds", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(), // "General Fund", "Building Campaign", "Missions"
  code: varchar("code", { length: 50 }).notNull().unique(),
  type: fundTypeEnum("type").default("unrestricted").notNull(),
  balance: decimal("balance", { precision: 14, scale: 2 }).default("0.00").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  fundId: uuid("fund_id").references(() => accountingFunds.id),
  accountNumber: varchar("account_number", { length: 50 }).notNull().unique(), // e.g. "1010", "4010"
  accountName: varchar("account_name", { length: 255 }).notNull(), // "Operating Checking", "Tithes"
  category: accountCategoryEnum("category").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  campusId: uuid("campus_id").references(() => campuses.id).notNull(),
  entryNumber: varchar("entry_number", { length: 50 }).notNull().unique(),
  entryDate: timestamp("entry_date").notNull(),
  memo: text("memo").notNull(),
  status: transactionStatusEnum("status").default("draft").notNull(),
  approvedByUserId: uuid("approved_by_user_id").references(() => users.id),
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
  minRoleRequired: roleTypeEnum("min_role_required").default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const churchDocuments = pgTable("church_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  folderId: uuid("folder_id").references(() => documentFolders.id),
  campusId: uuid("campus_id").references(() => campuses.id),
  uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  cloudinaryPublicId: text("cloudinary_public_id").notNull(),
  cloudinaryUrl: text("cloudinary_url").notNull(),
  format: varchar("format", { length: 20 }), // "pdf", "mp4", "mp3", "docx"
  fileSizeBytes: integer("file_size_bytes"),
  minRoleRequired: roleTypeEnum("min_role_required").default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ==========================================
// RELATIONS
// ==========================================
export const campusesRelations = relations(campuses, ({ many }) => ({
  users: many(users),
  members: many(members),
  visitorLeads: many(visitorLeads),
  funds: many(accountingFunds),
}))

export const visitorLeadsRelations = relations(visitorLeads, ({ one, many }) => ({
  campus: one(campuses, { fields: [visitorLeads.campusId], references: [campuses.id] }),
  assignedStaff: one(users, { fields: [visitorLeads.assignedToUserId], references: [users.id] }),
  activities: many(visitorActivities),
  appointments: many(visitorAppointments),
}))
