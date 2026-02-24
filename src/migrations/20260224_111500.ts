import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_order_service_items_item_kind') THEN
        CREATE TYPE "enum_order_service_items_item_kind" AS ENUM ('service', 'package');
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "order_service_items" (
      "id" serial PRIMARY KEY,
      "order_id" integer NOT NULL,
      "service_id" integer NOT NULL,
      "item_kind" "enum_order_service_items_item_kind" NOT NULL DEFAULT 'service',
      "variant_key" varchar,
      "variant_label" varchar,
      "service_title" varchar NOT NULL,
      "service_slug" varchar,
      "duration_minutes" numeric,
      "sessions" numeric,
      "currency" varchar NOT NULL DEFAULT 'EUR',
      "unit_price" numeric NOT NULL,
      "quantity" numeric NOT NULL,
      "line_total" numeric NOT NULL,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'order_service_items_order_id_orders_id_fk'
      ) THEN
        ALTER TABLE "order_service_items"
          ADD CONSTRAINT "order_service_items_order_id_orders_id_fk"
          FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'order_service_items_service_id_services_id_fk'
      ) THEN
        ALTER TABLE "order_service_items"
          ADD CONSTRAINT "order_service_items_service_id_services_id_fk"
          FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "order_service_items_order_idx" ON "order_service_items" ("order_id");
    CREATE INDEX IF NOT EXISTS "order_service_items_service_idx" ON "order_service_items" ("service_id");
    CREATE INDEX IF NOT EXISTS "order_service_items_updated_at_idx" ON "order_service_items" ("updated_at");
    CREATE INDEX IF NOT EXISTS "order_service_items_created_at_idx" ON "order_service_items" ("created_at");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "order-service-itemsID" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_service_items_id_idx"
      ON "payload_locked_documents_rels" ("order-service-itemsID");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'payload_locked_documents_rels_order-service-items_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_order-service-items_fk"
          FOREIGN KEY ("order-service-itemsID")
          REFERENCES "public"."order_service_items"("id")
          ON DELETE CASCADE
          ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_order-service-items_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_order_service_items_id_idx";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "order-service-itemsID";

    DROP INDEX IF EXISTS "order_service_items_order_idx";
    DROP INDEX IF EXISTS "order_service_items_service_idx";
    DROP INDEX IF EXISTS "order_service_items_updated_at_idx";
    DROP INDEX IF EXISTS "order_service_items_created_at_idx";

    DROP TABLE IF EXISTS "order_service_items";

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        WHERE c.relname = 'order_service_items'
      ) THEN
        DROP TYPE IF EXISTS "enum_order_service_items_item_kind";
      END IF;
    END $$;
  `)
}

