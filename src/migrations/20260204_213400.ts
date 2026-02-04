import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "brand_line_objective_priority" (
      "id" serial PRIMARY KEY,
      "brand_line_id" integer NOT NULL,
      "objective_id" integer NOT NULL,
      "score" integer NOT NULL DEFAULT 0,
      "note" varchar,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "brand_line_objective_priority_brand_line_idx" ON "brand_line_objective_priority" ("brand_line_id");
    CREATE INDEX IF NOT EXISTS "brand_line_objective_priority_objective_idx" ON "brand_line_objective_priority" ("objective_id");
    CREATE INDEX IF NOT EXISTS "brand_line_objective_priority_created_at_idx" ON "brand_line_objective_priority" ("created_at");
    CREATE INDEX IF NOT EXISTS "brand_line_objective_priority_updated_at_idx" ON "brand_line_objective_priority" ("updated_at");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brand_line_objective_priority_brand_line_fk') THEN
        ALTER TABLE "brand_line_objective_priority"
          ADD CONSTRAINT "brand_line_objective_priority_brand_line_fk"
          FOREIGN KEY ("brand_line_id") REFERENCES "public"."brand_lines"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brand_line_objective_priority_objective_fk') THEN
        ALTER TABLE "brand_line_objective_priority"
          ADD CONSTRAINT "brand_line_objective_priority_objective_fk"
          FOREIGN KEY ("objective_id") REFERENCES "public"."objectives"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "brand_line_objective_priority" DROP CONSTRAINT IF EXISTS "brand_line_objective_priority_objective_fk";
    ALTER TABLE "brand_line_objective_priority" DROP CONSTRAINT IF EXISTS "brand_line_objective_priority_brand_line_fk";

    DROP INDEX IF EXISTS "brand_line_objective_priority_updated_at_idx";
    DROP INDEX IF EXISTS "brand_line_objective_priority_created_at_idx";
    DROP INDEX IF EXISTS "brand_line_objective_priority_objective_idx";
    DROP INDEX IF EXISTS "brand_line_objective_priority_brand_line_idx";

    DROP TABLE IF EXISTS "brand_line_objective_priority";
  `)
}
