import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      CREATE TYPE "public"."enum_checkout_attempts_status" AS ENUM (
        'pending',
        'paid',
        'failed',
        'cancelled',
        'expired',
        'converted'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_checkout_attempts_locale" AS ENUM ('it', 'en', 'ru');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_checkout_attempts_product_fulfillment_mode" AS ENUM (
        'shipping',
        'pickup',
        'none'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_checkout_attempts_appointment_mode" AS ENUM (
        'requested_slot',
        'contact_later',
        'none'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    CREATE TABLE IF NOT EXISTS "checkout_attempts" (
      "id" serial PRIMARY KEY NOT NULL,
      "checkout_fingerprint" varchar NOT NULL,
      "cart_signature" varchar NOT NULL,
      "status" "public"."enum_checkout_attempts_status" DEFAULT 'pending' NOT NULL,
      "payment_provider" varchar DEFAULT 'stripe' NOT NULL,
      "payment_reference" varchar,
      "locale" "public"."enum_checkout_attempts_locale" DEFAULT 'it' NOT NULL,
      "expires_at" timestamp(3) with time zone,
      "customer_id" integer,
      "customer_email" varchar NOT NULL,
      "customer_phone" varchar,
      "customer_first_name" varchar,
      "customer_last_name" varchar,
      "shipping_address" jsonb,
      "product_fulfillment_mode" "public"."enum_checkout_attempts_product_fulfillment_mode" DEFAULT 'none' NOT NULL,
      "appointment_mode" "public"."enum_checkout_attempts_appointment_mode" DEFAULT 'none' NOT NULL,
      "appointment_requested_date" timestamp(3) with time zone,
      "appointment_requested_time" varchar,
      "subtotal" numeric,
      "shipping_amount" numeric,
      "discount_amount" numeric,
      "commission_amount" numeric,
      "total" numeric,
      "promo_code_id" integer,
      "partner_id" integer,
      "promo_code_value" varchar,
      "promo_code_snapshot" jsonb,
      "items_snapshot" jsonb NOT NULL,
      "product_items" jsonb,
      "service_items" jsonb,
      "inventory_reserved" boolean DEFAULT false,
      "inventory_released" boolean DEFAULT false,
      "order_id" integer,
      "converted_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "checkout_attempts_checkout_fingerprint_idx"
      ON "checkout_attempts" ("checkout_fingerprint");
    CREATE INDEX IF NOT EXISTS "checkout_attempts_cart_signature_idx"
      ON "checkout_attempts" ("cart_signature");
    CREATE INDEX IF NOT EXISTS "checkout_attempts_status_idx"
      ON "checkout_attempts" ("status");
    CREATE INDEX IF NOT EXISTS "checkout_attempts_payment_reference_idx"
      ON "checkout_attempts" ("payment_reference");
    CREATE INDEX IF NOT EXISTS "checkout_attempts_expires_at_idx"
      ON "checkout_attempts" ("expires_at");
    CREATE INDEX IF NOT EXISTS "checkout_attempts_customer_email_idx"
      ON "checkout_attempts" ("customer_email");
    CREATE INDEX IF NOT EXISTS "checkout_attempts_created_at_idx"
      ON "checkout_attempts" ("created_at");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'checkout_attempts_customer_id_users_id_fk'
      ) THEN
        ALTER TABLE "checkout_attempts"
          ADD CONSTRAINT "checkout_attempts_customer_id_users_id_fk"
          FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'checkout_attempts_promo_code_id_promo_codes_id_fk'
      ) THEN
        ALTER TABLE "checkout_attempts"
          ADD CONSTRAINT "checkout_attempts_promo_code_id_promo_codes_id_fk"
          FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE SET NULL;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'checkout_attempts_partner_id_users_id_fk'
      ) THEN
        ALTER TABLE "checkout_attempts"
          ADD CONSTRAINT "checkout_attempts_partner_id_users_id_fk"
          FOREIGN KEY ("partner_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'checkout_attempts_order_id_orders_id_fk'
      ) THEN
        ALTER TABLE "checkout_attempts"
          ADD CONSTRAINT "checkout_attempts_order_id_orders_id_fk"
          FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;
      END IF;
    END
    $$;

    ALTER TABLE "shop_webhook_events"
      ADD COLUMN IF NOT EXISTS "checkout_attempt_id" integer;

    CREATE INDEX IF NOT EXISTS "shop_webhook_events_checkout_attempt_idx"
      ON "shop_webhook_events" ("checkout_attempt_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'shop_webhook_events_checkout_attempt_id_checkout_attempts_id_fk'
      ) THEN
        ALTER TABLE "shop_webhook_events"
          ADD CONSTRAINT "shop_webhook_events_checkout_attempt_id_checkout_attempts_id_fk"
          FOREIGN KEY ("checkout_attempt_id") REFERENCES "public"."checkout_attempts"("id") ON DELETE SET NULL;
      END IF;
    END
    $$;

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "checkout_attempts_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_checkout_attempts_id_idx"
      ON "payload_locked_documents_rels" ("checkout_attempts_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_checkout_attempts_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_checkout_attempts_fk"
          FOREIGN KEY ("checkout_attempts_id") REFERENCES "public"."checkout_attempts"("id") ON DELETE CASCADE;
      END IF;
    END
    $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_checkout_attempts_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_checkout_attempts_id_idx";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "checkout_attempts_id";

    ALTER TABLE "shop_webhook_events"
      DROP CONSTRAINT IF EXISTS "shop_webhook_events_checkout_attempt_id_checkout_attempts_id_fk";

    DROP INDEX IF EXISTS "shop_webhook_events_checkout_attempt_idx";

    ALTER TABLE "shop_webhook_events"
      DROP COLUMN IF EXISTS "checkout_attempt_id";

    ALTER TABLE "checkout_attempts"
      DROP CONSTRAINT IF EXISTS "checkout_attempts_customer_id_users_id_fk",
      DROP CONSTRAINT IF EXISTS "checkout_attempts_promo_code_id_promo_codes_id_fk",
      DROP CONSTRAINT IF EXISTS "checkout_attempts_partner_id_users_id_fk",
      DROP CONSTRAINT IF EXISTS "checkout_attempts_order_id_orders_id_fk";

    DROP INDEX IF EXISTS "checkout_attempts_checkout_fingerprint_idx";
    DROP INDEX IF EXISTS "checkout_attempts_cart_signature_idx";
    DROP INDEX IF EXISTS "checkout_attempts_status_idx";
    DROP INDEX IF EXISTS "checkout_attempts_payment_reference_idx";
    DROP INDEX IF EXISTS "checkout_attempts_expires_at_idx";
    DROP INDEX IF EXISTS "checkout_attempts_customer_email_idx";
    DROP INDEX IF EXISTS "checkout_attempts_created_at_idx";

    DROP TABLE IF EXISTS "checkout_attempts";

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_checkout_attempts_appointment_mode'
      ) THEN
        DROP TYPE "public"."enum_checkout_attempts_appointment_mode";
      END IF;

      IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_checkout_attempts_product_fulfillment_mode'
      ) THEN
        DROP TYPE "public"."enum_checkout_attempts_product_fulfillment_mode";
      END IF;

      IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_checkout_attempts_locale'
      ) THEN
        DROP TYPE "public"."enum_checkout_attempts_locale";
      END IF;

      IF EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_checkout_attempts_status'
      ) THEN
        DROP TYPE "public"."enum_checkout_attempts_status";
      END IF;
    END
    $$;
  `)
}
