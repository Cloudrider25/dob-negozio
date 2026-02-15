import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      ALTER TYPE "public"."enum_users_roles" ADD VALUE IF NOT EXISTS 'customer';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;
  `)

  await db.execute(sql`
    ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "first_name" varchar,
      ADD COLUMN IF NOT EXISTS "last_name" varchar,
      ADD COLUMN IF NOT EXISTS "phone" varchar,
      ADD COLUMN IF NOT EXISTS "preferences_marketing_opt_in" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "preferences_preferred_locale" varchar DEFAULT 'it';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users"
      DROP COLUMN IF EXISTS "first_name",
      DROP COLUMN IF EXISTS "last_name",
      DROP COLUMN IF EXISTS "phone",
      DROP COLUMN IF EXISTS "preferences_marketing_opt_in",
      DROP COLUMN IF EXISTS "preferences_preferred_locale";
  `)
}
