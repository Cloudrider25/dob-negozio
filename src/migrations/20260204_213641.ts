import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "attributes" (
      "id" serial PRIMARY KEY,
      "slug" varchar NOT NULL,
      "type" varchar NOT NULL,
      "active" boolean DEFAULT true,
      "sort_order" integer DEFAULT 0,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "attributes_slug_idx" ON "attributes" ("slug");
    CREATE INDEX IF NOT EXISTS "attributes_created_at_idx" ON "attributes" ("created_at");
    CREATE INDEX IF NOT EXISTS "attributes_updated_at_idx" ON "attributes" ("updated_at");

    CREATE TABLE IF NOT EXISTS "attributes_locales" (
      "name" varchar NOT NULL,
      "description" varchar,
      "id" serial PRIMARY KEY,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "attributes_locales_locale_parent_id_unique"
      ON "attributes_locales" ("_locale", "_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attributes_locales_parent_id_fk') THEN
        ALTER TABLE "attributes_locales"
          ADD CONSTRAINT "attributes_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."attributes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "attributes_values" (
      "id" serial PRIMARY KEY,
      "_order" integer,
      "_parent_id" integer NOT NULL,
      "slug" varchar NOT NULL,
      "sort_order" integer DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS "attributes_values_order_idx" ON "attributes_values" ("_order");
    CREATE INDEX IF NOT EXISTS "attributes_values_parent_idx" ON "attributes_values" ("_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attributes_values_parent_id_fk') THEN
        ALTER TABLE "attributes_values"
          ADD CONSTRAINT "attributes_values_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."attributes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "attributes_values_locales" (
      "name" varchar NOT NULL,
      "id" serial PRIMARY KEY,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "attributes_values_locales_locale_parent_id_unique"
      ON "attributes_values_locales" ("_locale", "_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attributes_values_locales_parent_id_fk') THEN
        ALTER TABLE "attributes_values_locales"
          ADD CONSTRAINT "attributes_values_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."attributes_values"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "products_attributes" (
      "id" serial PRIMARY KEY,
      "product_id" integer NOT NULL,
      "attribute_id" integer NOT NULL,
      "value_bool" boolean,
      "attribute_value_id" integer,
      "value_text" varchar
    );

    CREATE INDEX IF NOT EXISTS "products_attributes_product_idx" ON "products_attributes" ("product_id");
    CREATE INDEX IF NOT EXISTS "products_attributes_attribute_idx" ON "products_attributes" ("attribute_id");
    CREATE INDEX IF NOT EXISTS "products_attributes_attribute_value_idx" ON "products_attributes" ("attribute_value_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_attributes_product_fk') THEN
        ALTER TABLE "products_attributes"
          ADD CONSTRAINT "products_attributes_product_fk"
          FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_attributes_attribute_fk') THEN
        ALTER TABLE "products_attributes"
          ADD CONSTRAINT "products_attributes_attribute_fk"
          FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_attributes_attribute_value_fk') THEN
        ALTER TABLE "products_attributes"
          ADD CONSTRAINT "products_attributes_attribute_value_fk"
          FOREIGN KEY ("attribute_value_id") REFERENCES "public"."attributes_values"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_attributes" DROP CONSTRAINT IF EXISTS "products_attributes_attribute_value_fk";
    ALTER TABLE "products_attributes" DROP CONSTRAINT IF EXISTS "products_attributes_attribute_fk";
    ALTER TABLE "products_attributes" DROP CONSTRAINT IF EXISTS "products_attributes_product_fk";

    DROP INDEX IF EXISTS "products_attributes_attribute_value_idx";
    DROP INDEX IF EXISTS "products_attributes_attribute_idx";
    DROP INDEX IF EXISTS "products_attributes_product_idx";

    DROP TABLE IF EXISTS "products_attributes";

    ALTER TABLE "attributes_values_locales" DROP CONSTRAINT IF EXISTS "attributes_values_locales_parent_id_fk";
    DROP INDEX IF EXISTS "attributes_values_locales_locale_parent_id_unique";
    DROP TABLE IF EXISTS "attributes_values_locales";

    ALTER TABLE "attributes_values" DROP CONSTRAINT IF EXISTS "attributes_values_parent_id_fk";
    DROP INDEX IF EXISTS "attributes_values_parent_idx";
    DROP INDEX IF EXISTS "attributes_values_order_idx";
    DROP TABLE IF EXISTS "attributes_values";

    ALTER TABLE "attributes_locales" DROP CONSTRAINT IF EXISTS "attributes_locales_parent_id_fk";
    DROP INDEX IF EXISTS "attributes_locales_locale_parent_id_unique";
    DROP TABLE IF EXISTS "attributes_locales";

    DROP INDEX IF EXISTS "attributes_updated_at_idx";
    DROP INDEX IF EXISTS "attributes_created_at_idx";
    DROP INDEX IF EXISTS "attributes_slug_idx";

    DROP TABLE IF EXISTS "attributes";
  `)
}
