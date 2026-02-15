import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "stripe_secret_key" varchar,
      ADD COLUMN IF NOT EXISTS "stripe_webhook_secret" varchar,
      ADD COLUMN IF NOT EXISTS "stripe_publishable_key" varchar,
      ADD COLUMN IF NOT EXISTS "sendcloud_public_key" varchar,
      ADD COLUMN IF NOT EXISTS "sendcloud_secret_key" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      DROP COLUMN IF EXISTS "stripe_secret_key",
      DROP COLUMN IF EXISTS "stripe_webhook_secret",
      DROP COLUMN IF EXISTS "stripe_publishable_key",
      DROP COLUMN IF EXISTS "sendcloud_public_key",
      DROP COLUMN IF EXISTS "sendcloud_secret_key";
  `)
}
