import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "needs" ADD COLUMN IF NOT EXISTS "product_area_id" integer;

    CREATE INDEX IF NOT EXISTS "needs_product_area_idx" ON "needs" ("product_area_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'needs_product_area_fk') THEN
        ALTER TABLE "needs"
          ADD CONSTRAINT "needs_product_area_fk"
          FOREIGN KEY ("product_area_id") REFERENCES "public"."product_areas"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "needs" DROP CONSTRAINT IF EXISTS "needs_product_area_fk";
    DROP INDEX IF EXISTS "needs_product_area_idx";
    ALTER TABLE "needs" DROP COLUMN IF EXISTS "product_area_id";
  `)
}
