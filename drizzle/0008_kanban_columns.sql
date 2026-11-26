-- Flexible kanban columns (visitors + projects boards)
CREATE TABLE IF NOT EXISTS "kanban_columns" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "board_type" varchar(40) NOT NULL,
  "key" varchar(80) NOT NULL,
  "label" varchar(120) NOT NULL,
  "order_index" integer DEFAULT 0 NOT NULL,
  "color" varchar(40),
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "kanban_columns_board_key_uidx"
  ON "kanban_columns" ("board_type", "key");
--> statement-breakpoint
-- Free stages from fixed enums so custom columns work
ALTER TABLE "visitor_leads" ALTER COLUMN "stage" TYPE varchar(80) USING "stage"::text;
--> statement-breakpoint
ALTER TABLE "visitor_leads" ALTER COLUMN "stage" SET DEFAULT 'first_visit';
--> statement-breakpoint
ALTER TABLE "project_cards" ALTER COLUMN "stage" TYPE varchar(80) USING "stage"::text;
--> statement-breakpoint
ALTER TABLE "project_cards" ALTER COLUMN "stage" SET DEFAULT 'backlog';
--> statement-breakpoint
DROP TABLE IF EXISTS "portal_settings";
