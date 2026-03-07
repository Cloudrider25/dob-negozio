import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      CREATE TYPE "public"."enum_service_decks_deck_type" AS ENUM ('laser', 'wax', 'other');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    CREATE TABLE IF NOT EXISTS "service_decks" (
      "id" serial PRIMARY KEY NOT NULL,
      "active" boolean DEFAULT true,
      "slug" varchar NOT NULL,
      "deck_type" "public"."enum_service_decks_deck_type" DEFAULT 'laser' NOT NULL,
      "sort_order" numeric DEFAULT 0,
      "cover_image_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "service_decks_locales" (
      "name" varchar NOT NULL,
      "cover_title" varchar,
      "cover_subtitle" varchar,
      "internal_description" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "public"."_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "service_decks_slug_idx"
      ON "service_decks" ("slug");
    CREATE INDEX IF NOT EXISTS "service_decks_cover_image_idx"
      ON "service_decks" ("cover_image_id");
    CREATE INDEX IF NOT EXISTS "service_decks_updated_at_idx"
      ON "service_decks" ("updated_at");
    CREATE INDEX IF NOT EXISTS "service_decks_created_at_idx"
      ON "service_decks" ("created_at");
    CREATE UNIQUE INDEX IF NOT EXISTS "service_decks_locales_locale_parent_id_unique"
      ON "service_decks_locales" ("_locale", "_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'service_decks_cover_image_id_media_id_fk'
      ) THEN
        ALTER TABLE "service_decks"
          ADD CONSTRAINT "service_decks_cover_image_id_media_id_fk"
          FOREIGN KEY ("cover_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'service_decks_locales_parent_id_fk'
      ) THEN
        ALTER TABLE "service_decks_locales"
          ADD CONSTRAINT "service_decks_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "service_decks"("id") ON DELETE CASCADE;
      END IF;
    END $$;

    ALTER TABLE "services"
      ADD COLUMN IF NOT EXISTS "deck_id" integer;

    CREATE INDEX IF NOT EXISTS "services_deck_idx"
      ON "services" ("deck_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'services_deck_id_service_decks_id_fk'
      ) THEN
        ALTER TABLE "services"
          ADD CONSTRAINT "services_deck_id_service_decks_id_fk"
          FOREIGN KEY ("deck_id") REFERENCES "service_decks"("id") ON DELETE SET NULL;
      END IF;
    END $$;

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "service_decks_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_service_decks_id_idx"
      ON "payload_locked_documents_rels" ("service_decks_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_service_decks_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_service_decks_fk"
          FOREIGN KEY ("service_decks_id") REFERENCES "service_decks"("id") ON DELETE CASCADE;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_service_decks_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_service_decks_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "service_decks_id";

    ALTER TABLE "services"
      DROP CONSTRAINT IF EXISTS "services_deck_id_service_decks_id_fk";
    DROP INDEX IF EXISTS "services_deck_idx";
    ALTER TABLE "services"
      DROP COLUMN IF EXISTS "deck_id";

    ALTER TABLE "service_decks_locales"
      DROP CONSTRAINT IF EXISTS "service_decks_locales_parent_id_fk";
    ALTER TABLE "service_decks"
      DROP CONSTRAINT IF EXISTS "service_decks_cover_image_id_media_id_fk";

    DROP INDEX IF EXISTS "service_decks_locales_locale_parent_id_unique";
    DROP INDEX IF EXISTS "service_decks_created_at_idx";
    DROP INDEX IF EXISTS "service_decks_updated_at_idx";
    DROP INDEX IF EXISTS "service_decks_cover_image_idx";
    DROP INDEX IF EXISTS "service_decks_slug_idx";

    DROP TABLE IF EXISTS "service_decks_locales";
    DROP TABLE IF EXISTS "service_decks";

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'enum_service_decks_deck_type'
      ) THEN
        DROP TYPE "public"."enum_service_decks_deck_type";
      END IF;
    END $$;
  `)
}
