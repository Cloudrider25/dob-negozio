import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_locales"
      ADD COLUMN IF NOT EXISTS "routine_builder_step1_description" varchar,
      ADD COLUMN IF NOT EXISTS "routine_builder_step2_description" varchar;

    ALTER TABLE "services"
      ADD COLUMN IF NOT EXISTS "related_program_id" integer;

    CREATE INDEX IF NOT EXISTS "services_related_program_idx"
      ON "services" ("related_program_id");

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'services_related_program_id_programs_id_fk'
      ) THEN
        ALTER TABLE "services"
          ADD CONSTRAINT "services_related_program_id_programs_id_fk"
          FOREIGN KEY ("related_program_id") REFERENCES "programs"("id") ON DELETE SET NULL;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services"
      DROP CONSTRAINT IF EXISTS "services_related_program_id_programs_id_fk";

    DROP INDEX IF EXISTS "services_related_program_idx";

    ALTER TABLE "services"
      DROP COLUMN IF EXISTS "related_program_id";

    ALTER TABLE "pages_locales"
      DROP COLUMN IF EXISTS "routine_builder_step1_description",
      DROP COLUMN IF EXISTS "routine_builder_step2_description";
  `)
}
