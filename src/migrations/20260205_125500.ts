import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- product_skin_types
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_skin_types') THEN
        DROP INDEX IF EXISTS "product_skin_types_product_id_skin_type_id_unique";
        DROP INDEX IF EXISTS "product_skin_types_updated_at_idx";
        DROP INDEX IF EXISTS "product_skin_types_created_at_idx";
        DROP INDEX IF EXISTS "product_skin_types_skin_type_idx";
        DROP INDEX IF EXISTS "product_skin_types_product_idx";
        ALTER TABLE "product_skin_types" DROP CONSTRAINT IF EXISTS "product_skin_types_skin_type_fk";
        ALTER TABLE "product_skin_types" DROP CONSTRAINT IF EXISTS "product_skin_types_product_fk";
        DROP TABLE IF EXISTS "product_skin_types";
      END IF;
    END $$;

    -- product_timings
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_timings') THEN
        DROP INDEX IF EXISTS "product_timings_product_id_timing_id_unique";
        DROP INDEX IF EXISTS "product_timings_updated_at_idx";
        DROP INDEX IF EXISTS "product_timings_created_at_idx";
        DROP INDEX IF EXISTS "product_timings_timing_idx";
        DROP INDEX IF EXISTS "product_timings_product_idx";
        ALTER TABLE "product_timings" DROP CONSTRAINT IF EXISTS "product_timings_timing_fk";
        ALTER TABLE "product_timings" DROP CONSTRAINT IF EXISTS "product_timings_product_fk";
        DROP TABLE IF EXISTS "product_timings";
      END IF;
    END $$;

    -- product_steps
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_steps') THEN
        DROP INDEX IF EXISTS "product_steps_product_id_routine_step_id_unique";
        DROP INDEX IF EXISTS "product_steps_updated_at_idx";
        DROP INDEX IF EXISTS "product_steps_created_at_idx";
        DROP INDEX IF EXISTS "product_steps_routine_step_idx";
        DROP INDEX IF EXISTS "product_steps_product_idx";
        ALTER TABLE "product_steps" DROP CONSTRAINT IF EXISTS "product_steps_routine_step_fk";
        ALTER TABLE "product_steps" DROP CONSTRAINT IF EXISTS "product_steps_product_fk";
        DROP TABLE IF EXISTS "product_steps";
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "product_skin_types" (
      "id" serial PRIMARY KEY,
      "product_id" integer,
      "skin_type_id" integer,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "product_skin_types_product_idx" ON "product_skin_types" ("product_id");
    CREATE INDEX IF NOT EXISTS "product_skin_types_skin_type_idx" ON "product_skin_types" ("skin_type_id");
    CREATE INDEX IF NOT EXISTS "product_skin_types_created_at_idx" ON "product_skin_types" ("created_at");
    CREATE INDEX IF NOT EXISTS "product_skin_types_updated_at_idx" ON "product_skin_types" ("updated_at");
    CREATE UNIQUE INDEX IF NOT EXISTS "product_skin_types_product_id_skin_type_id_unique"
      ON "product_skin_types" ("product_id", "skin_type_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_skin_types_product_fk') THEN
        ALTER TABLE "product_skin_types"
          ADD CONSTRAINT "product_skin_types_product_fk"
          FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_skin_types_skin_type_fk') THEN
        ALTER TABLE "product_skin_types"
          ADD CONSTRAINT "product_skin_types_skin_type_fk"
          FOREIGN KEY ("skin_type_id") REFERENCES "public"."skin_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "product_timings" (
      "id" serial PRIMARY KEY,
      "product_id" integer,
      "timing_id" integer,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "product_timings_product_idx" ON "product_timings" ("product_id");
    CREATE INDEX IF NOT EXISTS "product_timings_timing_idx" ON "product_timings" ("timing_id");
    CREATE INDEX IF NOT EXISTS "product_timings_created_at_idx" ON "product_timings" ("created_at");
    CREATE INDEX IF NOT EXISTS "product_timings_updated_at_idx" ON "product_timings" ("updated_at");
    CREATE UNIQUE INDEX IF NOT EXISTS "product_timings_product_id_timing_id_unique"
      ON "product_timings" ("product_id", "timing_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_timings_product_fk') THEN
        ALTER TABLE "product_timings"
          ADD CONSTRAINT "product_timings_product_fk"
          FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_timings_timing_fk') THEN
        ALTER TABLE "product_timings"
          ADD CONSTRAINT "product_timings_timing_fk"
          FOREIGN KEY ("timing_id") REFERENCES "public"."timing_products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "product_steps" (
      "id" serial PRIMARY KEY,
      "product_id" integer,
      "routine_step_id" integer,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "product_steps_product_idx" ON "product_steps" ("product_id");
    CREATE INDEX IF NOT EXISTS "product_steps_routine_step_idx" ON "product_steps" ("routine_step_id");
    CREATE INDEX IF NOT EXISTS "product_steps_created_at_idx" ON "product_steps" ("created_at");
    CREATE INDEX IF NOT EXISTS "product_steps_updated_at_idx" ON "product_steps" ("updated_at");
    CREATE UNIQUE INDEX IF NOT EXISTS "product_steps_product_id_routine_step_id_unique"
      ON "product_steps" ("product_id", "routine_step_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_steps_product_fk') THEN
        ALTER TABLE "product_steps"
          ADD CONSTRAINT "product_steps_product_fk"
          FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_steps_routine_step_fk') THEN
        ALTER TABLE "product_steps"
          ADD CONSTRAINT "product_steps_routine_step_fk"
          FOREIGN KEY ("routine_step_id") REFERENCES "public"."routine_steps"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}
