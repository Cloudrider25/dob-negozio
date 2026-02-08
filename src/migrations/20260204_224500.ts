import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_rels" DROP CONSTRAINT IF EXISTS "products_rels_categories_fk";
    DROP INDEX IF EXISTS "products_rels_categories_id_idx";
    ALTER TABLE "products_rels" DROP COLUMN IF EXISTS "categories_id";

    ALTER TABLE "pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_categories_fk";
    DROP INDEX IF EXISTS "pages_rels_categories_id_idx";
    ALTER TABLE "pages_rels" DROP COLUMN IF EXISTS "categories_id";

    DROP TABLE IF EXISTS "categories_locales" CASCADE;
    DROP TABLE IF EXISTS "categories" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_rels" ADD COLUMN IF NOT EXISTS "categories_id" integer;
    CREATE INDEX IF NOT EXISTS "products_rels_categories_id_idx" ON "products_rels" ("categories_id");

    ALTER TABLE "pages_rels" ADD COLUMN IF NOT EXISTS "categories_id" integer;
    CREATE INDEX IF NOT EXISTS "pages_rels_categories_id_idx" ON "pages_rels" ("categories_id");
  `)
}
