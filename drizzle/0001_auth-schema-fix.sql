CREATE TYPE "public"."service_type" AS ENUM('sunday_worship', 'midweek', 'prayer', 'youth', 'kids', 'special', 'other');--> statement-breakpoint
CREATE TABLE "church_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid,
	"title" varchar(255) NOT NULL,
	"type" varchar(50) DEFAULT 'ministry' NOT NULL,
	"description" text,
	"location_label" varchar(255),
	"service_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_assignees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occurrence_id" uuid NOT NULL,
	"member_id" uuid,
	"user_id" text,
	"display_name" varchar(255) NOT NULL,
	"role_label" varchar(50) DEFAULT 'volunteer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_occurrences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"campus_id" uuid,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp,
	"all_day" boolean DEFAULT false NOT NULL,
	"status" varchar(30) DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid,
	"name" varchar(255) NOT NULL,
	"type" "service_type" DEFAULT 'sunday_worship' NOT NULL,
	"location_label" varchar(255),
	"default_day_of_week" integer,
	"default_start_time" varchar(10),
	"recurrence" varchar(50) DEFAULT 'weekly' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"leader" varchar(255),
	"duration_minutes" integer DEFAULT 10 NOT NULL,
	"details" text,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_volunteer_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"role" varchar(255) NOT NULL,
	"assignee_name" varchar(255),
	"status" varchar(50) DEFAULT 'needed' NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "two_factors" ADD COLUMN "verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "two_factors" ADD COLUMN "failed_verification_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "two_factors" ADD COLUMN "locked_until" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "church_programs" ADD CONSTRAINT "church_programs_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "church_programs" ADD CONSTRAINT "church_programs_service_id_service_definitions_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_assignees" ADD CONSTRAINT "program_assignees_occurrence_id_program_occurrences_id_fk" FOREIGN KEY ("occurrence_id") REFERENCES "public"."program_occurrences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_assignees" ADD CONSTRAINT "program_assignees_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_assignees" ADD CONSTRAINT "program_assignees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_occurrences" ADD CONSTRAINT "program_occurrences_program_id_church_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."church_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_occurrences" ADD CONSTRAINT "program_occurrences_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_definitions" ADD CONSTRAINT "service_definitions_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_segments" ADD CONSTRAINT "service_segments_service_id_service_definitions_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_volunteer_slots" ADD CONSTRAINT "service_volunteer_slots_service_id_service_definitions_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service_definitions"("id") ON DELETE cascade ON UPDATE no action;