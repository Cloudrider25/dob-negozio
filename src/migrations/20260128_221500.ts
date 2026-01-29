import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_services_gender') THEN
        CREATE TYPE "enum_services_gender" AS ENUM ('unisex', 'female', 'male');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_services_modality') THEN
        CREATE TYPE "enum_services_modality" AS ENUM ('device', 'manual', 'laser', 'consultation', 'wax');
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "intents" (
      "id" serial PRIMARY KEY,
      "code" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "intents_code_idx" ON "intents" ("code");
    CREATE INDEX IF NOT EXISTS "intents_updated_at_idx" ON "intents" ("updated_at");
    CREATE INDEX IF NOT EXISTS "intents_created_at_idx" ON "intents" ("created_at");

    CREATE TABLE IF NOT EXISTS "intents_locales" (
      "label" varchar NOT NULL,
      "description" varchar,
      "id" serial PRIMARY KEY,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "intents_locales_locale_parent_id_unique"
      ON "intents_locales" ("_locale", "_parent_id");
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'intents_locales_parent_id_fk'
      ) THEN
        ALTER TABLE "intents_locales"
          ADD CONSTRAINT "intents_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "intents"("id") ON DELETE CASCADE;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "zones" (
      "id" serial PRIMARY KEY,
      "code" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "zones_code_idx" ON "zones" ("code");
    CREATE INDEX IF NOT EXISTS "zones_updated_at_idx" ON "zones" ("updated_at");
    CREATE INDEX IF NOT EXISTS "zones_created_at_idx" ON "zones" ("created_at");

    CREATE TABLE IF NOT EXISTS "zones_locales" (
      "label" varchar NOT NULL,
      "id" serial PRIMARY KEY,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "zones_locales_locale_parent_id_unique"
      ON "zones_locales" ("_locale", "_parent_id");
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'zones_locales_parent_id_fk'
      ) THEN
        ALTER TABLE "zones_locales"
          ADD CONSTRAINT "zones_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "zones"("id") ON DELETE CASCADE;
      END IF;
    END $$;

    ALTER TABLE "services"
      ADD COLUMN IF NOT EXISTS "objective_id" integer,
      ADD COLUMN IF NOT EXISTS "area_id" integer,
      ADD COLUMN IF NOT EXISTS "duration_minutes" numeric,
      ADD COLUMN IF NOT EXISTS "gender" "enum_services_gender",
      ADD COLUMN IF NOT EXISTS "modality" "enum_services_modality",
      ADD COLUMN IF NOT EXISTS "intent_id" integer,
      ADD COLUMN IF NOT EXISTS "zone_id" integer,
      ADD COLUMN IF NOT EXISTS "intent_code" varchar,
      ADD COLUMN IF NOT EXISTS "zone_code" varchar,
      ADD COLUMN IF NOT EXISTS "external_id" numeric;

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_objective_id_objectives_id_fk') THEN
        ALTER TABLE "services"
          ADD CONSTRAINT "services_objective_id_objectives_id_fk"
          FOREIGN KEY ("objective_id") REFERENCES "objectives"("id") ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_area_id_areas_id_fk') THEN
        ALTER TABLE "services"
          ADD CONSTRAINT "services_area_id_areas_id_fk"
          FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_intent_id_intents_id_fk') THEN
        ALTER TABLE "services"
          ADD CONSTRAINT "services_intent_id_intents_id_fk"
          FOREIGN KEY ("intent_id") REFERENCES "intents"("id") ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_zone_id_zones_id_fk') THEN
        ALTER TABLE "services"
          ADD CONSTRAINT "services_zone_id_zones_id_fk"
          FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "services_objective_idx" ON "services" ("objective_id");
    CREATE INDEX IF NOT EXISTS "services_area_idx" ON "services" ("area_id");
    CREATE INDEX IF NOT EXISTS "services_intent_idx" ON "services" ("intent_id");
    CREATE INDEX IF NOT EXISTS "services_zone_idx" ON "services" ("zone_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "services_external_id_idx" ON "services" ("external_id");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "intents_id" integer,
      ADD COLUMN IF NOT EXISTS "zones_id" integer;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_intents_id_idx"
      ON "payload_locked_documents_rels" ("intents_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_zones_id_idx"
      ON "payload_locked_documents_rels" ("zones_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_intents_fk') THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_intents_fk"
          FOREIGN KEY ("intents_id") REFERENCES "intents"("id") ON DELETE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_zones_fk') THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_zones_fk"
          FOREIGN KEY ("zones_id") REFERENCES "zones"("id") ON DELETE CASCADE;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Down migration intentionally left minimal.
  `)
}
