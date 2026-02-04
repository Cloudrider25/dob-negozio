import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_alternatives" ADD COLUMN IF NOT EXISTS "product_id" integer;

    CREATE INDEX IF NOT EXISTS "products_alternatives_product_idx" ON "products_alternatives" ("product_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_alternatives_product_fk') THEN
        ALTER TABLE "products_alternatives"
          ADD CONSTRAINT "products_alternatives_product_fk"
          FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_alternatives" DROP CONSTRAINT IF EXISTS "products_alternatives_product_fk";
    DROP INDEX IF EXISTS "products_alternatives_product_idx";
    ALTER TABLE "products_alternatives" DROP COLUMN IF EXISTS "product_id";
  `)
}
