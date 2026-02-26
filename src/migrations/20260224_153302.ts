import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "appointment_proposed_date" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "appointment_proposed_time" varchar,
      ADD COLUMN IF NOT EXISTS "appointment_proposal_note" varchar,
      ADD COLUMN IF NOT EXISTS "appointment_confirmed_at" timestamp(3) with time zone;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "appointment_proposed_date",
      DROP COLUMN IF EXISTS "appointment_proposed_time",
      DROP COLUMN IF EXISTS "appointment_proposal_note",
      DROP COLUMN IF EXISTS "appointment_confirmed_at";
  `)
}

