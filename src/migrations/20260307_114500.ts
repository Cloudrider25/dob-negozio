import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages"
      DROP CONSTRAINT IF EXISTS "pages_story_hero_home_media_id_media_id_fk",
      DROP CONSTRAINT IF EXISTS "pages_story_note_media_id_media_id_fk";

    DROP INDEX IF EXISTS "pages_story_hero_home_media_idx";
    DROP INDEX IF EXISTS "pages_story_note_media_idx";

    ALTER TABLE "pages"
      DROP COLUMN IF EXISTS "story_hero_home_media_id",
      DROP COLUMN IF EXISTS "story_note_media_id";

    ALTER TABLE "pages_locales"
      DROP COLUMN IF EXISTS "story_hero_home_title",
      DROP COLUMN IF EXISTS "story_hero_home_body",
      DROP COLUMN IF EXISTS "story_hero_home_cta_label",
      DROP COLUMN IF EXISTS "story_hero_home_cta_href",
      DROP COLUMN IF EXISTS "story_note_label",
      DROP COLUMN IF EXISTS "story_note_body",
      DROP COLUMN IF EXISTS "story_note_cta_label",
      DROP COLUMN IF EXISTS "story_note_cta_href";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages"
      ADD COLUMN IF NOT EXISTS "story_hero_home_media_id" integer,
      ADD COLUMN IF NOT EXISTS "story_note_media_id" integer;

    ALTER TABLE "pages_locales"
      ADD COLUMN IF NOT EXISTS "story_hero_home_title" varchar,
      ADD COLUMN IF NOT EXISTS "story_hero_home_body" varchar,
      ADD COLUMN IF NOT EXISTS "story_hero_home_cta_label" varchar,
      ADD COLUMN IF NOT EXISTS "story_hero_home_cta_href" varchar,
      ADD COLUMN IF NOT EXISTS "story_note_label" varchar,
      ADD COLUMN IF NOT EXISTS "story_note_body" varchar,
      ADD COLUMN IF NOT EXISTS "story_note_cta_label" varchar,
      ADD COLUMN IF NOT EXISTS "story_note_cta_href" varchar;

    CREATE INDEX IF NOT EXISTS "pages_story_hero_home_media_idx"
      ON "pages" ("story_hero_home_media_id");
    CREATE INDEX IF NOT EXISTS "pages_story_note_media_idx"
      ON "pages" ("story_note_media_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pages_story_hero_home_media_id_media_id_fk'
      ) THEN
        ALTER TABLE "pages"
          ADD CONSTRAINT "pages_story_hero_home_media_id_media_id_fk"
          FOREIGN KEY ("story_hero_home_media_id") REFERENCES "media"("id") ON DELETE SET NULL;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pages_story_note_media_id_media_id_fk'
      ) THEN
        ALTER TABLE "pages"
          ADD CONSTRAINT "pages_story_note_media_id_media_id_fk"
          FOREIGN KEY ("story_note_media_id") REFERENCES "media"("id") ON DELETE SET NULL;
      END IF;
    END $$;
  `)
}
