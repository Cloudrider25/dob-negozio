import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "services_category_id_treatments_id_fk";
    DROP INDEX IF EXISTS "services_category_idx";
    ALTER TABLE "services" DROP COLUMN IF EXISTS "category_id";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "category_id" integer;

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_category_id_treatments_id_fk') THEN
        ALTER TABLE "services"
          ADD CONSTRAINT "services_category_id_treatments_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."treatments"("id") ON DELETE SET NULL ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "services_category_idx" ON "services" ("category_id");
  `)
}
