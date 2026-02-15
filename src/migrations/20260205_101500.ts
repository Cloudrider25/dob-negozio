import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "last_delivery_date" timestamp(3) with time zone;

    ALTER TABLE "products" DROP COLUMN IF EXISTS "lot";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "expiry_date";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "last_cost";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "residual_total";

    CREATE TABLE IF NOT EXISTS "products_deliveries" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "lot" varchar,
      "quantity" numeric,
      "cost_per_unit" numeric,
      "total_cost" numeric,
      "delivery_date" timestamp(3) with time zone,
      "expiry_date" timestamp(3) with time zone
    );

    CREATE INDEX IF NOT EXISTS "products_deliveries_order_idx" ON "products_deliveries" ("_order");
    CREATE INDEX IF NOT EXISTS "products_deliveries_parent_id_idx" ON "products_deliveries" ("_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_deliveries_parent_id_fk') THEN
        ALTER TABLE "products_deliveries"
          ADD CONSTRAINT "products_deliveries_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN IF EXISTS "last_delivery_date";
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "lot" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "expiry_date" timestamp(3) with time zone;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "last_cost" numeric;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "residual_total" numeric;

    ALTER TABLE "products_deliveries" DROP CONSTRAINT IF EXISTS "products_deliveries_parent_id_fk";
    DROP INDEX IF EXISTS "products_deliveries_parent_id_idx";
    DROP INDEX IF EXISTS "products_deliveries_order_idx";
    DROP TABLE IF EXISTS "products_deliveries";
  `)
}
