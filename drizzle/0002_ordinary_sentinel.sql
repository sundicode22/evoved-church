CREATE TYPE "public"."announcement_status" AS ENUM('draft', 'scheduled', 'posted');--> statement-breakpoint
CREATE TYPE "public"."appointment_booking_status" AS ENUM('upcoming', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."appointment_schedule_status" AS ENUM('open_for_bookings', 'closed');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."form_field_type" AS ENUM('short_text', 'long_text', 'multiple_choice', 'checkboxes', 'email', 'phone', 'number', 'date', 'time');--> statement-breakpoint
CREATE TYPE "public"."giving_batch_status" AS ENUM('open', 'archived');--> statement-breakpoint
CREATE TYPE "public"."giving_channel" AS ENUM('in_person', 'online');--> statement-breakpoint
CREATE TYPE "public"."giving_frequency" AS ENUM('one_time', 'recurring');--> statement-breakpoint
CREATE TYPE "public"."giving_status" AS ENUM('draft', 'recorded', 'posted_to_ledger');--> statement-breakpoint
CREATE TYPE "public"."group_member_role" AS ENUM('leader', 'member', 'guest');--> statement-breakpoint
CREATE TYPE "public"."group_type" AS ENUM('private', 'public', 'team');--> statement-breakpoint
CREATE TYPE "public"."pledge_frequency" AS ENUM('weekly', 'monthly', 'yearly', 'one_time');--> statement-breakpoint
CREATE TYPE "public"."pledge_status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."resource_category" AS ENUM('equipment', 'supply', 'other');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid,
	"title" varchar(255) NOT NULL,
	"body_html" text NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"status" "announcement_status" DEFAULT 'draft' NOT NULL,
	"scheduled_at" timestamp,
	"posted_at" timestamp,
	"posted_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointment_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"guest_name" varchar(255) NOT NULL,
	"guest_email" varchar(255),
	"member_id" uuid,
	"starts_at" timestamp NOT NULL,
	"status" "appointment_booking_status" DEFAULT 'upcoming' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointment_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_user_id" text,
	"owner_display_name" varchar(255),
	"duration_minutes" integer DEFAULT 30 NOT NULL,
	"window_start" timestamp NOT NULL,
	"window_end" timestamp NOT NULL,
	"status" "appointment_schedule_status" DEFAULT 'open_for_bookings' NOT NULL,
	"booking_url_slug" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "church_form_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"label" varchar(255) NOT NULL,
	"field_type" "form_field_type" DEFAULT 'short_text' NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "church_form_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "church_forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid,
	"title" varchar(255) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"description" text,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "church_forms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "drip_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence_id" uuid NOT NULL,
	"lead_id" uuid,
	"member_id" uuid,
	"current_step" integer DEFAULT 0 NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drip_sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid,
	"name" varchar(255) NOT NULL,
	"trigger_event" varchar(100) DEFAULT 'first_visit' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drip_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence_id" uuid NOT NULL,
	"step_order" integer DEFAULT 1 NOT NULL,
	"delay_hours" integer DEFAULT 2 NOT NULL,
	"channel" varchar(20) DEFAULT 'email' NOT NULL,
	"subject" varchar(255),
	"body" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follow_ups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"related_member_id" uuid,
	"related_lead_id" uuid,
	"assigned_to_user_id" text,
	"due_at" timestamp,
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "giving_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"batch_date" timestamp NOT NULL,
	"status" "giving_batch_status" DEFAULT 'open' NOT NULL,
	"notes" text,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "giving_pledges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"fund_id" uuid NOT NULL,
	"amount_total" numeric(12, 2) NOT NULL,
	"amount_given" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"frequency" "pledge_frequency" DEFAULT 'monthly' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"status" "pledge_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"role" "group_member_role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ministry_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "group_type" DEFAULT 'public' NOT NULL,
	"image_url" text,
	"description" text,
	"leader_member_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portal_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"slug" varchar(120) NOT NULL,
	"public_directory" boolean DEFAULT false NOT NULL,
	"public_giving" boolean DEFAULT true NOT NULL,
	"public_events" boolean DEFAULT true NOT NULL,
	"public_groups" boolean DEFAULT true NOT NULL,
	"stripe_connected" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "portal_settings_campus_id_unique" UNIQUE("campus_id"),
	CONSTRAINT "portal_settings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "resource_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_id" uuid NOT NULL,
	"occurrence_id" uuid,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"requested_by_user_id" text,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" "resource_category" DEFAULT 'equipment' NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"occurrence_id" uuid,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"requested_by_user_id" text,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"capacity" integer,
	"location_note" text,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chart_of_accounts" ADD COLUMN "opening_balance" numeric(14, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "chart_of_accounts" ADD COLUMN "opening_balance_date" timestamp;--> statement-breakpoint
ALTER TABLE "chart_of_accounts" ADD COLUMN "connect_with_funds" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "giving_contributions" ADD COLUMN "batch_id" uuid;--> statement-breakpoint
ALTER TABLE "giving_contributions" ADD COLUMN "pledge_id" uuid;--> statement-breakpoint
ALTER TABLE "giving_contributions" ADD COLUMN "frequency" "giving_frequency" DEFAULT 'one_time' NOT NULL;--> statement-breakpoint
ALTER TABLE "giving_contributions" ADD COLUMN "channel" "giving_channel" DEFAULT 'in_person' NOT NULL;--> statement-breakpoint
ALTER TABLE "giving_contributions" ADD COLUMN "status" "giving_status" DEFAULT 'recorded' NOT NULL;--> statement-breakpoint
ALTER TABLE "giving_contributions" ADD COLUMN "journal_entry_id" uuid;--> statement-breakpoint
ALTER TABLE "giving_contributions" ADD COLUMN "donor_display_name" varchar(255);--> statement-breakpoint
ALTER TABLE "giving_contributions" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "tenant_nomenclatures" ADD COLUMN "church_email" varchar(255);--> statement-breakpoint
ALTER TABLE "tenant_nomenclatures" ADD COLUMN "church_phone" varchar(50);--> statement-breakpoint
ALTER TABLE "tenant_nomenclatures" ADD COLUMN "church_address" text;--> statement-breakpoint
ALTER TABLE "tenant_nomenclatures" ADD COLUMN "church_city" varchar(100);--> statement-breakpoint
ALTER TABLE "tenant_nomenclatures" ADD COLUMN "church_state" varchar(50);--> statement-breakpoint
ALTER TABLE "tenant_nomenclatures" ADD COLUMN "church_zip" varchar(20);--> statement-breakpoint
ALTER TABLE "tenant_nomenclatures" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "tenant_nomenclatures" ADD COLUMN "onboarding_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_posted_by_user_id_users_id_fk" FOREIGN KEY ("posted_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_bookings" ADD CONSTRAINT "appointment_bookings_schedule_id_appointment_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."appointment_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_bookings" ADD CONSTRAINT "appointment_bookings_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_schedules" ADD CONSTRAINT "appointment_schedules_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_schedules" ADD CONSTRAINT "appointment_schedules_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "church_form_fields" ADD CONSTRAINT "church_form_fields_form_id_church_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."church_forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "church_form_submissions" ADD CONSTRAINT "church_form_submissions_form_id_church_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."church_forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "church_forms" ADD CONSTRAINT "church_forms_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drip_enrollments" ADD CONSTRAINT "drip_enrollments_sequence_id_drip_sequences_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."drip_sequences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drip_enrollments" ADD CONSTRAINT "drip_enrollments_lead_id_visitor_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."visitor_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drip_enrollments" ADD CONSTRAINT "drip_enrollments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drip_sequences" ADD CONSTRAINT "drip_sequences_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drip_steps" ADD CONSTRAINT "drip_steps_sequence_id_drip_sequences_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."drip_sequences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_related_member_id_members_id_fk" FOREIGN KEY ("related_member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_related_lead_id_visitor_leads_id_fk" FOREIGN KEY ("related_lead_id") REFERENCES "public"."visitor_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "giving_batches" ADD CONSTRAINT "giving_batches_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "giving_batches" ADD CONSTRAINT "giving_batches_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "giving_pledges" ADD CONSTRAINT "giving_pledges_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "giving_pledges" ADD CONSTRAINT "giving_pledges_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "giving_pledges" ADD CONSTRAINT "giving_pledges_fund_id_accounting_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."accounting_funds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_memberships" ADD CONSTRAINT "group_memberships_group_id_ministry_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."ministry_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_memberships" ADD CONSTRAINT "group_memberships_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ministry_groups" ADD CONSTRAINT "ministry_groups_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ministry_groups" ADD CONSTRAINT "ministry_groups_leader_member_id_members_id_fk" FOREIGN KEY ("leader_member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal_settings" ADD CONSTRAINT "portal_settings_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_bookings" ADD CONSTRAINT "resource_bookings_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_bookings" ADD CONSTRAINT "resource_bookings_occurrence_id_program_occurrences_id_fk" FOREIGN KEY ("occurrence_id") REFERENCES "public"."program_occurrences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_bookings" ADD CONSTRAINT "resource_bookings_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_bookings" ADD CONSTRAINT "room_bookings_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_bookings" ADD CONSTRAINT "room_bookings_occurrence_id_program_occurrences_id_fk" FOREIGN KEY ("occurrence_id") REFERENCES "public"."program_occurrences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_bookings" ADD CONSTRAINT "room_bookings_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "giving_contributions" ADD CONSTRAINT "giving_contributions_batch_id_giving_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."giving_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "giving_contributions" ADD CONSTRAINT "giving_contributions_pledge_id_giving_pledges_id_fk" FOREIGN KEY ("pledge_id") REFERENCES "public"."giving_pledges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "giving_contributions" ADD CONSTRAINT "giving_contributions_journal_entry_id_journal_entries_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE no action ON UPDATE no action;