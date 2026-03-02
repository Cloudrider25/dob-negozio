import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products_rels') THEN
        ALTER TABLE "products_rels" DROP CONSTRAINT IF EXISTS "products_rels_categories_fk";
        ALTER TABLE "products_rels" DROP COLUMN IF EXISTS "categories_id";
      END IF;
    END $$;
    DROP INDEX IF EXISTS "products_rels_categories_id_idx";

    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages_rels') THEN
        ALTER TABLE "pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_categories_fk";
        ALTER TABLE "pages_rels" DROP COLUMN IF EXISTS "categories_id";
      END IF;
    END $$;
    DROP INDEX IF EXISTS "pages_rels_categories_id_idx";

    DROP TABLE IF EXISTS "categories_locales" CASCADE;
    DROP TABLE IF EXISTS "categories" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products_rels') THEN
        ALTER TABLE "products_rels" ADD COLUMN IF NOT EXISTS "categories_id" integer;
        CREATE INDEX IF NOT EXISTS "products_rels_categories_id_idx" ON "products_rels" ("categories_id");
      END IF;
    END $$;

    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages_rels') THEN
        ALTER TABLE "pages_rels" ADD COLUMN IF NOT EXISTS "categories_id" integer;
        CREATE INDEX IF NOT EXISTS "pages_rels_categories_id_idx" ON "pages_rels" ("categories_id");
      END IF;
    END $$;
  `)
}
