import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "routine_steps" (
      "id" serial PRIMARY KEY,
      "slug" varchar NOT NULL,
      "product_area_id" integer,
      "step_order_default" integer DEFAULT 0,
      "is_optional_default" boolean DEFAULT false,
      "active" boolean DEFAULT true,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "routine_steps_slug_idx" ON "routine_steps" ("slug");
    CREATE INDEX IF NOT EXISTS "routine_steps_product_area_idx" ON "routine_steps" ("product_area_id");
    CREATE INDEX IF NOT EXISTS "routine_steps_created_at_idx" ON "routine_steps" ("created_at");
    CREATE INDEX IF NOT EXISTS "routine_steps_updated_at_idx" ON "routine_steps" ("updated_at");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_steps_product_area_fk') THEN
        ALTER TABLE "routine_steps"
          ADD CONSTRAINT "routine_steps_product_area_fk"
          FOREIGN KEY ("product_area_id") REFERENCES "public"."product_areas"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "routine_steps_locales" (
      "name" varchar NOT NULL,
      "description" varchar,
      "id" serial PRIMARY KEY,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "routine_steps_locales_locale_parent_id_unique"
      ON "routine_steps_locales" ("_locale", "_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_steps_locales_parent_id_fk') THEN
        ALTER TABLE "routine_steps_locales"
          ADD CONSTRAINT "routine_steps_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."routine_steps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "routine_step_rules" (
      "id" serial PRIMARY KEY,
      "routine_step_id" integer NOT NULL,
      "timing_id" integer,
      "objective_id" integer,
      "skin_type_id" integer,
      "rule_type" varchar NOT NULL,
      "note" varchar,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "routine_step_rules_routine_step_idx" ON "routine_step_rules" ("routine_step_id");
    CREATE INDEX IF NOT EXISTS "routine_step_rules_timing_idx" ON "routine_step_rules" ("timing_id");
    CREATE INDEX IF NOT EXISTS "routine_step_rules_objective_idx" ON "routine_step_rules" ("objective_id");
    CREATE INDEX IF NOT EXISTS "routine_step_rules_skin_type_idx" ON "routine_step_rules" ("skin_type_id");
    CREATE INDEX IF NOT EXISTS "routine_step_rules_created_at_idx" ON "routine_step_rules" ("created_at");
    CREATE INDEX IF NOT EXISTS "routine_step_rules_updated_at_idx" ON "routine_step_rules" ("updated_at");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_step_rules_routine_step_fk') THEN
        ALTER TABLE "routine_step_rules"
          ADD CONSTRAINT "routine_step_rules_routine_step_fk"
          FOREIGN KEY ("routine_step_id") REFERENCES "public"."routine_steps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_step_rules_timing_fk') THEN
        ALTER TABLE "routine_step_rules"
          ADD CONSTRAINT "routine_step_rules_timing_fk"
          FOREIGN KEY ("timing_id") REFERENCES "public"."timing_products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_step_rules_objective_fk') THEN
        ALTER TABLE "routine_step_rules"
          ADD CONSTRAINT "routine_step_rules_objective_fk"
          FOREIGN KEY ("objective_id") REFERENCES "public"."objectives"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_step_rules_skin_type_fk') THEN
        ALTER TABLE "routine_step_rules"
          ADD CONSTRAINT "routine_step_rules_skin_type_fk"
          FOREIGN KEY ("skin_type_id") REFERENCES "public"."skin_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "routine_step_rules" DROP CONSTRAINT IF EXISTS "routine_step_rules_skin_type_fk";
    ALTER TABLE "routine_step_rules" DROP CONSTRAINT IF EXISTS "routine_step_rules_objective_fk";
    ALTER TABLE "routine_step_rules" DROP CONSTRAINT IF EXISTS "routine_step_rules_timing_fk";
    ALTER TABLE "routine_step_rules" DROP CONSTRAINT IF EXISTS "routine_step_rules_routine_step_fk";

    DROP INDEX IF EXISTS "routine_step_rules_updated_at_idx";
    DROP INDEX IF EXISTS "routine_step_rules_created_at_idx";
    DROP INDEX IF EXISTS "routine_step_rules_skin_type_idx";
    DROP INDEX IF EXISTS "routine_step_rules_objective_idx";
    DROP INDEX IF EXISTS "routine_step_rules_timing_idx";
    DROP INDEX IF EXISTS "routine_step_rules_routine_step_idx";

    DROP TABLE IF EXISTS "routine_step_rules";

    ALTER TABLE "routine_steps_locales" DROP CONSTRAINT IF EXISTS "routine_steps_locales_parent_id_fk";
    DROP INDEX IF EXISTS "routine_steps_locales_locale_parent_id_unique";
    DROP TABLE IF EXISTS "routine_steps_locales";

    ALTER TABLE "routine_steps" DROP CONSTRAINT IF EXISTS "routine_steps_product_area_fk";
    DROP INDEX IF EXISTS "routine_steps_updated_at_idx";
    DROP INDEX IF EXISTS "routine_steps_created_at_idx";
    DROP INDEX IF EXISTS "routine_steps_product_area_idx";
    DROP INDEX IF EXISTS "routine_steps_slug_idx";

    DROP TABLE IF EXISTS "routine_steps";
  `)
}
