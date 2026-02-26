import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "anagrafiche" (
      "id" serial PRIMARY KEY,
      "record_label" varchar,
      "customer_id" integer NOT NULL,
      "first_name" varchar,
      "last_name" varchar,
      "email" varchar,
      "phone" varchar,
      "general_notes" varchar,
      "last_assessment_date" timestamp(3) with time zone,
      "skin_type" varchar,
      "skin_sensitivity" varchar,
      "fitzpatrick" varchar,
      "hydration_level" numeric,
      "sebum_level" numeric,
      "elasticity_level" numeric,
      "acne_tendency" boolean DEFAULT false,
      "rosacea_tendency" boolean DEFAULT false,
      "hyperpigmentation_tendency" boolean DEFAULT false,
      "allergies" varchar,
      "contraindications" varchar,
      "medications" varchar,
      "pregnancy_or_breastfeeding" varchar,
      "home_care_routine" varchar,
      "treatment_goals" varchar,
      "esthetician_notes" varchar,
      "service_recommendations" varchar,
      "product_recommendations" varchar,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'anagrafiche_customer_id_users_id_fk'
      ) THEN
        ALTER TABLE "anagrafiche"
          ADD CONSTRAINT "anagrafiche_customer_id_users_id_fk"
          FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE SET NULL;
      END IF;
    END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "anagrafiche_customer_unique_idx" ON "anagrafiche" ("customer_id");
    CREATE INDEX IF NOT EXISTS "anagrafiche_customer_idx" ON "anagrafiche" ("customer_id");
    CREATE INDEX IF NOT EXISTS "anagrafiche_updated_at_idx" ON "anagrafiche" ("updated_at");
    CREATE INDEX IF NOT EXISTS "anagrafiche_created_at_idx" ON "anagrafiche" ("created_at");

    CREATE TABLE IF NOT EXISTS "anagrafiche_addresses" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "first_name" varchar,
      "last_name" varchar,
      "company" varchar,
      "street_address" varchar,
      "apartment" varchar,
      "postal_code" varchar,
      "city" varchar,
      "province" varchar,
      "country" varchar,
      "phone" varchar,
      "is_default" boolean DEFAULT false
    );

    CREATE INDEX IF NOT EXISTS "anagrafiche_addresses_order_idx" ON "anagrafiche_addresses" ("_order");
    CREATE INDEX IF NOT EXISTS "anagrafiche_addresses_parent_id_idx" ON "anagrafiche_addresses" ("_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'anagrafiche_addresses_parent_id_fk') THEN
        ALTER TABLE "anagrafiche_addresses"
          ADD CONSTRAINT "anagrafiche_addresses_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."anagrafiche"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "anagraficheID" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_anagrafiche_id_idx"
      ON "payload_locked_documents_rels" ("anagraficheID");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'payload_locked_documents_rels_anagrafiche_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_anagrafiche_fk"
          FOREIGN KEY ("anagraficheID")
          REFERENCES "public"."anagrafiche"("id")
          ON DELETE CASCADE
          ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_anagrafiche_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_anagrafiche_id_idx";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "anagraficheID";

    ALTER TABLE "anagrafiche_addresses" DROP CONSTRAINT IF EXISTS "anagrafiche_addresses_parent_id_fk";
    DROP INDEX IF EXISTS "anagrafiche_addresses_parent_id_idx";
    DROP INDEX IF EXISTS "anagrafiche_addresses_order_idx";
    DROP TABLE IF EXISTS "anagrafiche_addresses";

    ALTER TABLE "anagrafiche" DROP CONSTRAINT IF EXISTS "anagrafiche_customer_id_users_id_fk";
    DROP INDEX IF EXISTS "anagrafiche_customer_unique_idx";
    DROP INDEX IF EXISTS "anagrafiche_customer_idx";
    DROP INDEX IF EXISTS "anagrafiche_updated_at_idx";
    DROP INDEX IF EXISTS "anagrafiche_created_at_idx";
    DROP TABLE IF EXISTS "anagrafiche";
  `)
}

