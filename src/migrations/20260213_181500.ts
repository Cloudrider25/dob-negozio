import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      CREATE TYPE "public"."enum_users_preferences_preferred_locale" AS ENUM('it', 'en', 'ru');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;
  `)

  await db.execute(sql`
    ALTER TABLE "users"
      ALTER COLUMN "preferences_preferred_locale" DROP DEFAULT,
      ALTER COLUMN "preferences_preferred_locale" TYPE "public"."enum_users_preferences_preferred_locale"
        USING "preferences_preferred_locale"::"public"."enum_users_preferences_preferred_locale",
      ALTER COLUMN "preferences_preferred_locale" SET DEFAULT 'it';
  `)

  await db.execute(sql`
    ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "_verified" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "_verificationtoken" varchar;
  `)

  await db.execute(sql`
    UPDATE "users"
    SET "_verified" = true
    WHERE "_verified" IS NULL OR "_verified" = false;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users"
      DROP COLUMN IF EXISTS "_verificationtoken",
      DROP COLUMN IF EXISTS "_verified";
  `)

  await db.execute(sql`
    ALTER TABLE "users"
      ALTER COLUMN "preferences_preferred_locale" DROP DEFAULT,
      ALTER COLUMN "preferences_preferred_locale" TYPE varchar USING "preferences_preferred_locale"::text,
      ALTER COLUMN "preferences_preferred_locale" SET DEFAULT 'it';
  `)

  await db.execute(sql`
    DROP TYPE IF EXISTS "public"."enum_users_preferences_preferred_locale";
  `)
}
