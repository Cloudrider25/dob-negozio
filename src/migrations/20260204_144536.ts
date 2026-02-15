import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_rels" ADD COLUMN IF NOT EXISTS "skin_types_id" integer;

    CREATE INDEX IF NOT EXISTS "products_rels_skin_types_id_idx" ON "products_rels" ("skin_types_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_rels_skin_types_fk') THEN
        ALTER TABLE "products_rels"
          ADD CONSTRAINT "products_rels_skin_types_fk"
          FOREIGN KEY ("skin_types_id") REFERENCES "public"."skin_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    DROP INDEX IF EXISTS "products_rels_skin_type_primary_id_idx";
    DROP INDEX IF EXISTS "products_rels_skin_type_secondary_id_idx";

    ALTER TABLE "products_rels" DROP CONSTRAINT IF EXISTS "products_rels_skin_type_primary_fk";
    ALTER TABLE "products_rels" DROP CONSTRAINT IF EXISTS "products_rels_skin_type_secondary_fk";

    ALTER TABLE "products_rels" DROP COLUMN IF EXISTS "skin_type_primary_id";
    ALTER TABLE "products_rels" DROP COLUMN IF EXISTS "skin_type_secondary_id";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_rels" ADD COLUMN IF NOT EXISTS "skin_type_primary_id" integer;
    ALTER TABLE "products_rels" ADD COLUMN IF NOT EXISTS "skin_type_secondary_id" integer;

    CREATE INDEX IF NOT EXISTS "products_rels_skin_type_primary_id_idx" ON "products_rels" ("skin_type_primary_id");
    CREATE INDEX IF NOT EXISTS "products_rels_skin_type_secondary_id_idx" ON "products_rels" ("skin_type_secondary_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_rels_skin_type_primary_fk') THEN
        ALTER TABLE "products_rels"
          ADD CONSTRAINT "products_rels_skin_type_primary_fk"
          FOREIGN KEY ("skin_type_primary_id") REFERENCES "public"."skin_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_rels_skin_type_secondary_fk') THEN
        ALTER TABLE "products_rels"
          ADD CONSTRAINT "products_rels_skin_type_secondary_fk"
          FOREIGN KEY ("skin_type_secondary_id") REFERENCES "public"."skin_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    ALTER TABLE "products_rels" DROP CONSTRAINT IF EXISTS "products_rels_skin_types_fk";
    DROP INDEX IF EXISTS "products_rels_skin_types_id_idx";
    ALTER TABLE "products_rels" DROP COLUMN IF EXISTS "skin_types_id";
  `)
}
