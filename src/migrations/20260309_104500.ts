import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "commission_paid_at" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "commission_payout_reference" varchar,
      ADD COLUMN IF NOT EXISTS "commission_payout_notes" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "commission_paid_at",
      DROP COLUMN IF EXISTS "commission_payout_reference",
      DROP COLUMN IF EXISTS "commission_payout_notes";
  `)
}
