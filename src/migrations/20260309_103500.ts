import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_pages_page_key" ADD VALUE IF NOT EXISTS 'cookie-policy';

    ALTER TABLE "pages_locales"
      ADD COLUMN IF NOT EXISTS "cookie_policy_page_title" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_page_intro" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_title" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_body" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_cookie_policy_label" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_privacy_policy_label" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_storage_preferences_label" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_essential_label" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_essential_description" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_advertising_label" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_advertising_description" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_personalization_label" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_personalization_description" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_analytics_label" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_analytics_description" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_save_label" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_accept_all_label" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_reject_optional_label" varchar,
      ADD COLUMN IF NOT EXISTS "cookie_policy_banner_close_label" varchar;

    CREATE TABLE IF NOT EXISTS "pages_cookie_policy_sections" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "pages_cookie_policy_sections_locales" (
      "title" varchar,
      "body" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "public"."_locales" NOT NULL,
      "_parent_id" varchar NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "pages_cookie_policy_sections_order_idx"
      ON "pages_cookie_policy_sections" ("_order");
    CREATE INDEX IF NOT EXISTS "pages_cookie_policy_sections_parent_id_idx"
      ON "pages_cookie_policy_sections" ("_parent_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "pages_cookie_policy_sections_locales_locale_parent_id_unique"
      ON "pages_cookie_policy_sections_locales" ("_locale", "_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pages_cookie_policy_sections_parent_id_fk'
      ) THEN
        ALTER TABLE "pages_cookie_policy_sections"
          ADD CONSTRAINT "pages_cookie_policy_sections_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "pages"("id") ON DELETE CASCADE;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pages_cookie_policy_sections_locales_parent_id_fk'
      ) THEN
        ALTER TABLE "pages_cookie_policy_sections_locales"
          ADD CONSTRAINT "pages_cookie_policy_sections_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "pages_cookie_policy_sections"("id") ON DELETE CASCADE;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_cookie_policy_sections_locales"
      DROP CONSTRAINT IF EXISTS "pages_cookie_policy_sections_locales_parent_id_fk";

    ALTER TABLE "pages_cookie_policy_sections"
      DROP CONSTRAINT IF EXISTS "pages_cookie_policy_sections_parent_id_fk";

    DROP INDEX IF EXISTS "pages_cookie_policy_sections_locales_locale_parent_id_unique";
    DROP INDEX IF EXISTS "pages_cookie_policy_sections_parent_id_idx";
    DROP INDEX IF EXISTS "pages_cookie_policy_sections_order_idx";

    DROP TABLE IF EXISTS "pages_cookie_policy_sections_locales";
    DROP TABLE IF EXISTS "pages_cookie_policy_sections";

    ALTER TABLE "pages_locales"
      DROP COLUMN IF EXISTS "cookie_policy_page_title",
      DROP COLUMN IF EXISTS "cookie_policy_page_intro",
      DROP COLUMN IF EXISTS "cookie_policy_banner_title",
      DROP COLUMN IF EXISTS "cookie_policy_banner_body",
      DROP COLUMN IF EXISTS "cookie_policy_banner_cookie_policy_label",
      DROP COLUMN IF EXISTS "cookie_policy_banner_privacy_policy_label",
      DROP COLUMN IF EXISTS "cookie_policy_banner_storage_preferences_label",
      DROP COLUMN IF EXISTS "cookie_policy_banner_essential_label",
      DROP COLUMN IF EXISTS "cookie_policy_banner_essential_description",
      DROP COLUMN IF EXISTS "cookie_policy_banner_advertising_label",
      DROP COLUMN IF EXISTS "cookie_policy_banner_advertising_description",
      DROP COLUMN IF EXISTS "cookie_policy_banner_personalization_label",
      DROP COLUMN IF EXISTS "cookie_policy_banner_personalization_description",
      DROP COLUMN IF EXISTS "cookie_policy_banner_analytics_label",
      DROP COLUMN IF EXISTS "cookie_policy_banner_analytics_description",
      DROP COLUMN IF EXISTS "cookie_policy_banner_save_label",
      DROP COLUMN IF EXISTS "cookie_policy_banner_accept_all_label",
      DROP COLUMN IF EXISTS "cookie_policy_banner_reject_optional_label",
      DROP COLUMN IF EXISTS "cookie_policy_banner_close_label";
  `)
}
