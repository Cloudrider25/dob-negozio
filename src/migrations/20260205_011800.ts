import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_brand_line_objective_priori_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_brand_line_objective_prior_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "brand_line_objective_priority_id";

    ALTER TABLE "brand_line_objective_priority" RENAME TO "brand_line_needs_priority";
    ALTER TABLE "brand_line_needs_priority" RENAME COLUMN "objective_id" TO "need_id";

    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brand_line_objective_priority_brand_line_id_fk') THEN
        ALTER TABLE "brand_line_needs_priority" DROP CONSTRAINT "brand_line_objective_priority_brand_line_id_fk";
      END IF;

      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brand_line_objective_priority_objective_id_fk') THEN
        ALTER TABLE "brand_line_needs_priority" DROP CONSTRAINT "brand_line_objective_priority_objective_id_fk";
      END IF;
    END $$;

    ALTER INDEX IF EXISTS "brand_line_objective_priority_brand_line_idx" RENAME TO "brand_line_needs_priority_brand_line_idx";
    ALTER INDEX IF EXISTS "brand_line_objective_priority_objective_idx" RENAME TO "brand_line_needs_priority_need_idx";
    ALTER INDEX IF EXISTS "brand_line_objective_priority_created_at_idx" RENAME TO "brand_line_needs_priority_created_at_idx";
    ALTER INDEX IF EXISTS "brand_line_objective_priority_updated_at_idx" RENAME TO "brand_line_needs_priority_updated_at_idx";

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brand_line_needs_priority_brand_line_id_fk') THEN
        ALTER TABLE "brand_line_needs_priority"
          ADD CONSTRAINT "brand_line_needs_priority_brand_line_id_fk"
          FOREIGN KEY ("brand_line_id") REFERENCES "public"."brand_lines"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brand_line_needs_priority_need_id_fk') THEN
        ALTER TABLE "brand_line_needs_priority"
          ADD CONSTRAINT "brand_line_needs_priority_need_id_fk"
          FOREIGN KEY ("need_id") REFERENCES "public"."needs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "brand_line_needs_priority" DROP CONSTRAINT IF EXISTS "brand_line_needs_priority_need_id_fk";
    ALTER TABLE "brand_line_needs_priority" DROP CONSTRAINT IF EXISTS "brand_line_needs_priority_brand_line_id_fk";

    ALTER INDEX IF EXISTS "brand_line_needs_priority_updated_at_idx" RENAME TO "brand_line_objective_priority_updated_at_idx";
    ALTER INDEX IF EXISTS "brand_line_needs_priority_created_at_idx" RENAME TO "brand_line_objective_priority_created_at_idx";
    ALTER INDEX IF EXISTS "brand_line_needs_priority_need_idx" RENAME TO "brand_line_objective_priority_objective_idx";
    ALTER INDEX IF EXISTS "brand_line_needs_priority_brand_line_idx" RENAME TO "brand_line_objective_priority_brand_line_idx";

    ALTER TABLE "brand_line_needs_priority" RENAME COLUMN "need_id" TO "objective_id";
    ALTER TABLE "brand_line_needs_priority" RENAME TO "brand_line_objective_priority";

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brand_line_objective_priority_brand_line_id_fk') THEN
        ALTER TABLE "brand_line_objective_priority"
          ADD CONSTRAINT "brand_line_objective_priority_brand_line_id_fk"
          FOREIGN KEY ("brand_line_id") REFERENCES "public"."brand_lines"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brand_line_objective_priority_objective_id_fk') THEN
        ALTER TABLE "brand_line_objective_priority"
          ADD CONSTRAINT "brand_line_objective_priority_objective_id_fk"
          FOREIGN KEY ("objective_id") REFERENCES "public"."objectives"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "brand_line_objective_priority_id" integer;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_brand_line_objective_prior_idx" ON "payload_locked_documents_rels" ("brand_line_objective_priority_id");
  `)
}
