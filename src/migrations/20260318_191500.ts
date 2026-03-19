import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_locales"
      ADD COLUMN IF NOT EXISTS "contact_title" varchar,
      ADD COLUMN IF NOT EXISTS "contact_description" jsonb;

    INSERT INTO "pages" ("page_key", "hero_title_mode", "hero_style", "updated_at", "created_at")
    SELECT
      'contact'::"public"."enum_pages_page_key",
      'fixed'::"public"."enum_pages_hero_title_mode",
      'style1'::"public"."enum_pages_hero_style",
      now(),
      now()
    WHERE NOT EXISTS (
      SELECT 1
      FROM "pages"
      WHERE "page_key" = 'contact'::"public"."enum_pages_page_key"
    );

    INSERT INTO "pages_locales" ("_locale", "_parent_id")
    SELECT
      'it'::"public"."_locales",
      p."id"
    FROM "pages" p
    WHERE p."page_key" = 'contact'::"public"."enum_pages_page_key"
      AND NOT EXISTS (
        SELECT 1
        FROM "pages_locales" pl
        WHERE pl."_parent_id" = p."id"
          AND pl."_locale" = 'it'::"public"."_locales"
      );
  `)

  await db.execute(sql`
    DO $$
    BEGIN
      CREATE TYPE "public"."enum_contact_requests_contact_reason" AS ENUM (
        'general',
        'booking',
        'order-support',
        'partnership'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_contact_requests_status" AS ENUM (
        'new',
        'in-progress',
        'closed'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "contact_requests" (
      "id" serial PRIMARY KEY NOT NULL,
      "first_name" varchar NOT NULL,
      "last_name" varchar NOT NULL,
      "email" varchar NOT NULL,
      "contact_reason" "public"."enum_contact_requests_contact_reason" NOT NULL,
      "topic" varchar NOT NULL,
      "message" varchar NOT NULL,
      "status" "public"."enum_contact_requests_status" DEFAULT 'new' NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "contact_requests_email_idx"
      ON "contact_requests" ("email");
    CREATE INDEX IF NOT EXISTS "contact_requests_contact_reason_idx"
      ON "contact_requests" ("contact_reason");
    CREATE INDEX IF NOT EXISTS "contact_requests_status_idx"
      ON "contact_requests" ("status");
    CREATE INDEX IF NOT EXISTS "contact_requests_updated_at_idx"
      ON "contact_requests" ("updated_at");
    CREATE INDEX IF NOT EXISTS "contact_requests_created_at_idx"
      ON "contact_requests" ("created_at");

    CREATE TABLE IF NOT EXISTS "contact_requests_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "media_id" integer
    );

    CREATE INDEX IF NOT EXISTS "contact_requests_rels_order_idx"
      ON "contact_requests_rels" ("order");
    CREATE INDEX IF NOT EXISTS "contact_requests_rels_parent_idx"
      ON "contact_requests_rels" ("parent_id");
    CREATE INDEX IF NOT EXISTS "contact_requests_rels_path_idx"
      ON "contact_requests_rels" ("path");
    CREATE INDEX IF NOT EXISTS "contact_requests_rels_media_id_idx"
      ON "contact_requests_rels" ("media_id");
  `)

  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'contact_requests_rels_parent_fk'
      ) THEN
        ALTER TABLE "contact_requests_rels"
          ADD CONSTRAINT "contact_requests_rels_parent_fk"
          FOREIGN KEY ("parent_id") REFERENCES "public"."contact_requests"("id") ON DELETE CASCADE;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'contact_requests_rels_media_fk'
      ) THEN
        ALTER TABLE "contact_requests_rels"
          ADD CONSTRAINT "contact_requests_rels_media_fk"
          FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE;
      END IF;
    END
    $$;
  `)

  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "contact_requests_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_contact_requests_id_idx"
      ON "payload_locked_documents_rels" ("contact_requests_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_contact_requests_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_contact_requests_fk"
          FOREIGN KEY ("contact_requests_id") REFERENCES "public"."contact_requests"("id") ON DELETE CASCADE;
      END IF;
    END
    $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_contact_requests_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_contact_requests_id_idx";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "contact_requests_id";

    ALTER TABLE "contact_requests_rels"
      DROP CONSTRAINT IF EXISTS "contact_requests_rels_parent_fk";

    ALTER TABLE "contact_requests_rels"
      DROP CONSTRAINT IF EXISTS "contact_requests_rels_media_fk";

    DROP INDEX IF EXISTS "contact_requests_rels_order_idx";
    DROP INDEX IF EXISTS "contact_requests_rels_parent_idx";
    DROP INDEX IF EXISTS "contact_requests_rels_path_idx";
    DROP INDEX IF EXISTS "contact_requests_rels_media_id_idx";
    DROP TABLE IF EXISTS "contact_requests_rels";

    DROP INDEX IF EXISTS "contact_requests_email_idx";
    DROP INDEX IF EXISTS "contact_requests_contact_reason_idx";
    DROP INDEX IF EXISTS "contact_requests_status_idx";
    DROP INDEX IF EXISTS "contact_requests_updated_at_idx";
    DROP INDEX IF EXISTS "contact_requests_created_at_idx";
    DROP TABLE IF EXISTS "contact_requests";

    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_contact_requests_status') THEN
        DROP TYPE "public"."enum_contact_requests_status";
      END IF;
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_contact_requests_contact_reason') THEN
        DROP TYPE "public"."enum_contact_requests_contact_reason";
      END IF;
    END
    $$;

    ALTER TABLE "pages_locales"
      DROP COLUMN IF EXISTS "contact_description",
      DROP COLUMN IF EXISTS "contact_title";
  `)
}
