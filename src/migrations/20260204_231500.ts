import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_product_objectives_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_product_objectives_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "product_objectives_id";

    DROP TABLE IF EXISTS "product_objectives" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "product_objectives" (
      "id" serial PRIMARY KEY,
      "product_id" integer NOT NULL,
      "objective_id" integer NOT NULL,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "product_objectives_product_id_idx" ON "product_objectives" ("product_id");
    CREATE INDEX IF NOT EXISTS "product_objectives_objective_id_idx" ON "product_objectives" ("objective_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_objectives_product_id_fk') THEN
        ALTER TABLE "product_objectives"
          ADD CONSTRAINT "product_objectives_product_id_fk"
          FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_objectives_objective_id_fk') THEN
        ALTER TABLE "product_objectives"
          ADD CONSTRAINT "product_objectives_objective_id_fk"
          FOREIGN KEY ("objective_id") REFERENCES "public"."objectives"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "product_objectives_id" integer;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_product_objectives_id_idx" ON "payload_locked_documents_rels" ("product_objectives_id");
  `)
}
