ALTER TABLE "church_forms" ADD COLUMN IF NOT EXISTS "purpose" varchar(40) DEFAULT 'general' NOT NULL;
