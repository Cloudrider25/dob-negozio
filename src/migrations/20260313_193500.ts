import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      CREATE TYPE "public"."enum_email_templates_event_key" AS ENUM (
        'email_verification_requested',
        'user_registered',
        'user_verified',
        'password_reset_requested',
        'password_reset_completed',
        'login_success_admin_notice',
        'login_failed_admin_notice',
        'consultation_lead_created',
        'newsletter_service_created',
        'newsletter_product_created',
        'order_created',
        'order_paid',
        'order_payment_failed',
        'order_cancelled',
        'order_refunded',
        'appointment_requested',
        'appointment_alternative_proposed',
        'appointment_confirmed',
        'appointment_confirmed_by_customer',
        'appointment_cancelled',
        'shipment_created',
        'tracking_available',
        'email_delivery_failed'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_email_templates_locale" AS ENUM ('it', 'en', 'ru');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_email_templates_channel" AS ENUM ('customer', 'admin', 'internal');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_email_templates_template_type" AS ENUM (
        'auth',
        'lead',
        'newsletter',
        'order',
        'appointment',
        'shipping',
        'system'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    CREATE TABLE IF NOT EXISTS "email_templates" (
      "id" serial PRIMARY KEY NOT NULL,
      "template_key" varchar NOT NULL,
      "event_key" "public"."enum_email_templates_event_key" NOT NULL,
      "locale" "public"."enum_email_templates_locale" DEFAULT 'it' NOT NULL,
      "channel" "public"."enum_email_templates_channel" NOT NULL,
      "active" boolean DEFAULT true,
      "description" varchar,
      "subject" varchar NOT NULL,
      "html" varchar NOT NULL,
      "text" varchar,
      "available_variables" jsonb,
      "test_data_example" jsonb,
      "template_type" "public"."enum_email_templates_template_type",
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "email_templates_template_key_idx"
      ON "email_templates" ("template_key");
    CREATE INDEX IF NOT EXISTS "email_templates_event_key_idx"
      ON "email_templates" ("event_key");
    CREATE INDEX IF NOT EXISTS "email_templates_locale_idx"
      ON "email_templates" ("locale");
    CREATE INDEX IF NOT EXISTS "email_templates_channel_idx"
      ON "email_templates" ("channel");
    CREATE INDEX IF NOT EXISTS "email_templates_active_idx"
      ON "email_templates" ("active");
    CREATE INDEX IF NOT EXISTS "email_templates_template_type_idx"
      ON "email_templates" ("template_type");
    CREATE INDEX IF NOT EXISTS "email_templates_updated_at_idx"
      ON "email_templates" ("updated_at");
    CREATE INDEX IF NOT EXISTS "email_templates_created_at_idx"
      ON "email_templates" ("created_at");

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_email_delivery_events_event_key" AS ENUM (
        'email_verification_requested',
        'user_registered',
        'user_verified',
        'password_reset_requested',
        'password_reset_completed',
        'login_success_admin_notice',
        'login_failed_admin_notice',
        'consultation_lead_created',
        'newsletter_service_created',
        'newsletter_product_created',
        'order_created',
        'order_paid',
        'order_payment_failed',
        'order_cancelled',
        'order_refunded',
        'appointment_requested',
        'appointment_alternative_proposed',
        'appointment_confirmed',
        'appointment_confirmed_by_customer',
        'appointment_cancelled',
        'shipment_created',
        'tracking_available',
        'email_delivery_failed'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_email_delivery_events_channel" AS ENUM ('customer', 'admin', 'internal');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_email_delivery_events_locale" AS ENUM ('it', 'en', 'ru');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    DO $$
    BEGIN
      CREATE TYPE "public"."enum_email_delivery_events_status" AS ENUM ('queued', 'sent', 'failed', 'skipped');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;

    CREATE TABLE IF NOT EXISTS "email_delivery_events" (
      "id" serial PRIMARY KEY NOT NULL,
      "event_key" "public"."enum_email_delivery_events_event_key" NOT NULL,
      "channel" "public"."enum_email_delivery_events_channel" NOT NULL,
      "locale" "public"."enum_email_delivery_events_locale" DEFAULT 'it' NOT NULL,
      "to" varchar NOT NULL,
      "subject" varchar,
      "status" "public"."enum_email_delivery_events_status" DEFAULT 'queued' NOT NULL,
      "provider" varchar,
      "related_collection" varchar,
      "related_i_d" varchar,
      "error_message" varchar,
      "payload_snapshot" jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "email_delivery_events_event_key_idx"
      ON "email_delivery_events" ("event_key");
    CREATE INDEX IF NOT EXISTS "email_delivery_events_channel_idx"
      ON "email_delivery_events" ("channel");
    CREATE INDEX IF NOT EXISTS "email_delivery_events_locale_idx"
      ON "email_delivery_events" ("locale");
    CREATE INDEX IF NOT EXISTS "email_delivery_events_to_idx"
      ON "email_delivery_events" ("to");
    CREATE INDEX IF NOT EXISTS "email_delivery_events_status_idx"
      ON "email_delivery_events" ("status");
    CREATE INDEX IF NOT EXISTS "email_delivery_events_updated_at_idx"
      ON "email_delivery_events" ("updated_at");
    CREATE INDEX IF NOT EXISTS "email_delivery_events_created_at_idx"
      ON "email_delivery_events" ("created_at");

    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "email_delivery_policies" jsonb;

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "email_templates_id" integer,
      ADD COLUMN IF NOT EXISTS "email_delivery_events_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_email_templates_id_idx"
      ON "payload_locked_documents_rels" ("email_templates_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_email_delivery_events_id_idx"
      ON "payload_locked_documents_rels" ("email_delivery_events_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'payload_locked_documents_rels_email_templates_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_email_templates_fk"
          FOREIGN KEY ("email_templates_id") REFERENCES "public"."email_templates"("id") ON DELETE CASCADE;
      END IF;

      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'payload_locked_documents_rels_email_delivery_events_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_email_delivery_events_fk"
          FOREIGN KEY ("email_delivery_events_id") REFERENCES "public"."email_delivery_events"("id") ON DELETE CASCADE;
      END IF;
    END
    $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_email_templates_fk";

    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_email_delivery_events_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_email_templates_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_email_delivery_events_id_idx";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "email_templates_id",
      DROP COLUMN IF EXISTS "email_delivery_events_id";

    ALTER TABLE "site_settings"
      DROP COLUMN IF EXISTS "email_delivery_policies";

    DROP INDEX IF EXISTS "email_delivery_events_created_at_idx";
    DROP INDEX IF EXISTS "email_delivery_events_updated_at_idx";
    DROP INDEX IF EXISTS "email_delivery_events_status_idx";
    DROP INDEX IF EXISTS "email_delivery_events_to_idx";
    DROP INDEX IF EXISTS "email_delivery_events_locale_idx";
    DROP INDEX IF EXISTS "email_delivery_events_channel_idx";
    DROP INDEX IF EXISTS "email_delivery_events_event_key_idx";
    DROP TABLE IF EXISTS "email_delivery_events";

    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_email_delivery_events_status') THEN
        DROP TYPE "public"."enum_email_delivery_events_status";
      END IF;
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_email_delivery_events_locale') THEN
        DROP TYPE "public"."enum_email_delivery_events_locale";
      END IF;
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_email_delivery_events_channel') THEN
        DROP TYPE "public"."enum_email_delivery_events_channel";
      END IF;
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_email_delivery_events_event_key') THEN
        DROP TYPE "public"."enum_email_delivery_events_event_key";
      END IF;
    END
    $$;

    DROP INDEX IF EXISTS "email_templates_created_at_idx";
    DROP INDEX IF EXISTS "email_templates_updated_at_idx";
    DROP INDEX IF EXISTS "email_templates_template_type_idx";
    DROP INDEX IF EXISTS "email_templates_active_idx";
    DROP INDEX IF EXISTS "email_templates_channel_idx";
    DROP INDEX IF EXISTS "email_templates_locale_idx";
    DROP INDEX IF EXISTS "email_templates_event_key_idx";
    DROP INDEX IF EXISTS "email_templates_template_key_idx";
    DROP TABLE IF EXISTS "email_templates";

    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_email_templates_template_type') THEN
        DROP TYPE "public"."enum_email_templates_template_type";
      END IF;
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_email_templates_channel') THEN
        DROP TYPE "public"."enum_email_templates_channel";
      END IF;
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_email_templates_locale') THEN
        DROP TYPE "public"."enum_email_templates_locale";
      END IF;
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_email_templates_event_key') THEN
        DROP TYPE "public"."enum_email_templates_event_key";
      END IF;
    END
    $$;
  `)
}
