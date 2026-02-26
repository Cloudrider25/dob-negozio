import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_order_service_items_appointment_mode') THEN
        CREATE TYPE "enum_order_service_items_appointment_mode" AS ENUM ('none', 'requested_slot', 'contact_later');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_order_service_items_appointment_status') THEN
        CREATE TYPE "enum_order_service_items_appointment_status" AS ENUM ('none', 'pending', 'confirmed', 'alternative_proposed', 'confirmed_by_customer');
      END IF;
    END $$;

    ALTER TABLE "order_service_items"
      ADD COLUMN IF NOT EXISTS "appointment_mode" "enum_order_service_items_appointment_mode" DEFAULT 'none',
      ADD COLUMN IF NOT EXISTS "appointment_status" "enum_order_service_items_appointment_status" DEFAULT 'none',
      ADD COLUMN IF NOT EXISTS "appointment_requested_date" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "appointment_requested_time" varchar,
      ADD COLUMN IF NOT EXISTS "appointment_proposed_date" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "appointment_proposed_time" varchar,
      ADD COLUMN IF NOT EXISTS "appointment_proposal_note" varchar,
      ADD COLUMN IF NOT EXISTS "appointment_confirmed_at" timestamp(3) with time zone;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "order_service_items"
      DROP COLUMN IF EXISTS "appointment_mode",
      DROP COLUMN IF EXISTS "appointment_status",
      DROP COLUMN IF EXISTS "appointment_requested_date",
      DROP COLUMN IF EXISTS "appointment_requested_time",
      DROP COLUMN IF EXISTS "appointment_proposed_date",
      DROP COLUMN IF EXISTS "appointment_proposed_time",
      DROP COLUMN IF EXISTS "appointment_proposal_note",
      DROP COLUMN IF EXISTS "appointment_confirmed_at";

    DROP TYPE IF EXISTS "enum_order_service_items_appointment_mode";
    DROP TYPE IF EXISTS "enum_order_service_items_appointment_status";
  `)
}

