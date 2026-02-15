import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "smtp_host" varchar,
      ADD COLUMN IF NOT EXISTS "smtp_port" numeric,
      ADD COLUMN IF NOT EXISTS "smtp_secure" boolean,
      ADD COLUMN IF NOT EXISTS "smtp_user" varchar,
      ADD COLUMN IF NOT EXISTS "smtp_pass" varchar,
      ADD COLUMN IF NOT EXISTS "smtp_from" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      DROP COLUMN IF EXISTS "smtp_host",
      DROP COLUMN IF EXISTS "smtp_port",
      DROP COLUMN IF EXISTS "smtp_secure",
      DROP COLUMN IF EXISTS "smtp_user",
      DROP COLUMN IF EXISTS "smtp_pass",
      DROP COLUMN IF EXISTS "smtp_from";
  `)
}
