import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "brands" (
      "id" serial PRIMARY KEY,
      "slug" varchar NOT NULL,
      "active" boolean DEFAULT true,
      "sort_order" integer DEFAULT 0,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "brands_slug_idx" ON "brands" ("slug");
    CREATE INDEX IF NOT EXISTS "brands_created_at_idx" ON "brands" ("created_at");
    CREATE INDEX IF NOT EXISTS "brands_updated_at_idx" ON "brands" ("updated_at");

    CREATE TABLE IF NOT EXISTS "brands_locales" (
      "name" varchar NOT NULL,
      "id" serial PRIMARY KEY,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "brands_locales_locale_parent_id_unique"
      ON "brands_locales" ("_locale", "_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brands_locales_parent_id_fk') THEN
        ALTER TABLE "brands_locales"
          ADD CONSTRAINT "brands_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "brand_lines" (
      "id" serial PRIMARY KEY,
      "slug" varchar NOT NULL,
      "brand_id" integer NOT NULL,
      "active" boolean DEFAULT true,
      "sort_order" integer DEFAULT 0,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "brand_lines_slug_idx" ON "brand_lines" ("slug");
    CREATE INDEX IF NOT EXISTS "brand_lines_brand_idx" ON "brand_lines" ("brand_id");
    CREATE INDEX IF NOT EXISTS "brand_lines_created_at_idx" ON "brand_lines" ("created_at");
    CREATE INDEX IF NOT EXISTS "brand_lines_updated_at_idx" ON "brand_lines" ("updated_at");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brand_lines_brand_fk') THEN
        ALTER TABLE "brand_lines"
          ADD CONSTRAINT "brand_lines_brand_fk"
          FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "brand_lines_locales" (
      "name" varchar NOT NULL,
      "id" serial PRIMARY KEY,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "brand_lines_locales_locale_parent_id_unique"
      ON "brand_lines_locales" ("_locale", "_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brand_lines_locales_parent_id_fk') THEN
        ALTER TABLE "brand_lines_locales"
          ADD CONSTRAINT "brand_lines_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."brand_lines"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brand_id" integer;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brand_line_id" integer;

    CREATE INDEX IF NOT EXISTS "products_brand_id_idx" ON "products" ("brand_id");
    CREATE INDEX IF NOT EXISTS "products_brand_line_id_idx" ON "products" ("brand_line_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_brand_fk') THEN
        ALTER TABLE "products"
          ADD CONSTRAINT "products_brand_fk"
          FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_brand_line_fk') THEN
        ALTER TABLE "products"
          ADD CONSTRAINT "products_brand_line_fk"
          FOREIGN KEY ("brand_line_id") REFERENCES "public"."brand_lines"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;

    ALTER TABLE "products" DROP COLUMN IF EXISTS "brand";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brand" varchar;

    ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_brand_line_fk";
    ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_brand_fk";

    DROP INDEX IF EXISTS "products_brand_line_id_idx";
    DROP INDEX IF EXISTS "products_brand_id_idx";

    ALTER TABLE "products" DROP COLUMN IF EXISTS "brand_line_id";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "brand_id";

    ALTER TABLE "brand_lines_locales" DROP CONSTRAINT IF EXISTS "brand_lines_locales_parent_id_fk";
    DROP INDEX IF EXISTS "brand_lines_locales_locale_parent_id_unique";
    DROP TABLE IF EXISTS "brand_lines_locales";

    ALTER TABLE "brand_lines" DROP CONSTRAINT IF EXISTS "brand_lines_brand_fk";
    DROP INDEX IF EXISTS "brand_lines_updated_at_idx";
    DROP INDEX IF EXISTS "brand_lines_created_at_idx";
    DROP INDEX IF EXISTS "brand_lines_brand_idx";
    DROP INDEX IF EXISTS "brand_lines_slug_idx";
    DROP TABLE IF EXISTS "brand_lines";

    ALTER TABLE "brands_locales" DROP CONSTRAINT IF EXISTS "brands_locales_parent_id_fk";
    DROP INDEX IF EXISTS "brands_locales_locale_parent_id_unique";
    DROP TABLE IF EXISTS "brands_locales";

    DROP INDEX IF EXISTS "brands_updated_at_idx";
    DROP INDEX IF EXISTS "brands_created_at_idx";
    DROP INDEX IF EXISTS "brands_slug_idx";
    DROP TABLE IF EXISTS "brands";
  `)
}
