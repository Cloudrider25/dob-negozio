import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_pages_page_key" ADD VALUE IF NOT EXISTS 'programs';

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_programs_discount_type" AS ENUM ('percent', 'amount');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    ALTER TABLE "programs"
      ADD COLUMN IF NOT EXISTS "base_price" numeric,
      ADD COLUMN IF NOT EXISTS "discount_type" "public"."enum_programs_discount_type" DEFAULT 'percent',
      ADD COLUMN IF NOT EXISTS "discount_value" numeric DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true,
      DROP COLUMN IF EXISTS "currency";

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'enum_programs_currency'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND udt_name = 'enum_programs_currency'
      ) THEN
        DROP TYPE "public"."enum_programs_currency";
      END IF;
    END
    $$;

    ALTER TABLE "products_rels"
      ADD COLUMN IF NOT EXISTS "routine_steps_id" integer;

    CREATE INDEX IF NOT EXISTS "products_rels_routine_steps_id_idx"
      ON "products_rels" ("routine_steps_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'products_rels_routine_steps_fk'
      ) THEN
        ALTER TABLE "products_rels"
          ADD CONSTRAINT "products_rels_routine_steps_fk"
          FOREIGN KEY ("routine_steps_id") REFERENCES "public"."routine_steps"("id") ON DELETE CASCADE;
      END IF;
    END
    $$;

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "routine_steps_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_routine_steps_id_idx"
      ON "payload_locked_documents_rels" ("routine_steps_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'payload_locked_documents_rels_routine_steps_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_routine_steps_fk"
          FOREIGN KEY ("routine_steps_id") REFERENCES "public"."routine_steps"("id") ON DELETE CASCADE;
      END IF;
    END
    $$;

    ALTER TYPE "public"."enum_order_service_items_item_kind" ADD VALUE IF NOT EXISTS 'program';
    ALTER TYPE "public"."enum_order_service_sessions_item_kind" ADD VALUE IF NOT EXISTS 'program';

    ALTER TABLE "order_service_items"
      ALTER COLUMN "service_id" DROP NOT NULL,
      ADD COLUMN IF NOT EXISTS "program_id" integer;

    CREATE INDEX IF NOT EXISTS "order_service_items_program_idx"
      ON "order_service_items" ("program_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'order_service_items_program_id_programs_id_fk'
      ) THEN
        ALTER TABLE "order_service_items"
          ADD CONSTRAINT "order_service_items_program_id_programs_id_fk"
          FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE SET NULL;
      END IF;
    END
    $$;

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_order_service_items_program_steps_snapshot_step_type" AS ENUM ('manual', 'service', 'product');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    CREATE TABLE IF NOT EXISTS "order_service_items_program_steps_snapshot" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "step_type" "public"."enum_order_service_items_program_steps_snapshot_step_type",
      "title" varchar,
      "reference_title" varchar,
      "reference_slug" varchar
    );

    CREATE INDEX IF NOT EXISTS "order_service_items_program_steps_snapshot_order_idx"
      ON "order_service_items_program_steps_snapshot" ("_order");
    CREATE INDEX IF NOT EXISTS "order_service_items_program_steps_snapshot_parent_id_idx"
      ON "order_service_items_program_steps_snapshot" ("_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'order_service_items_program_steps_snapshot_parent_id_fk'
      ) THEN
        ALTER TABLE "order_service_items_program_steps_snapshot"
          ADD CONSTRAINT "order_service_items_program_steps_snapshot_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."order_service_items"("id") ON DELETE CASCADE;
      END IF;
    END
    $$;

    ALTER TABLE "order_service_sessions"
      ALTER COLUMN "service_id" DROP NOT NULL,
      ADD COLUMN IF NOT EXISTS "program_id" integer;

    CREATE INDEX IF NOT EXISTS "order_service_sessions_program_idx"
      ON "order_service_sessions" ("program_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'order_service_sessions_program_id_programs_id_fk'
      ) THEN
        ALTER TABLE "order_service_sessions"
          ADD CONSTRAINT "order_service_sessions_program_id_programs_id_fk"
          FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE SET NULL;
      END IF;
    END
    $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "order_service_items_program_steps_snapshot_parent_id_idx";
    DROP INDEX IF EXISTS "order_service_items_program_steps_snapshot_order_idx";
    DROP TABLE IF EXISTS "order_service_items_program_steps_snapshot";

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'enum_order_service_items_program_steps_snapshot_step_type'
      ) THEN
        DROP TYPE "public"."enum_order_service_items_program_steps_snapshot_step_type";
      END IF;
    END
    $$;

    DELETE FROM "order_service_sessions"
    WHERE "program_id" IS NOT NULL;

    ALTER TABLE "order_service_sessions"
      DROP CONSTRAINT IF EXISTS "order_service_sessions_program_id_programs_id_fk";

    DROP INDEX IF EXISTS "order_service_sessions_program_idx";

    ALTER TABLE "order_service_sessions"
      DROP COLUMN IF EXISTS "program_id";

    ALTER TABLE "order_service_sessions"
      ALTER COLUMN "service_id" SET NOT NULL;

    DELETE FROM "order_service_items"
    WHERE "program_id" IS NOT NULL;

    ALTER TABLE "order_service_items"
      DROP CONSTRAINT IF EXISTS "order_service_items_program_id_programs_id_fk";

    DROP INDEX IF EXISTS "order_service_items_program_idx";

    ALTER TABLE "order_service_items"
      DROP COLUMN IF EXISTS "program_id";

    ALTER TABLE "order_service_items"
      ALTER COLUMN "service_id" SET NOT NULL;

    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_routine_steps_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_routine_steps_id_idx";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "routine_steps_id";

    ALTER TABLE "products_rels"
      DROP CONSTRAINT IF EXISTS "products_rels_routine_steps_fk";

    DROP INDEX IF EXISTS "products_rels_routine_steps_id_idx";

    ALTER TABLE "products_rels"
      DROP COLUMN IF EXISTS "routine_steps_id";

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'enum_programs_currency'
      ) THEN
        CREATE TYPE "public"."enum_programs_currency" AS ENUM ('EUR', 'USD');
      END IF;
    END
    $$;

    ALTER TABLE "programs"
      ADD COLUMN IF NOT EXISTS "currency" "public"."enum_programs_currency" DEFAULT 'EUR',
      DROP COLUMN IF EXISTS "base_price",
      DROP COLUMN IF EXISTS "discount_type",
      DROP COLUMN IF EXISTS "discount_value",
      DROP COLUMN IF EXISTS "active";

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'enum_programs_discount_type'
      ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND udt_name = 'enum_programs_discount_type'
      ) THEN
        DROP TYPE "public"."enum_programs_discount_type";
      END IF;
    END
    $$;
  `)
}
