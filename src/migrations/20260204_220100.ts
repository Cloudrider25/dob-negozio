import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "product_objectives_product_id_objective_id_unique"
      ON "product_objectives" ("product_id", "objective_id");

    CREATE UNIQUE INDEX IF NOT EXISTS "product_skin_types_product_id_skin_type_id_unique"
      ON "product_skin_types" ("product_id", "skin_type_id");

    CREATE UNIQUE INDEX IF NOT EXISTS "product_timings_product_id_timing_id_unique"
      ON "product_timings" ("product_id", "timing_id");

    CREATE UNIQUE INDEX IF NOT EXISTS "product_steps_product_id_routine_step_id_unique"
      ON "product_steps" ("product_id", "routine_step_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "product_steps_product_id_routine_step_id_unique";
    DROP INDEX IF EXISTS "product_timings_product_id_timing_id_unique";
    DROP INDEX IF EXISTS "product_skin_types_product_id_skin_type_id_unique";
    DROP INDEX IF EXISTS "product_objectives_product_id_objective_id_unique";
  `)
}
