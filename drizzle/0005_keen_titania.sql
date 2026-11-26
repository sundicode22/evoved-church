ALTER TABLE "members" ADD COLUMN "preferred_name" varchar(100);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "gender" varchar(30);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "marital_status" varchar(40);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "state" varchar(50);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "zip_code" varchar(20);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "country" varchar(100) DEFAULT 'US';--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "occupation" varchar(150);--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "membership_date" timestamp;
