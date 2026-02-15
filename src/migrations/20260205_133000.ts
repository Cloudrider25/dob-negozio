import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- routine_templates: objective -> need
    ALTER TABLE "routine_templates" ADD COLUMN IF NOT EXISTS "need_id" integer;
    ALTER TABLE "routine_templates" DROP CONSTRAINT IF EXISTS "routine_templates_objective_fk";
    DROP INDEX IF EXISTS "routine_templates_objective_idx";
    ALTER TABLE "routine_templates" DROP COLUMN IF EXISTS "objective_id";
    CREATE INDEX IF NOT EXISTS "routine_templates_need_idx" ON "routine_templates" ("need_id");
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_templates_need_fk') THEN
        ALTER TABLE "routine_templates"
          ADD CONSTRAINT "routine_templates_need_fk"
          FOREIGN KEY ("need_id") REFERENCES "public"."needs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;

    -- unique composite indexes
    CREATE UNIQUE INDEX IF NOT EXISTS "brand_line_needs_priority_brand_line_id_need_id_unique"
      ON "brand_line_needs_priority" ("brand_line_id", "need_id");

    CREATE UNIQUE INDEX IF NOT EXISTS "routine_steps_product_area_id_slug_unique"
      ON "routine_steps" ("product_area_id", "slug");

    CREATE UNIQUE INDEX IF NOT EXISTS "brand_lines_brand_id_slug_unique"
      ON "brand_lines" ("brand_id", "slug");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- rollback unique indexes
    DROP INDEX IF EXISTS "brand_lines_brand_id_slug_unique";
    DROP INDEX IF EXISTS "routine_steps_product_area_id_slug_unique";
    DROP INDEX IF EXISTS "brand_line_needs_priority_brand_line_id_need_id_unique";

    -- routine_templates: need -> objective
    ALTER TABLE "routine_templates" DROP CONSTRAINT IF EXISTS "routine_templates_need_fk";
    DROP INDEX IF EXISTS "routine_templates_need_idx";
    ALTER TABLE "routine_templates" ADD COLUMN IF NOT EXISTS "objective_id" integer;
    ALTER TABLE "routine_templates" DROP COLUMN IF EXISTS "need_id";
    CREATE INDEX IF NOT EXISTS "routine_templates_objective_idx" ON "routine_templates" ("objective_id");
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routine_templates_objective_fk') THEN
        ALTER TABLE "routine_templates"
          ADD CONSTRAINT "routine_templates_objective_fk"
          FOREIGN KEY ("objective_id") REFERENCES "public"."objectives"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}
