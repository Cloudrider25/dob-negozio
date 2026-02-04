import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "routine_templates" (
      "id" serial PRIMARY KEY,
      "slug" varchar NOT NULL,
      "product_area_id" integer,
      "timing_id" integer,
      "objective_id" integer,
      "skin_type_id" integer,
      "is_multibrand" boolean DEFAULT false,
      "brand_id" integer,
      "brand_line_id" integer,
      "active" boolean DEFAULT true,
      "sort_order" integer DEFAULT 0,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "routine_templates_slug_idx" ON "routine_templates" ("slug");
    CREATE INDEX IF NOT EXISTS "routine_templates_product_area_idx" ON "routine_templates" ("product_area_id");
    CREATE INDEX IF NOT EXISTS "routine_templates_timing_idx" ON "routine_templates" ("timing_id");
    CREATE INDEX IF NOT EXISTS "routine_templates_objective_idx" ON "routine_templates" ("objective_id");
    CREATE INDEX IF NOT EXISTS "routine_templates_skin_type_idx" ON "routine_templates" ("skin_type_id");
    CREATE INDEX IF NOT EXISTS "routine_templates_brand_idx" ON "routine_templates" ("brand_id");
    CREATE INDEX IF NOT EXISTS "routine_templates_brand_line_idx" ON "routine_templates" ("brand_line_id");
    CREATE INDEX IF NOT EXISTS "routine_templates_created_at_idx" ON "routine_templates" ("created_at");
    CREATE INDEX IF NOT EXISTS "routine_templates_updated_at_idx" ON "routine_templates" ("updated_at");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_templates_product_area_fk') THEN
        ALTER TABLE "routine_templates"
          ADD CONSTRAINT "routine_templates_product_area_fk"
          FOREIGN KEY ("product_area_id") REFERENCES "public"."product_areas"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_templates_timing_fk') THEN
        ALTER TABLE "routine_templates"
          ADD CONSTRAINT "routine_templates_timing_fk"
          FOREIGN KEY ("timing_id") REFERENCES "public"."timing_products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_templates_objective_fk') THEN
        ALTER TABLE "routine_templates"
          ADD CONSTRAINT "routine_templates_objective_fk"
          FOREIGN KEY ("objective_id") REFERENCES "public"."objectives"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_templates_skin_type_fk') THEN
        ALTER TABLE "routine_templates"
          ADD CONSTRAINT "routine_templates_skin_type_fk"
          FOREIGN KEY ("skin_type_id") REFERENCES "public"."skin_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_templates_brand_fk') THEN
        ALTER TABLE "routine_templates"
          ADD CONSTRAINT "routine_templates_brand_fk"
          FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_templates_brand_line_fk') THEN
        ALTER TABLE "routine_templates"
          ADD CONSTRAINT "routine_templates_brand_line_fk"
          FOREIGN KEY ("brand_line_id") REFERENCES "public"."brand_lines"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "routine_templates_locales" (
      "name" varchar NOT NULL,
      "description" varchar,
      "id" serial PRIMARY KEY,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "routine_templates_locales_locale_parent_id_unique"
      ON "routine_templates_locales" ("_locale", "_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_templates_locales_parent_id_fk') THEN
        ALTER TABLE "routine_templates_locales"
          ADD CONSTRAINT "routine_templates_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."routine_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "routine_template_steps" (
      "id" serial PRIMARY KEY,
      "routine_template_id" integer NOT NULL,
      "routine_step_id" integer NOT NULL,
      "step_order" integer NOT NULL DEFAULT 0,
      "required" boolean DEFAULT true,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "routine_template_steps_template_idx" ON "routine_template_steps" ("routine_template_id");
    CREATE INDEX IF NOT EXISTS "routine_template_steps_step_idx" ON "routine_template_steps" ("routine_step_id");
    CREATE INDEX IF NOT EXISTS "routine_template_steps_created_at_idx" ON "routine_template_steps" ("created_at");
    CREATE INDEX IF NOT EXISTS "routine_template_steps_updated_at_idx" ON "routine_template_steps" ("updated_at");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_template_steps_template_fk') THEN
        ALTER TABLE "routine_template_steps"
          ADD CONSTRAINT "routine_template_steps_template_fk"
          FOREIGN KEY ("routine_template_id") REFERENCES "public"."routine_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_template_steps_step_fk') THEN
        ALTER TABLE "routine_template_steps"
          ADD CONSTRAINT "routine_template_steps_step_fk"
          FOREIGN KEY ("routine_step_id") REFERENCES "public"."routine_steps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "routine_template_step_products" (
      "id" serial PRIMARY KEY,
      "routine_template_id" integer NOT NULL,
      "routine_step_id" integer NOT NULL,
      "product_id" integer NOT NULL,
      "rank" integer DEFAULT 0,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "routine_template_step_products_template_idx" ON "routine_template_step_products" ("routine_template_id");
    CREATE INDEX IF NOT EXISTS "routine_template_step_products_step_idx" ON "routine_template_step_products" ("routine_step_id");
    CREATE INDEX IF NOT EXISTS "routine_template_step_products_product_idx" ON "routine_template_step_products" ("product_id");
    CREATE INDEX IF NOT EXISTS "routine_template_step_products_created_at_idx" ON "routine_template_step_products" ("created_at");
    CREATE INDEX IF NOT EXISTS "routine_template_step_products_updated_at_idx" ON "routine_template_step_products" ("updated_at");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_template_step_products_template_fk') THEN
        ALTER TABLE "routine_template_step_products"
          ADD CONSTRAINT "routine_template_step_products_template_fk"
          FOREIGN KEY ("routine_template_id") REFERENCES "public"."routine_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_template_step_products_step_fk') THEN
        ALTER TABLE "routine_template_step_products"
          ADD CONSTRAINT "routine_template_step_products_step_fk"
          FOREIGN KEY ("routine_step_id") REFERENCES "public"."routine_steps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_template_step_products_product_fk') THEN
        ALTER TABLE "routine_template_step_products"
          ADD CONSTRAINT "routine_template_step_products_product_fk"
          FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "exclusions" (
      "id" serial PRIMARY KEY,
      "severity" varchar NOT NULL,
      "reason" varchar,
      "objective_id" integer,
      "skin_type_id" integer,
      "timing_id" integer,
      "routine_step_id" integer,
      "product_id" integer,
      "brand_id" integer,
      "brand_line_id" integer,
      "attribute_id" integer,
      "attribute_value_id" integer,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "exclusions_objective_idx" ON "exclusions" ("objective_id");
    CREATE INDEX IF NOT EXISTS "exclusions_skin_type_idx" ON "exclusions" ("skin_type_id");
    CREATE INDEX IF NOT EXISTS "exclusions_timing_idx" ON "exclusions" ("timing_id");
    CREATE INDEX IF NOT EXISTS "exclusions_routine_step_idx" ON "exclusions" ("routine_step_id");
    CREATE INDEX IF NOT EXISTS "exclusions_product_idx" ON "exclusions" ("product_id");
    CREATE INDEX IF NOT EXISTS "exclusions_brand_idx" ON "exclusions" ("brand_id");
    CREATE INDEX IF NOT EXISTS "exclusions_brand_line_idx" ON "exclusions" ("brand_line_id");
    CREATE INDEX IF NOT EXISTS "exclusions_attribute_idx" ON "exclusions" ("attribute_id");
    CREATE INDEX IF NOT EXISTS "exclusions_attribute_value_idx" ON "exclusions" ("attribute_value_id");
    CREATE INDEX IF NOT EXISTS "exclusions_created_at_idx" ON "exclusions" ("created_at");
    CREATE INDEX IF NOT EXISTS "exclusions_updated_at_idx" ON "exclusions" ("updated_at");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exclusions_objective_fk') THEN
        ALTER TABLE "exclusions"
          ADD CONSTRAINT "exclusions_objective_fk"
          FOREIGN KEY ("objective_id") REFERENCES "public"."objectives"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exclusions_skin_type_fk') THEN
        ALTER TABLE "exclusions"
          ADD CONSTRAINT "exclusions_skin_type_fk"
          FOREIGN KEY ("skin_type_id") REFERENCES "public"."skin_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exclusions_timing_fk') THEN
        ALTER TABLE "exclusions"
          ADD CONSTRAINT "exclusions_timing_fk"
          FOREIGN KEY ("timing_id") REFERENCES "public"."timing_products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exclusions_routine_step_fk') THEN
        ALTER TABLE "exclusions"
          ADD CONSTRAINT "exclusions_routine_step_fk"
          FOREIGN KEY ("routine_step_id") REFERENCES "public"."routine_steps"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exclusions_product_fk') THEN
        ALTER TABLE "exclusions"
          ADD CONSTRAINT "exclusions_product_fk"
          FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exclusions_brand_fk') THEN
        ALTER TABLE "exclusions"
          ADD CONSTRAINT "exclusions_brand_fk"
          FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exclusions_brand_line_fk') THEN
        ALTER TABLE "exclusions"
          ADD CONSTRAINT "exclusions_brand_line_fk"
          FOREIGN KEY ("brand_line_id") REFERENCES "public"."brand_lines"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exclusions_attribute_fk') THEN
        ALTER TABLE "exclusions"
          ADD CONSTRAINT "exclusions_attribute_fk"
          FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

    END $$;

    CREATE TABLE IF NOT EXISTS "boosts" (
      "id" serial PRIMARY KEY,
      "score" integer NOT NULL DEFAULT 0,
      "objective_id" integer,
      "skin_type_id" integer,
      "timing_id" integer,
      "routine_step_id" integer,
      "product_id" integer,
      "brand_id" integer,
      "brand_line_id" integer,
      "attribute_id" integer,
      "attribute_value_id" integer,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "boosts_objective_idx" ON "boosts" ("objective_id");
    CREATE INDEX IF NOT EXISTS "boosts_skin_type_idx" ON "boosts" ("skin_type_id");
    CREATE INDEX IF NOT EXISTS "boosts_timing_idx" ON "boosts" ("timing_id");
    CREATE INDEX IF NOT EXISTS "boosts_routine_step_idx" ON "boosts" ("routine_step_id");
    CREATE INDEX IF NOT EXISTS "boosts_product_idx" ON "boosts" ("product_id");
    CREATE INDEX IF NOT EXISTS "boosts_brand_idx" ON "boosts" ("brand_id");
    CREATE INDEX IF NOT EXISTS "boosts_brand_line_idx" ON "boosts" ("brand_line_id");
    CREATE INDEX IF NOT EXISTS "boosts_attribute_idx" ON "boosts" ("attribute_id");
    CREATE INDEX IF NOT EXISTS "boosts_attribute_value_idx" ON "boosts" ("attribute_value_id");
    CREATE INDEX IF NOT EXISTS "boosts_created_at_idx" ON "boosts" ("created_at");
    CREATE INDEX IF NOT EXISTS "boosts_updated_at_idx" ON "boosts" ("updated_at");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'boosts_objective_fk') THEN
        ALTER TABLE "boosts"
          ADD CONSTRAINT "boosts_objective_fk"
          FOREIGN KEY ("objective_id") REFERENCES "public"."objectives"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'boosts_skin_type_fk') THEN
        ALTER TABLE "boosts"
          ADD CONSTRAINT "boosts_skin_type_fk"
          FOREIGN KEY ("skin_type_id") REFERENCES "public"."skin_types"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'boosts_timing_fk') THEN
        ALTER TABLE "boosts"
          ADD CONSTRAINT "boosts_timing_fk"
          FOREIGN KEY ("timing_id") REFERENCES "public"."timing_products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'boosts_routine_step_fk') THEN
        ALTER TABLE "boosts"
          ADD CONSTRAINT "boosts_routine_step_fk"
          FOREIGN KEY ("routine_step_id") REFERENCES "public"."routine_steps"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'boosts_product_fk') THEN
        ALTER TABLE "boosts"
          ADD CONSTRAINT "boosts_product_fk"
          FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'boosts_brand_fk') THEN
        ALTER TABLE "boosts"
          ADD CONSTRAINT "boosts_brand_fk"
          FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'boosts_brand_line_fk') THEN
        ALTER TABLE "boosts"
          ADD CONSTRAINT "boosts_brand_line_fk"
          FOREIGN KEY ("brand_line_id") REFERENCES "public"."brand_lines"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'boosts_attribute_fk') THEN
        ALTER TABLE "boosts"
          ADD CONSTRAINT "boosts_attribute_fk"
          FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "boosts" DROP CONSTRAINT IF EXISTS "boosts_attribute_value_fk";
    ALTER TABLE "boosts" DROP CONSTRAINT IF EXISTS "boosts_attribute_fk";
    ALTER TABLE "boosts" DROP CONSTRAINT IF EXISTS "boosts_brand_line_fk";
    ALTER TABLE "boosts" DROP CONSTRAINT IF EXISTS "boosts_brand_fk";
    ALTER TABLE "boosts" DROP CONSTRAINT IF EXISTS "boosts_product_fk";
    ALTER TABLE "boosts" DROP CONSTRAINT IF EXISTS "boosts_routine_step_fk";
    ALTER TABLE "boosts" DROP CONSTRAINT IF EXISTS "boosts_timing_fk";
    ALTER TABLE "boosts" DROP CONSTRAINT IF EXISTS "boosts_skin_type_fk";
    ALTER TABLE "boosts" DROP CONSTRAINT IF EXISTS "boosts_objective_fk";

    DROP INDEX IF EXISTS "boosts_updated_at_idx";
    DROP INDEX IF EXISTS "boosts_created_at_idx";
    DROP INDEX IF EXISTS "boosts_attribute_value_idx";
    DROP INDEX IF EXISTS "boosts_attribute_idx";
    DROP INDEX IF EXISTS "boosts_brand_line_idx";
    DROP INDEX IF EXISTS "boosts_brand_idx";
    DROP INDEX IF EXISTS "boosts_product_idx";
    DROP INDEX IF EXISTS "boosts_routine_step_idx";
    DROP INDEX IF EXISTS "boosts_timing_idx";
    DROP INDEX IF EXISTS "boosts_skin_type_idx";
    DROP INDEX IF EXISTS "boosts_objective_idx";

    DROP TABLE IF EXISTS "boosts";

    ALTER TABLE "exclusions" DROP CONSTRAINT IF EXISTS "exclusions_attribute_value_fk";
    ALTER TABLE "exclusions" DROP CONSTRAINT IF EXISTS "exclusions_attribute_fk";
    ALTER TABLE "exclusions" DROP CONSTRAINT IF EXISTS "exclusions_brand_line_fk";
    ALTER TABLE "exclusions" DROP CONSTRAINT IF EXISTS "exclusions_brand_fk";
    ALTER TABLE "exclusions" DROP CONSTRAINT IF EXISTS "exclusions_product_fk";
    ALTER TABLE "exclusions" DROP CONSTRAINT IF EXISTS "exclusions_routine_step_fk";
    ALTER TABLE "exclusions" DROP CONSTRAINT IF EXISTS "exclusions_timing_fk";
    ALTER TABLE "exclusions" DROP CONSTRAINT IF EXISTS "exclusions_skin_type_fk";
    ALTER TABLE "exclusions" DROP CONSTRAINT IF EXISTS "exclusions_objective_fk";

    DROP INDEX IF EXISTS "exclusions_updated_at_idx";
    DROP INDEX IF EXISTS "exclusions_created_at_idx";
    DROP INDEX IF EXISTS "exclusions_attribute_value_idx";
    DROP INDEX IF EXISTS "exclusions_attribute_idx";
    DROP INDEX IF EXISTS "exclusions_brand_line_idx";
    DROP INDEX IF EXISTS "exclusions_brand_idx";
    DROP INDEX IF EXISTS "exclusions_product_idx";
    DROP INDEX IF EXISTS "exclusions_routine_step_idx";
    DROP INDEX IF EXISTS "exclusions_timing_idx";
    DROP INDEX IF EXISTS "exclusions_skin_type_idx";
    DROP INDEX IF EXISTS "exclusions_objective_idx";

    DROP TABLE IF EXISTS "exclusions";

    ALTER TABLE "routine_template_step_products" DROP CONSTRAINT IF EXISTS "routine_template_step_products_product_fk";
    ALTER TABLE "routine_template_step_products" DROP CONSTRAINT IF EXISTS "routine_template_step_products_step_fk";
    ALTER TABLE "routine_template_step_products" DROP CONSTRAINT IF EXISTS "routine_template_step_products_template_fk";

    DROP INDEX IF EXISTS "routine_template_step_products_updated_at_idx";
    DROP INDEX IF EXISTS "routine_template_step_products_created_at_idx";
    DROP INDEX IF EXISTS "routine_template_step_products_product_idx";
    DROP INDEX IF EXISTS "routine_template_step_products_step_idx";
    DROP INDEX IF EXISTS "routine_template_step_products_template_idx";

    DROP TABLE IF EXISTS "routine_template_step_products";

    ALTER TABLE "routine_template_steps" DROP CONSTRAINT IF EXISTS "routine_template_steps_step_fk";
    ALTER TABLE "routine_template_steps" DROP CONSTRAINT IF EXISTS "routine_template_steps_template_fk";

    DROP INDEX IF EXISTS "routine_template_steps_updated_at_idx";
    DROP INDEX IF EXISTS "routine_template_steps_created_at_idx";
    DROP INDEX IF EXISTS "routine_template_steps_step_idx";
    DROP INDEX IF EXISTS "routine_template_steps_template_idx";

    DROP TABLE IF EXISTS "routine_template_steps";

    ALTER TABLE "routine_templates_locales" DROP CONSTRAINT IF EXISTS "routine_templates_locales_parent_id_fk";
    DROP INDEX IF EXISTS "routine_templates_locales_locale_parent_id_unique";
    DROP TABLE IF EXISTS "routine_templates_locales";

    ALTER TABLE "routine_templates" DROP CONSTRAINT IF EXISTS "routine_templates_brand_line_fk";
    ALTER TABLE "routine_templates" DROP CONSTRAINT IF EXISTS "routine_templates_brand_fk";
    ALTER TABLE "routine_templates" DROP CONSTRAINT IF EXISTS "routine_templates_skin_type_fk";
    ALTER TABLE "routine_templates" DROP CONSTRAINT IF EXISTS "routine_templates_objective_fk";
    ALTER TABLE "routine_templates" DROP CONSTRAINT IF EXISTS "routine_templates_timing_fk";
    ALTER TABLE "routine_templates" DROP CONSTRAINT IF EXISTS "routine_templates_product_area_fk";

    DROP INDEX IF EXISTS "routine_templates_updated_at_idx";
    DROP INDEX IF EXISTS "routine_templates_created_at_idx";
    DROP INDEX IF EXISTS "routine_templates_brand_line_idx";
    DROP INDEX IF EXISTS "routine_templates_brand_idx";
    DROP INDEX IF EXISTS "routine_templates_skin_type_idx";
    DROP INDEX IF EXISTS "routine_templates_objective_idx";
    DROP INDEX IF EXISTS "routine_templates_timing_idx";
    DROP INDEX IF EXISTS "routine_templates_product_area_idx";
    DROP INDEX IF EXISTS "routine_templates_slug_idx";

    DROP TABLE IF EXISTS "routine_templates";
  `)
}
