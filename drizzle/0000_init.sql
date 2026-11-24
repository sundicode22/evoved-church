CREATE TYPE "public"."account_category" AS ENUM('asset', 'liability', 'net_assets', 'revenue', 'expense');--> statement-breakpoint
CREATE TYPE "public"."approval_status" AS ENUM('draft', 'pending_tier_1', 'pending_tier_2', 'pending_tier_3', 'approved', 'rejected', 'disbursed');--> statement-breakpoint
CREATE TYPE "public"."campus_type" AS ENUM('main', 'regional', 'satellite', 'church_plant', 'online');--> statement-breakpoint
CREATE TYPE "public"."fund_type" AS ENUM('unrestricted', 'temporarily_restricted', 'permanently_restricted');--> statement-breakpoint
CREATE TYPE "public"."giving_method" AS ENUM('card', 'ach_bank', 'cash_envelope', 'check', 'crypto');--> statement-breakpoint
CREATE TYPE "public"."household_role" AS ENUM('father', 'mother', 'spouse', 'son', 'daughter', 'guardian', 'head', 'other');--> statement-breakpoint
CREATE TYPE "public"."person_type" AS ENUM('visitor', 'prospect', 'regular_attender', 'covenant_member', 'volunteer', 'leader', 'staff_minister', 'donor_only', 'inactive_alumni');--> statement-breakpoint
CREATE TYPE "public"."project_stage" AS ENUM('backlog', 'in_progress', 'review', 'done');--> statement-breakpoint
CREATE TYPE "public"."visitor_stage" AS ENUM('first_visit', 'welcome_call', 'pastoral_visit', 'foundations_class', 'group_integration', 'active_partner');--> statement-breakpoint
CREATE TABLE "accounting_funds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"type" "fund_type" DEFAULT 'unrestricted' NOT NULL,
	"budget_amount" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"encumbered_amount" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"expended_amount" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"balance" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "accounting_funds_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(150) NOT NULL,
	"label" varchar(255) NOT NULL,
	"group_name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_permissions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "app_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_roles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "attendance_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"session_name" varchar(255) NOT NULL,
	"session_date" timestamp NOT NULL,
	"session_type" varchar(50) DEFAULT 'service' NOT NULL,
	"qr_token" varchar(100) NOT NULL,
	"headcount_adults" integer DEFAULT 0 NOT NULL,
	"headcount_children" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_sessions_qr_token_unique" UNIQUE("qr_token")
);
--> statement-breakpoint
CREATE TABLE "budget_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"fund_id" uuid NOT NULL,
	"account_id" uuid,
	"fiscal_year" integer NOT NULL,
	"department" varchar(150),
	"label" varchar(255) NOT NULL,
	"allocated_amount" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_sends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"recipient_name" varchar(255),
	"recipient_email" varchar(255),
	"recipient_phone" varchar(50),
	"channel" varchar(20) NOT NULL,
	"status" varchar(30) DEFAULT 'queued' NOT NULL,
	"provider_id" varchar(150),
	"error_message" text,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid,
	"name" varchar(255) NOT NULL,
	"channel" varchar(20) DEFAULT 'email' NOT NULL,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"subject" varchar(255),
	"email_body" text,
	"sms_body" text,
	"audience_filter" jsonb DEFAULT '{}'::jsonb,
	"schedule_at" timestamp,
	"created_by_user_id" text,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"type" "campus_type" DEFAULT 'regional' NOT NULL,
	"address" text,
	"city" varchar(100),
	"state" varchar(50),
	"country" varchar(50) DEFAULT 'US',
	"phone_number" varchar(50),
	"email" varchar(150),
	"is_main_campus" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campuses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "chart_of_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"fund_id" uuid,
	"account_number" varchar(50) NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"category" "account_category" NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chart_of_accounts_account_number_unique" UNIQUE("account_number")
);
--> statement-breakpoint
CREATE TABLE "child_checkin_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"child_member_id" uuid NOT NULL,
	"guardian_member_id" uuid NOT NULL,
	"security_pickup_code" varchar(20) NOT NULL,
	"allergies" text,
	"special_needs" text,
	"is_checked_out" boolean DEFAULT false NOT NULL,
	"checked_in_at" timestamp DEFAULT now() NOT NULL,
	"checked_out_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "church_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"folder_id" uuid,
	"campus_id" uuid,
	"uploaded_by_user_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"cloudinary_public_id" text NOT NULL,
	"cloudinary_url" text NOT NULL,
	"format" varchar(20),
	"file_size_bytes" integer,
	"min_role_required" varchar(50) DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "church_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid,
	"title" varchar(255) NOT NULL,
	"module" varchar(50) NOT NULL,
	"summary" text,
	"body_html" text NOT NULL,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_by_user_id" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_field_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar(100) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"field_key" varchar(100) NOT NULL,
	"field_label" varchar(255) NOT NULL,
	"field_type" varchar(50) NOT NULL,
	"options" jsonb,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_confidential" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_field_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_definition_id" uuid NOT NULL,
	"entity_id" uuid NOT NULL,
	"value_text" text,
	"value_number" numeric(14, 4),
	"value_date" timestamp,
	"value_boolean" boolean,
	"value_json" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid,
	"name" varchar(255) NOT NULL,
	"parent_id" uuid,
	"min_role_required" varchar(50) DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_approval_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"tier_level" integer NOT NULL,
	"min_amount" numeric(12, 2) NOT NULL,
	"max_amount" numeric(12, 2) NOT NULL,
	"required_role" varchar(100) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "expense_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requisition_id" uuid NOT NULL,
	"approver_user_id" text NOT NULL,
	"tier_level" integer NOT NULL,
	"decision" varchar(50) NOT NULL,
	"comments" text,
	"decided_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_requisitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"requisition_number" varchar(50) NOT NULL,
	"requested_by_user_id" text NOT NULL,
	"fund_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"vendor_name" varchar(255) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"description" text NOT NULL,
	"receipt_url" text,
	"status" "approval_status" DEFAULT 'draft' NOT NULL,
	"current_tier_level" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "expense_requisitions_requisition_number_unique" UNIQUE("requisition_number")
);
--> statement-breakpoint
CREATE TABLE "fund_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"from_fund_id" uuid NOT NULL,
	"to_fund_id" uuid NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"transfer_reason" text NOT NULL,
	"authorized_by_user_id" text NOT NULL,
	"transfer_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "giving_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"member_id" uuid,
	"fund_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"method" "giving_method" NOT NULL,
	"transaction_reference" varchar(150),
	"is_tax_deductible" boolean DEFAULT true NOT NULL,
	"contribution_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "households" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"city" varchar(100),
	"state" varchar(50),
	"zip_code" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"entry_number" varchar(50) NOT NULL,
	"entry_date" timestamp NOT NULL,
	"memo" text NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"created_by_user_id" text NOT NULL,
	"posted_by_user_id" text,
	"posted_at" timestamp,
	"approved_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "journal_entries_entry_number_unique" UNIQUE("entry_number")
);
--> statement-breakpoint
CREATE TABLE "journal_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journal_entry_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"fund_id" uuid NOT NULL,
	"debit" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"credit" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"memo" text
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"household_id" uuid,
	"household_role" "household_role",
	"person_type" "person_type" DEFAULT 'covenant_member' NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255),
	"phone_number" varchar(50),
	"avatar_url" text,
	"recorded_title" varchar(100),
	"ministry_roles" jsonb DEFAULT '[]'::jsonb,
	"is_head_of_household" boolean DEFAULT false NOT NULL,
	"birth_date" timestamp,
	"envelope_number" varchar(50),
	"salvation_date" timestamp,
	"baptism_date" timestamp,
	"baptism_officiant" varchar(150),
	"confirmation_date" timestamp,
	"ordination_date" timestamp,
	"ordination_credentials" text,
	"background_check_status" varchar(50) DEFAULT 'none',
	"background_check_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "organigram_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid,
	"user_id" text,
	"title" varchar(255) NOT NULL,
	"department" varchar(100) NOT NULL,
	"parent_id" uuid,
	"order_index" integer DEFAULT 0 NOT NULL,
	"span_of_care_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "project_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"stage" "project_stage" DEFAULT 'backlog' NOT NULL,
	"priority" varchar(30) DEFAULT 'normal' NOT NULL,
	"assignee_name" varchar(150),
	"project_name" varchar(255),
	"due_label" varchar(100),
	"order_index" integer DEFAULT 0 NOT NULL,
	"stage_changed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"active_organization_id" text,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "tenant_nomenclatures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar(100) NOT NULL,
	"church_name" varchar(255) DEFAULT 'Evolve Church' NOT NULL,
	"member_term_singular" varchar(100) DEFAULT 'Member' NOT NULL,
	"member_term_plural" varchar(100) DEFAULT 'Members' NOT NULL,
	"visitor_term_singular" varchar(100) DEFAULT 'First-Time Guest' NOT NULL,
	"visitor_term_plural" varchar(100) DEFAULT 'First-Time Guests' NOT NULL,
	"group_term_singular" varchar(100) DEFAULT 'Small Group' NOT NULL,
	"group_term_plural" varchar(100) DEFAULT 'Small Groups' NOT NULL,
	"campus_term_singular" varchar(100) DEFAULT 'Campus' NOT NULL,
	"campus_term_plural" varchar(100) DEFAULT 'Campuses' NOT NULL,
	"pastor_term_singular" varchar(100) DEFAULT 'Pastor' NOT NULL,
	"giving_term" varchar(100) DEFAULT 'Tithes & Offerings' NOT NULL,
	"currency_code" varchar(10) DEFAULT 'USD' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_nomenclatures_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "two_factors" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"badge_color" varchar(50) DEFAULT 'emerald' NOT NULL,
	"description" text,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"role_id" uuid NOT NULL,
	"campus_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"campus_id" uuid,
	"role" text DEFAULT 'member' NOT NULL,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "visitor_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"performed_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitor_appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"appointment_date" timestamp NOT NULL,
	"start_time" varchar(20),
	"end_time" varchar(20),
	"location" text,
	"assigned_staff_id" text,
	"status" varchar(50) DEFAULT 'scheduled',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitor_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_number" varchar(50) NOT NULL,
	"campus_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"location" varchar(255),
	"stage" "visitor_stage" DEFAULT 'first_visit' NOT NULL,
	"contact_name" varchar(255) NOT NULL,
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"source" varchar(100),
	"value" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"assigned_to_user_id" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"active_sequence" varchar(150) DEFAULT 'Welcome Drip Sequence',
	"next_drip_action" varchar(255),
	"stage_changed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounting_funds" ADD CONSTRAINT "accounting_funds_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_fund_id_accounting_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."accounting_funds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_sends" ADD CONSTRAINT "campaign_sends_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_fund_id_accounting_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."accounting_funds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_checkin_badges" ADD CONSTRAINT "child_checkin_badges_session_id_attendance_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."attendance_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_checkin_badges" ADD CONSTRAINT "child_checkin_badges_child_member_id_members_id_fk" FOREIGN KEY ("child_member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_checkin_badges" ADD CONSTRAINT "child_checkin_badges_guardian_member_id_members_id_fk" FOREIGN KEY ("guardian_member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "church_documents" ADD CONSTRAINT "church_documents_folder_id_document_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."document_folders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "church_documents" ADD CONSTRAINT "church_documents_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "church_documents" ADD CONSTRAINT "church_documents_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "church_policies" ADD CONSTRAINT "church_policies_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "church_policies" ADD CONSTRAINT "church_policies_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field_values" ADD CONSTRAINT "custom_field_values_field_definition_id_custom_field_definitions_id_fk" FOREIGN KEY ("field_definition_id") REFERENCES "public"."custom_field_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_folders" ADD CONSTRAINT "document_folders_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_approval_rules" ADD CONSTRAINT "expense_approval_rules_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_approvals" ADD CONSTRAINT "expense_approvals_requisition_id_expense_requisitions_id_fk" FOREIGN KEY ("requisition_id") REFERENCES "public"."expense_requisitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_approvals" ADD CONSTRAINT "expense_approvals_approver_user_id_users_id_fk" FOREIGN KEY ("approver_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_requisitions" ADD CONSTRAINT "expense_requisitions_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_requisitions" ADD CONSTRAINT "expense_requisitions_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_requisitions" ADD CONSTRAINT "expense_requisitions_fund_id_accounting_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."accounting_funds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_requisitions" ADD CONSTRAINT "expense_requisitions_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_transfers" ADD CONSTRAINT "fund_transfers_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_transfers" ADD CONSTRAINT "fund_transfers_from_fund_id_accounting_funds_id_fk" FOREIGN KEY ("from_fund_id") REFERENCES "public"."accounting_funds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_transfers" ADD CONSTRAINT "fund_transfers_to_fund_id_accounting_funds_id_fk" FOREIGN KEY ("to_fund_id") REFERENCES "public"."accounting_funds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_transfers" ADD CONSTRAINT "fund_transfers_authorized_by_user_id_users_id_fk" FOREIGN KEY ("authorized_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "giving_contributions" ADD CONSTRAINT "giving_contributions_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "giving_contributions" ADD CONSTRAINT "giving_contributions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "giving_contributions" ADD CONSTRAINT "giving_contributions_fund_id_accounting_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."accounting_funds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "households" ADD CONSTRAINT "households_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_posted_by_user_id_users_id_fk" FOREIGN KEY ("posted_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_account_id_chart_of_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_fund_id_accounting_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."accounting_funds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organigram_nodes" ADD CONSTRAINT "organigram_nodes_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organigram_nodes" ADD CONSTRAINT "organigram_nodes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_cards" ADD CONSTRAINT "project_cards_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_app_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."app_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_app_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."app_permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factors" ADD CONSTRAINT "two_factors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_app_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."app_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor_activities" ADD CONSTRAINT "visitor_activities_lead_id_visitor_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."visitor_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor_activities" ADD CONSTRAINT "visitor_activities_performed_by_user_id_users_id_fk" FOREIGN KEY ("performed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor_appointments" ADD CONSTRAINT "visitor_appointments_lead_id_visitor_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."visitor_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor_appointments" ADD CONSTRAINT "visitor_appointments_assigned_staff_id_users_id_fk" FOREIGN KEY ("assigned_staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor_leads" ADD CONSTRAINT "visitor_leads_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitor_leads" ADD CONSTRAINT "visitor_leads_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;