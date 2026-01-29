import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_makeup_collection_id_makeup_collections_id_fk";
    DROP INDEX IF EXISTS "products_makeup_collection_idx";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "makeup_collection_id";

    ALTER TABLE "products_rels" DROP CONSTRAINT IF EXISTS "products_rels_routine_steps_fk";
    DROP INDEX IF EXISTS "products_rels_routine_steps_id_idx";
    ALTER TABLE "products_rels" DROP COLUMN IF EXISTS "routine_steps_id";

    ALTER TABLE "programs_rels" DROP CONSTRAINT IF EXISTS "programs_rels_routine_steps_fk";
    ALTER TABLE "programs_rels" DROP CONSTRAINT IF EXISTS "programs_rels_makeup_collections_fk";
    DROP INDEX IF EXISTS "programs_rels_routine_steps_id_idx";
    DROP INDEX IF EXISTS "programs_rels_makeup_collections_id_idx";
    ALTER TABLE "programs_rels" DROP COLUMN IF EXISTS "routine_steps_id";
    ALTER TABLE "programs_rels" DROP COLUMN IF EXISTS "makeup_collections_id";

    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_routine_steps_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_makeup_collections_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_routine_steps_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_makeup_collections_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "routine_steps_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "makeup_collections_id";

    DROP TABLE IF EXISTS "routine_steps_locales" CASCADE;
    DROP TABLE IF EXISTS "routine_steps" CASCADE;
    DROP TABLE IF EXISTS "makeup_collections_locales" CASCADE;
    DROP TABLE IF EXISTS "makeup_collections" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- No down migration provided for removed taxonomies.
  `)
}
