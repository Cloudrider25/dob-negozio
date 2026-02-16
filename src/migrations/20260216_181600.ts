import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    DECLARE
      constraint_name text;
    BEGIN
      SELECT c.conname
      INTO constraint_name
      FROM pg_constraint c
      JOIN pg_attribute a
        ON a.attrelid = c.conrelid
       AND a.attnum = ANY(c.conkey)
      WHERE c.conrelid = 'services'::regclass
        AND a.attname = 'treatment_id'
      LIMIT 1;

      IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE "services" DROP CONSTRAINT IF EXISTS %I', constraint_name);
      END IF;
    END $$;

    DROP INDEX IF EXISTS "services_treatment_idx";
    ALTER TABLE "services" DROP COLUMN IF EXISTS "treatment_id";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "treatment_id" integer;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'services_treatment_id_treatments_id_fk'
      ) THEN
        ALTER TABLE "services"
          ADD CONSTRAINT "services_treatment_id_treatments_id_fk"
          FOREIGN KEY ("treatment_id")
          REFERENCES "public"."treatments"("id")
          ON DELETE set null
          ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "services_treatment_idx" ON "services" ("treatment_id");
  `)
}
