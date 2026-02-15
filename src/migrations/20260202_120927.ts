import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_alternatives" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "sku" varchar,
      "format" varchar,
      "price" numeric,
      "is_refill" boolean DEFAULT false
    );

    CREATE INDEX IF NOT EXISTS "products_alternatives_order_idx" ON "products_alternatives" ("_order");
    CREATE INDEX IF NOT EXISTS "products_alternatives_parent_id_idx" ON "products_alternatives" ("_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_alternatives_parent_id_fk') THEN
        ALTER TABLE "products_alternatives"
          ADD CONSTRAINT "products_alternatives_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_alternatives" DROP CONSTRAINT IF EXISTS "products_alternatives_parent_id_fk";
    DROP INDEX IF EXISTS "products_alternatives_parent_id_idx";
    DROP INDEX IF EXISTS "products_alternatives_order_idx";
    DROP TABLE IF EXISTS "products_alternatives";
  `)
}
