import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_rels" DROP CONSTRAINT IF EXISTS "products_rels_lines_fk";
    DROP INDEX IF EXISTS "products_rels_lines_id_idx";
    ALTER TABLE "products_rels" DROP COLUMN IF EXISTS "lines_id";

    ALTER TABLE "pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_lines_fk";
    DROP INDEX IF EXISTS "pages_rels_lines_id_idx";
    ALTER TABLE "pages_rels" DROP COLUMN IF EXISTS "lines_id";

    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_lines_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_lines_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "lines_id";

    DROP TABLE IF EXISTS "lines_locales" CASCADE;
    DROP TABLE IF EXISTS "lines" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_rels" ADD COLUMN IF NOT EXISTS "lines_id" integer;
    CREATE INDEX IF NOT EXISTS "products_rels_lines_id_idx" ON "products_rels" ("lines_id");

    ALTER TABLE "pages_rels" ADD COLUMN IF NOT EXISTS "lines_id" integer;
    CREATE INDEX IF NOT EXISTS "pages_rels_lines_id_idx" ON "pages_rels" ("lines_id");

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "lines_id" integer;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_lines_id_idx" ON "payload_locked_documents_rels" ("lines_id");
  `)
}
