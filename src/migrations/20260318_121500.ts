import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_pages_page_key" ADD VALUE IF NOT EXISTS 'terms';

    ALTER TABLE "pages_locales"
      ADD COLUMN IF NOT EXISTS "terms_content" jsonb;

    INSERT INTO "pages" ("page_key", "hero_title_mode", "hero_style", "updated_at", "created_at")
    SELECT
      'terms'::"public"."enum_pages_page_key",
      'fixed'::"public"."enum_pages_hero_title_mode",
      'style1'::"public"."enum_pages_hero_style",
      now(),
      now()
    WHERE NOT EXISTS (
      SELECT 1
      FROM "pages"
      WHERE "page_key" = 'terms'::"public"."enum_pages_page_key"
    );

    INSERT INTO "pages_locales" ("_locale", "_parent_id")
    SELECT
      'it'::"public"."_locales",
      p."id"
    FROM "pages" p
    WHERE p."page_key" = 'terms'::"public"."enum_pages_page_key"
      AND NOT EXISTS (
        SELECT 1
        FROM "pages_locales" pl
        WHERE pl."_parent_id" = p."id"
          AND pl."_locale" = 'it'::"public"."_locales"
      );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "pages_locales"
    WHERE "_parent_id" IN (
      SELECT "id"
      FROM "pages"
      WHERE "page_key" = 'terms'::"public"."enum_pages_page_key"
    );

    DELETE FROM "pages"
    WHERE "page_key" = 'terms'::"public"."enum_pages_page_key";

    ALTER TABLE "pages_locales"
      DROP COLUMN IF EXISTS "terms_content";
  `)
}
