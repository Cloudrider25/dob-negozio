import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_users_roles" ADD VALUE IF NOT EXISTS 'partner';

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_promo_codes_discount_type" AS ENUM ('percent', 'amount');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_promo_codes_commission_type" AS ENUM ('percent', 'amount');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_orders_commission_status" AS ENUM ('pending', 'approved', 'paid', 'void');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    CREATE TABLE IF NOT EXISTS "promo_codes" (
      "id" serial PRIMARY KEY NOT NULL,
      "code" varchar NOT NULL,
      "active" boolean DEFAULT true,
      "internal_label" varchar,
      "partner_id" integer NOT NULL,
      "discount_type" "public"."enum_promo_codes_discount_type" NOT NULL,
      "discount_value" numeric NOT NULL,
      "commission_type" "public"."enum_promo_codes_commission_type" NOT NULL,
      "commission_value" numeric NOT NULL,
      "applies_to_products" boolean DEFAULT true,
      "applies_to_services" boolean DEFAULT true,
      "starts_at" timestamp(3) with time zone,
      "ends_at" timestamp(3) with time zone,
      "usage_limit" numeric,
      "notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "promo_codes_code_idx"
      ON "promo_codes" ("code");
    CREATE INDEX IF NOT EXISTS "promo_codes_partner_idx"
      ON "promo_codes" ("partner_id");
    CREATE INDEX IF NOT EXISTS "promo_codes_updated_at_idx"
      ON "promo_codes" ("updated_at");
    CREATE INDEX IF NOT EXISTS "promo_codes_created_at_idx"
      ON "promo_codes" ("created_at");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'promo_codes_partner_id_users_id_fk'
      ) THEN
        ALTER TABLE "promo_codes"
          ADD CONSTRAINT "promo_codes_partner_id_users_id_fk"
          FOREIGN KEY ("partner_id") REFERENCES "users"("id") ON DELETE SET NULL;
      END IF;
    END $$;

    ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "commission_amount" numeric DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "promo_code_id" integer,
      ADD COLUMN IF NOT EXISTS "partner_id" integer,
      ADD COLUMN IF NOT EXISTS "promo_code_value" varchar,
      ADD COLUMN IF NOT EXISTS "commission_status" "public"."enum_orders_commission_status",
      ADD COLUMN IF NOT EXISTS "promo_code_snapshot_code" varchar,
      ADD COLUMN IF NOT EXISTS "promo_code_snapshot_partner_name" varchar,
      ADD COLUMN IF NOT EXISTS "promo_code_snapshot_discount_type" varchar,
      ADD COLUMN IF NOT EXISTS "promo_code_snapshot_discount_value" numeric,
      ADD COLUMN IF NOT EXISTS "promo_code_snapshot_commission_type" varchar,
      ADD COLUMN IF NOT EXISTS "promo_code_snapshot_commission_value" numeric,
      ADD COLUMN IF NOT EXISTS "promo_code_snapshot_applies_to_products" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "promo_code_snapshot_applies_to_services" boolean DEFAULT false;

    CREATE INDEX IF NOT EXISTS "orders_promo_code_idx"
      ON "orders" ("promo_code_id");
    CREATE INDEX IF NOT EXISTS "orders_partner_idx"
      ON "orders" ("partner_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_promo_code_id_promo_codes_id_fk'
      ) THEN
        ALTER TABLE "orders"
          ADD CONSTRAINT "orders_promo_code_id_promo_codes_id_fk"
          FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE SET NULL;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_partner_id_users_id_fk'
      ) THEN
        ALTER TABLE "orders"
          ADD CONSTRAINT "orders_partner_id_users_id_fk"
          FOREIGN KEY ("partner_id") REFERENCES "users"("id") ON DELETE SET NULL;
      END IF;
    END $$;

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "promo_codes_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_promo_codes_id_idx"
      ON "payload_locked_documents_rels" ("promo_codes_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_promo_codes_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_promo_codes_fk"
          FOREIGN KEY ("promo_codes_id") REFERENCES "promo_codes"("id") ON DELETE CASCADE;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_promo_codes_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_promo_codes_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "promo_codes_id";

    ALTER TABLE "orders"
      DROP CONSTRAINT IF EXISTS "orders_promo_code_id_promo_codes_id_fk",
      DROP CONSTRAINT IF EXISTS "orders_partner_id_users_id_fk";
    DROP INDEX IF EXISTS "orders_promo_code_idx";
    DROP INDEX IF EXISTS "orders_partner_idx";
    ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "commission_amount",
      DROP COLUMN IF EXISTS "promo_code_id",
      DROP COLUMN IF EXISTS "partner_id",
      DROP COLUMN IF EXISTS "promo_code_value",
      DROP COLUMN IF EXISTS "commission_status",
      DROP COLUMN IF EXISTS "promo_code_snapshot_code",
      DROP COLUMN IF EXISTS "promo_code_snapshot_partner_name",
      DROP COLUMN IF EXISTS "promo_code_snapshot_discount_type",
      DROP COLUMN IF EXISTS "promo_code_snapshot_discount_value",
      DROP COLUMN IF EXISTS "promo_code_snapshot_commission_type",
      DROP COLUMN IF EXISTS "promo_code_snapshot_commission_value",
      DROP COLUMN IF EXISTS "promo_code_snapshot_applies_to_products",
      DROP COLUMN IF EXISTS "promo_code_snapshot_applies_to_services";

    ALTER TABLE "promo_codes"
      DROP CONSTRAINT IF EXISTS "promo_codes_partner_id_users_id_fk";
    DROP INDEX IF EXISTS "promo_codes_code_idx";
    DROP INDEX IF EXISTS "promo_codes_partner_idx";
    DROP INDEX IF EXISTS "promo_codes_updated_at_idx";
    DROP INDEX IF EXISTS "promo_codes_created_at_idx";
    DROP TABLE IF EXISTS "promo_codes";

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_orders_commission_status'
      ) THEN
        DROP TYPE "public"."enum_orders_commission_status";
      END IF;

      IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_promo_codes_commission_type'
      ) THEN
        DROP TYPE "public"."enum_promo_codes_commission_type";
      END IF;

      IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_promo_codes_discount_type'
      ) THEN
        DROP TYPE "public"."enum_promo_codes_discount_type";
      END IF;
    END $$;
  `)
}
