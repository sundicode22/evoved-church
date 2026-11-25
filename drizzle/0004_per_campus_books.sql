ALTER TABLE "accounting_funds" DROP CONSTRAINT IF EXISTS "accounting_funds_code_unique";--> statement-breakpoint
ALTER TABLE "chart_of_accounts" DROP CONSTRAINT IF EXISTS "chart_of_accounts_account_number_unique";--> statement-breakpoint
ALTER TABLE "accounting_funds" ADD CONSTRAINT "accounting_funds_campus_code_unique" UNIQUE("campus_id","code");--> statement-breakpoint
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_campus_number_unique" UNIQUE("campus_id","account_number");
