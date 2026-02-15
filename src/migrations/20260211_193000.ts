import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "sendcloud_parcel_id" numeric,
      ADD COLUMN IF NOT EXISTS "sendcloud_carrier_code" varchar,
      ADD COLUMN IF NOT EXISTS "sendcloud_tracking_number" varchar,
      ADD COLUMN IF NOT EXISTS "sendcloud_tracking_url" varchar,
      ADD COLUMN IF NOT EXISTS "sendcloud_label_url" varchar,
      ADD COLUMN IF NOT EXISTS "sendcloud_status_message" varchar,
      ADD COLUMN IF NOT EXISTS "sendcloud_last_sync_at" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "sendcloud_error" text;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "sendcloud_parcel_id",
      DROP COLUMN IF EXISTS "sendcloud_carrier_code",
      DROP COLUMN IF EXISTS "sendcloud_tracking_number",
      DROP COLUMN IF EXISTS "sendcloud_tracking_url",
      DROP COLUMN IF EXISTS "sendcloud_label_url",
      DROP COLUMN IF EXISTS "sendcloud_status_message",
      DROP COLUMN IF EXISTS "sendcloud_last_sync_at",
      DROP COLUMN IF EXISTS "sendcloud_error";
  `)
}
