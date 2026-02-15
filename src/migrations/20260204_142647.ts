import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "skin_types" (
      "id" serial PRIMARY KEY,
      "slug" varchar NOT NULL,
      "product_area_id" integer,
      "card_media_id" integer,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "skin_types_slug_idx" ON "skin_types" ("slug");
    CREATE INDEX IF NOT EXISTS "skin_types_product_area_idx" ON "skin_types" ("product_area_id");
    CREATE INDEX IF NOT EXISTS "skin_types_card_media_idx" ON "skin_types" ("card_media_id");
    CREATE INDEX IF NOT EXISTS "skin_types_created_at_idx" ON "skin_types" ("created_at");
    CREATE INDEX IF NOT EXISTS "skin_types_updated_at_idx" ON "skin_types" ("updated_at");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'skin_types_product_area_fk') THEN
        ALTER TABLE "skin_types"
          ADD CONSTRAINT "skin_types_product_area_fk"
          FOREIGN KEY ("product_area_id") REFERENCES "public"."product_areas"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'skin_types_card_media_fk') THEN
        ALTER TABLE "skin_types"
          ADD CONSTRAINT "skin_types_card_media_fk"
          FOREIGN KEY ("card_media_id") REFERENCES "public"."media"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "skin_types_locales" (
      "name" varchar NOT NULL,
      "box_tagline" varchar,
      "card_title" varchar,
      "card_tagline" varchar,
      "card_description" jsonb,
      "description" varchar,
      "id" serial PRIMARY KEY,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "skin_types_locales_locale_parent_id_unique"
      ON "skin_types_locales" ("_locale", "_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'skin_types_locales_parent_id_fk') THEN
        ALTER TABLE "skin_types_locales"
          ADD CONSTRAINT "skin_types_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."skin_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

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
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_rels" DROP CONSTRAINT IF EXISTS "products_rels_skin_type_secondary_fk";
    ALTER TABLE "products_rels" DROP CONSTRAINT IF EXISTS "products_rels_skin_type_primary_fk";

    DROP INDEX IF EXISTS "products_rels_skin_type_secondary_id_idx";
    DROP INDEX IF EXISTS "products_rels_skin_type_primary_id_idx";

    ALTER TABLE "products_rels" DROP COLUMN IF EXISTS "skin_type_secondary_id";
    ALTER TABLE "products_rels" DROP COLUMN IF EXISTS "skin_type_primary_id";

    ALTER TABLE "skin_types_locales" DROP CONSTRAINT IF EXISTS "skin_types_locales_parent_id_fk";
    DROP INDEX IF EXISTS "skin_types_locales_locale_parent_id_unique";
    DROP TABLE IF EXISTS "skin_types_locales";

    ALTER TABLE "skin_types" DROP CONSTRAINT IF EXISTS "skin_types_card_media_fk";
    ALTER TABLE "skin_types" DROP CONSTRAINT IF EXISTS "skin_types_product_area_fk";

    DROP INDEX IF EXISTS "skin_types_updated_at_idx";
    DROP INDEX IF EXISTS "skin_types_created_at_idx";
    DROP INDEX IF EXISTS "skin_types_card_media_idx";
    DROP INDEX IF EXISTS "skin_types_product_area_idx";
    DROP INDEX IF EXISTS "skin_types_slug_idx";

    DROP TABLE IF EXISTS "skin_types";
  `)
}
