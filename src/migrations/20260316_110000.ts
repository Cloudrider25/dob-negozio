import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      CREATE TYPE "public"."enum_product_waitlists_locale" AS ENUM ('it', 'en', 'ru');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_product_waitlists_status" AS ENUM ('active', 'notified', 'cancelled');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    CREATE TABLE IF NOT EXISTS "product_waitlists" (
      "id" serial PRIMARY KEY NOT NULL,
      "customer_id" integer NOT NULL,
      "product_id" integer NOT NULL,
      "locale" "public"."enum_product_waitlists_locale" DEFAULT 'it' NOT NULL,
      "status" "public"."enum_product_waitlists_status" DEFAULT 'active' NOT NULL,
      "customer_email" varchar NOT NULL,
      "customer_first_name" varchar,
      "customer_last_name" varchar,
      "product_title" varchar NOT NULL,
      "product_slug" varchar NOT NULL,
      "product_brand" varchar,
      "notified_at" timestamp(3) with time zone,
      "last_availability_at" timestamp(3) with time zone,
      "notification_error" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "product_waitlists_customer_idx"
      ON "product_waitlists" ("customer_id");
    CREATE INDEX IF NOT EXISTS "product_waitlists_product_idx"
      ON "product_waitlists" ("product_id");
    CREATE INDEX IF NOT EXISTS "product_waitlists_locale_idx"
      ON "product_waitlists" ("locale");
    CREATE INDEX IF NOT EXISTS "product_waitlists_status_idx"
      ON "product_waitlists" ("status");
    CREATE INDEX IF NOT EXISTS "product_waitlists_customer_email_idx"
      ON "product_waitlists" ("customer_email");
    CREATE INDEX IF NOT EXISTS "product_waitlists_updated_at_idx"
      ON "product_waitlists" ("updated_at");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'product_waitlists_customer_id_users_id_fk'
      ) THEN
        ALTER TABLE "product_waitlists"
          ADD CONSTRAINT "product_waitlists_customer_id_users_id_fk"
          FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'product_waitlists_product_id_products_id_fk'
      ) THEN
        ALTER TABLE "product_waitlists"
          ADD CONSTRAINT "product_waitlists_product_id_products_id_fk"
          FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;
      END IF;
    END
    $$;

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "product_waitlists_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_product_waitlists_id_idx"
      ON "payload_locked_documents_rels" ("product_waitlists_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_product_waitlists_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_product_waitlists_fk"
          FOREIGN KEY ("product_waitlists_id") REFERENCES "public"."product_waitlists"("id") ON DELETE CASCADE;
      END IF;
    END
    $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_product_waitlists_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_product_waitlists_id_idx";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "product_waitlists_id";

    ALTER TABLE "product_waitlists"
      DROP CONSTRAINT IF EXISTS "product_waitlists_customer_id_users_id_fk",
      DROP CONSTRAINT IF EXISTS "product_waitlists_product_id_products_id_fk";

    DROP INDEX IF EXISTS "product_waitlists_customer_idx";
    DROP INDEX IF EXISTS "product_waitlists_product_idx";
    DROP INDEX IF EXISTS "product_waitlists_locale_idx";
    DROP INDEX IF EXISTS "product_waitlists_status_idx";
    DROP INDEX IF EXISTS "product_waitlists_customer_email_idx";
    DROP INDEX IF EXISTS "product_waitlists_updated_at_idx";

    DROP TABLE IF EXISTS "product_waitlists";

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_product_waitlists_status'
      ) THEN
        DROP TYPE "public"."enum_product_waitlists_status";
      END IF;

      IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_product_waitlists_locale'
      ) THEN
        DROP TYPE "public"."enum_product_waitlists_locale";
      END IF;
    END
    $$;
  `)
}
