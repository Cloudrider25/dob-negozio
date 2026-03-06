import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_pages_page_key" ADD VALUE IF NOT EXISTS 'privacy';

    ALTER TABLE "pages"
      ADD COLUMN IF NOT EXISTS "service_navigator_step0_media_id" integer,
      ADD COLUMN IF NOT EXISTS "dob_protocol_diagnosi_media_id" integer,
      ADD COLUMN IF NOT EXISTS "dob_protocol_trattamenti_media_id" integer,
      ADD COLUMN IF NOT EXISTS "dob_protocol_routine_media_id" integer,
      ADD COLUMN IF NOT EXISTS "dob_protocol_check_up_media_id" integer;

    ALTER TABLE "pages_locales"
      ADD COLUMN IF NOT EXISTS "privacy_content" jsonb,
      ADD COLUMN IF NOT EXISTS "service_navigator_step0_heading" varchar,
      ADD COLUMN IF NOT EXISTS "service_navigator_step0_description" varchar,
      ADD COLUMN IF NOT EXISTS "service_navigator_step0_media_placeholder" varchar,
      ADD COLUMN IF NOT EXISTS "dob_protocol_diagnosi_title" varchar,
      ADD COLUMN IF NOT EXISTS "dob_protocol_diagnosi_description" varchar,
      ADD COLUMN IF NOT EXISTS "dob_protocol_trattamenti_title" varchar,
      ADD COLUMN IF NOT EXISTS "dob_protocol_trattamenti_description" varchar,
      ADD COLUMN IF NOT EXISTS "dob_protocol_routine_title" varchar,
      ADD COLUMN IF NOT EXISTS "dob_protocol_routine_description" varchar,
      ADD COLUMN IF NOT EXISTS "dob_protocol_check_up_title" varchar,
      ADD COLUMN IF NOT EXISTS "dob_protocol_check_up_description" varchar;

    CREATE INDEX IF NOT EXISTS "pages_service_navigator_service_navigator_step0_media_idx"
      ON "pages" ("service_navigator_step0_media_id");
    CREATE INDEX IF NOT EXISTS "pages_dob_protocol_diagnosi_dob_protocol_diagnosi_media_idx"
      ON "pages" ("dob_protocol_diagnosi_media_id");
    CREATE INDEX IF NOT EXISTS "pages_dob_protocol_trattamenti_dob_protocol_trattamenti__idx"
      ON "pages" ("dob_protocol_trattamenti_media_id");
    CREATE INDEX IF NOT EXISTS "pages_dob_protocol_routine_dob_protocol_routine_media_idx"
      ON "pages" ("dob_protocol_routine_media_id");
    CREATE INDEX IF NOT EXISTS "pages_dob_protocol_check_up_dob_protocol_check_up_media_idx"
      ON "pages" ("dob_protocol_check_up_media_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pages_service_navigator_step0_media_id_media_id_fk'
      ) THEN
        ALTER TABLE "pages"
          ADD CONSTRAINT "pages_service_navigator_step0_media_id_media_id_fk"
          FOREIGN KEY ("service_navigator_step0_media_id") REFERENCES "media"("id") ON DELETE SET NULL;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pages_dob_protocol_diagnosi_media_id_media_id_fk'
      ) THEN
        ALTER TABLE "pages"
          ADD CONSTRAINT "pages_dob_protocol_diagnosi_media_id_media_id_fk"
          FOREIGN KEY ("dob_protocol_diagnosi_media_id") REFERENCES "media"("id") ON DELETE SET NULL;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pages_dob_protocol_trattamenti_media_id_media_id_fk'
      ) THEN
        ALTER TABLE "pages"
          ADD CONSTRAINT "pages_dob_protocol_trattamenti_media_id_media_id_fk"
          FOREIGN KEY ("dob_protocol_trattamenti_media_id") REFERENCES "media"("id") ON DELETE SET NULL;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pages_dob_protocol_routine_media_id_media_id_fk'
      ) THEN
        ALTER TABLE "pages"
          ADD CONSTRAINT "pages_dob_protocol_routine_media_id_media_id_fk"
          FOREIGN KEY ("dob_protocol_routine_media_id") REFERENCES "media"("id") ON DELETE SET NULL;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pages_dob_protocol_check_up_media_id_media_id_fk'
      ) THEN
        ALTER TABLE "pages"
          ADD CONSTRAINT "pages_dob_protocol_check_up_media_id_media_id_fk"
          FOREIGN KEY ("dob_protocol_check_up_media_id") REFERENCES "media"("id") ON DELETE SET NULL;
      END IF;
    END $$;

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payload_locked_documents_rels'
          AND column_name = 'pages_id'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_pages_fk";

        DROP INDEX IF EXISTS "payload_locked_documents_rels_pages_id_idx";

        ALTER TABLE "payload_locked_documents_rels"
          DROP COLUMN IF EXISTS "pages_id";
      END IF;
    END $$;

  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages"
      DROP CONSTRAINT IF EXISTS "pages_service_navigator_step0_media_id_media_id_fk",
      DROP CONSTRAINT IF EXISTS "pages_dob_protocol_diagnosi_media_id_media_id_fk",
      DROP CONSTRAINT IF EXISTS "pages_dob_protocol_trattamenti_media_id_media_id_fk",
      DROP CONSTRAINT IF EXISTS "pages_dob_protocol_routine_media_id_media_id_fk",
      DROP CONSTRAINT IF EXISTS "pages_dob_protocol_check_up_media_id_media_id_fk";

    DROP INDEX IF EXISTS "pages_service_navigator_service_navigator_step0_media_idx";
    DROP INDEX IF EXISTS "pages_dob_protocol_diagnosi_dob_protocol_diagnosi_media_idx";
    DROP INDEX IF EXISTS "pages_dob_protocol_trattamenti_dob_protocol_trattamenti__idx";
    DROP INDEX IF EXISTS "pages_dob_protocol_routine_dob_protocol_routine_media_idx";
    DROP INDEX IF EXISTS "pages_dob_protocol_check_up_dob_protocol_check_up_media_idx";

    ALTER TABLE "pages"
      DROP COLUMN IF EXISTS "service_navigator_step0_media_id",
      DROP COLUMN IF EXISTS "dob_protocol_diagnosi_media_id",
      DROP COLUMN IF EXISTS "dob_protocol_trattamenti_media_id",
      DROP COLUMN IF EXISTS "dob_protocol_routine_media_id",
      DROP COLUMN IF EXISTS "dob_protocol_check_up_media_id";

    ALTER TABLE "pages_locales"
      DROP COLUMN IF EXISTS "privacy_content",
      DROP COLUMN IF EXISTS "service_navigator_step0_heading",
      DROP COLUMN IF EXISTS "service_navigator_step0_description",
      DROP COLUMN IF EXISTS "service_navigator_step0_media_placeholder",
      DROP COLUMN IF EXISTS "dob_protocol_diagnosi_title",
      DROP COLUMN IF EXISTS "dob_protocol_diagnosi_description",
      DROP COLUMN IF EXISTS "dob_protocol_trattamenti_title",
      DROP COLUMN IF EXISTS "dob_protocol_trattamenti_description",
      DROP COLUMN IF EXISTS "dob_protocol_routine_title",
      DROP COLUMN IF EXISTS "dob_protocol_routine_description",
      DROP COLUMN IF EXISTS "dob_protocol_check_up_title",
      DROP COLUMN IF EXISTS "dob_protocol_check_up_description";
  `)
}
