import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_pages_page_key" ADD VALUE IF NOT EXISTS 'faq';

    ALTER TABLE "pages_locales"
      ADD COLUMN IF NOT EXISTS "faq_title" varchar,
      ADD COLUMN IF NOT EXISTS "faq_subtitle" varchar;

    CREATE TABLE IF NOT EXISTS "pages_faq_groups" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_locale" "public"."_locales" NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "title" varchar
    );

    CREATE INDEX IF NOT EXISTS "pages_faq_groups_order_idx" ON "pages_faq_groups" ("_order");
    CREATE INDEX IF NOT EXISTS "pages_faq_groups_parent_id_idx" ON "pages_faq_groups" ("_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_faq_groups_parent_id_fk') THEN
        ALTER TABLE "pages_faq_groups"
          ADD CONSTRAINT "pages_faq_groups_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "pages_faq_groups_items" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "_locale" "public"."_locales" NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "q" varchar NOT NULL,
      "a" jsonb NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "pages_faq_groups_items_order_idx" ON "pages_faq_groups_items" ("_order");
    CREATE INDEX IF NOT EXISTS "pages_faq_groups_items_parent_id_idx" ON "pages_faq_groups_items" ("_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_faq_groups_items_parent_id_fk') THEN
        ALTER TABLE "pages_faq_groups_items"
          ADD CONSTRAINT "pages_faq_groups_items_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_faq_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    INSERT INTO "pages" ("page_key", "hero_title_mode", "hero_style", "updated_at", "created_at")
    SELECT
      'faq'::"public"."enum_pages_page_key",
      'fixed'::"public"."enum_pages_hero_title_mode",
      'style1'::"public"."enum_pages_hero_style",
      now(),
      now()
    WHERE NOT EXISTS (
      SELECT 1
      FROM "pages"
      WHERE "page_key" = 'faq'::"public"."enum_pages_page_key"
    );

    INSERT INTO "pages_locales" ("_locale", "_parent_id")
    SELECT
      'it'::"public"."_locales",
      p."id"
    FROM "pages" p
    WHERE p."page_key" = 'faq'::"public"."enum_pages_page_key"
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
    ALTER TABLE "pages_faq_groups_items" DROP CONSTRAINT IF EXISTS "pages_faq_groups_items_parent_id_fk";
    DROP INDEX IF EXISTS "pages_faq_groups_items_parent_id_idx";
    DROP INDEX IF EXISTS "pages_faq_groups_items_order_idx";
    DROP TABLE IF EXISTS "pages_faq_groups_items";

    ALTER TABLE "pages_faq_groups" DROP CONSTRAINT IF EXISTS "pages_faq_groups_parent_id_fk";
    DROP INDEX IF EXISTS "pages_faq_groups_parent_id_idx";
    DROP INDEX IF EXISTS "pages_faq_groups_order_idx";
    DROP TABLE IF EXISTS "pages_faq_groups";

    DELETE FROM "pages_locales"
    WHERE "_parent_id" IN (
      SELECT "id"
      FROM "pages"
      WHERE "page_key" = 'faq'::"public"."enum_pages_page_key"
    );

    DELETE FROM "pages"
    WHERE "page_key" = 'faq'::"public"."enum_pages_page_key";

    ALTER TABLE "pages_locales"
      DROP COLUMN IF EXISTS "faq_subtitle",
      DROP COLUMN IF EXISTS "faq_title";
  `)
}
