import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'services_external_id_idx') THEN
        DROP INDEX "services_external_id_idx";
      END IF;
    END $$;

    ALTER TABLE "services"
      DROP COLUMN IF EXISTS "external_id";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services"
      ADD COLUMN IF NOT EXISTS "external_id" numeric;

    CREATE UNIQUE INDEX IF NOT EXISTS "services_external_id_idx" ON "services" ("external_id");
  `)
}
