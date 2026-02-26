import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_order_service_sessions_item_kind') THEN
        CREATE TYPE "enum_order_service_sessions_item_kind" AS ENUM ('service', 'package');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_order_service_sessions_appointment_mode') THEN
        CREATE TYPE "enum_order_service_sessions_appointment_mode" AS ENUM ('none', 'requested_slot', 'contact_later');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_order_service_sessions_appointment_status') THEN
        CREATE TYPE "enum_order_service_sessions_appointment_status" AS ENUM ('none', 'pending', 'confirmed', 'alternative_proposed', 'confirmed_by_customer');
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "order_service_sessions" (
      "id" serial PRIMARY KEY,
      "order_id" integer NOT NULL,
      "order_service_item_id" integer NOT NULL,
      "service_id" integer NOT NULL,
      "item_kind" "enum_order_service_sessions_item_kind" NOT NULL DEFAULT 'service',
      "variant_key" varchar,
      "variant_label" varchar,
      "session_index" numeric NOT NULL,
      "session_label" varchar NOT NULL,
      "sessions_total" numeric,
      "appointment_mode" "enum_order_service_sessions_appointment_mode" DEFAULT 'none',
      "appointment_status" "enum_order_service_sessions_appointment_status" DEFAULT 'none',
      "appointment_requested_date" timestamp(3) with time zone,
      "appointment_requested_time" varchar,
      "appointment_proposed_date" timestamp(3) with time zone,
      "appointment_proposed_time" varchar,
      "appointment_proposal_note" varchar,
      "appointment_confirmed_at" timestamp(3) with time zone,
      "service_title" varchar NOT NULL,
      "service_slug" varchar,
      "duration_minutes" numeric,
      "currency" varchar NOT NULL DEFAULT 'EUR',
      "session_price" numeric NOT NULL,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'order_service_sessions_order_id_orders_id_fk'
      ) THEN
        ALTER TABLE "order_service_sessions"
          ADD CONSTRAINT "order_service_sessions_order_id_orders_id_fk"
          FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'order_service_sessions_order_service_item_id_order_service_items_id_fk'
      ) THEN
        ALTER TABLE "order_service_sessions"
          ADD CONSTRAINT "order_service_sessions_order_service_item_id_order_service_items_id_fk"
          FOREIGN KEY ("order_service_item_id") REFERENCES "order_service_items"("id") ON DELETE CASCADE;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'order_service_sessions_service_id_services_id_fk'
      ) THEN
        ALTER TABLE "order_service_sessions"
          ADD CONSTRAINT "order_service_sessions_service_id_services_id_fk"
          FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "order_service_sessions_order_idx" ON "order_service_sessions" ("order_id");
    CREATE INDEX IF NOT EXISTS "order_service_sessions_item_idx" ON "order_service_sessions" ("order_service_item_id");
    CREATE INDEX IF NOT EXISTS "order_service_sessions_service_idx" ON "order_service_sessions" ("service_id");
    CREATE INDEX IF NOT EXISTS "order_service_sessions_updated_at_idx" ON "order_service_sessions" ("updated_at");
    CREATE INDEX IF NOT EXISTS "order_service_sessions_created_at_idx" ON "order_service_sessions" ("created_at");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "order-service-sessionsID" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_service_sessions_id_idx"
      ON "payload_locked_documents_rels" ("order-service-sessionsID");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_order-service-sessions_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_order-service-sessions_fk"
          FOREIGN KEY ("order-service-sessionsID")
          REFERENCES "public"."order_service_sessions"("id")
          ON DELETE CASCADE
          ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_order-service-sessions_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_order_service_sessions_id_idx";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "order-service-sessionsID";

    DROP INDEX IF EXISTS "order_service_sessions_order_idx";
    DROP INDEX IF EXISTS "order_service_sessions_item_idx";
    DROP INDEX IF EXISTS "order_service_sessions_service_idx";
    DROP INDEX IF EXISTS "order_service_sessions_updated_at_idx";
    DROP INDEX IF EXISTS "order_service_sessions_created_at_idx";

    DROP TABLE IF EXISTS "order_service_sessions";

    DROP TYPE IF EXISTS "enum_order_service_sessions_item_kind";
    DROP TYPE IF EXISTS "enum_order_service_sessions_appointment_mode";
    DROP TYPE IF EXISTS "enum_order_service_sessions_appointment_status";
  `)
}

