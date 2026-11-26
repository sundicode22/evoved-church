ALTER TABLE "campuses" ADD COLUMN IF NOT EXISTS "organization_id" text;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "campuses" ADD CONSTRAINT "campuses_organization_id_organizations_id_fk"
    FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "saas_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(60) NOT NULL UNIQUE,
  "name" varchar(120) NOT NULL,
  "description" text,
  "price_monthly_cents" integer DEFAULT 0 NOT NULL,
  "currency_code" varchar(10) DEFAULT 'USD' NOT NULL,
  "max_locations" integer DEFAULT 1 NOT NULL,
  "max_seats" integer DEFAULT 3 NOT NULL,
  "features" jsonb DEFAULT '[]'::jsonb,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenant_subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" text NOT NULL,
  "plan_id" uuid NOT NULL,
  "status" varchar(40) DEFAULT 'active' NOT NULL,
  "billing_interval" varchar(20) DEFAULT 'month' NOT NULL,
  "stripe_customer_id" varchar(120),
  "stripe_subscription_id" varchar(120),
  "current_period_start" timestamp,
  "current_period_end" timestamp,
  "trial_ends_at" timestamp,
  "canceled_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_plan_id_saas_plans_id_fk"
    FOREIGN KEY ("plan_id") REFERENCES "public"."saas_plans"("id");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tenant_subscriptions_org_uidx" ON "tenant_subscriptions" ("organization_id");
--> statement-breakpoint
INSERT INTO "saas_plans" ("slug", "name", "description", "price_monthly_cents", "max_locations", "max_seats", "features", "sort_order")
VALUES
  (
    'starter',
    'Starter',
    'One location — members, visitors, forms, and attendance.',
    0,
    1,
    3,
    '["Members & families","Visitor CRM","Forms + submissions","Guest QR check-in","1 location","3 staff seats"]'::jsonb,
    10
  ),
  (
    'growth',
    'Growth',
    'Multi-location ops with campaigns and deeper reporting.',
    4900,
    3,
    15,
    '["Everything in Starter","Up to 3 locations","15 staff seats","Campaigns (email + SMS)","Audit log & exports","Priority support"]'::jsonb,
    20
  ),
  (
    'campus',
    'Campus',
    'Church networks and multi-site teams with full fund accounting.',
    12900,
    50,
    50,
    '["Everything in Growth","Up to 50 locations","50 staff seats","Fund accounting & ledger","Import / migration tools","Dedicated onboarding"]'::jsonb,
    30
  )
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "price_monthly_cents" = EXCLUDED."price_monthly_cents",
  "max_locations" = EXCLUDED."max_locations",
  "max_seats" = EXCLUDED."max_seats",
  "features" = EXCLUDED."features",
  "sort_order" = EXCLUDED."sort_order";
