import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "checkout_attempts_customer_idx"
      ON "checkout_attempts" ("customer_id");
    CREATE INDEX IF NOT EXISTS "checkout_attempts_order_idx"
      ON "checkout_attempts" ("order_id");
    CREATE INDEX IF NOT EXISTS "checkout_attempts_partner_idx"
      ON "checkout_attempts" ("partner_id");
    CREATE INDEX IF NOT EXISTS "checkout_attempts_promo_code_idx"
      ON "checkout_attempts" ("promo_code_id");
    CREATE INDEX IF NOT EXISTS "checkout_attempts_updated_at_idx"
      ON "checkout_attempts" ("updated_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "checkout_attempts_customer_idx";
    DROP INDEX IF EXISTS "checkout_attempts_order_idx";
    DROP INDEX IF EXISTS "checkout_attempts_partner_idx";
    DROP INDEX IF EXISTS "checkout_attempts_promo_code_idx";
    DROP INDEX IF EXISTS "checkout_attempts_updated_at_idx";
  `)
}
