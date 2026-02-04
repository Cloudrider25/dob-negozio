import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "product_areas" (
      "id" serial PRIMARY KEY,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "box_tagline" varchar,
      "card_title" varchar,
      "card_tagline" varchar,
      "card_media_id" integer,
      "card_description" jsonb,
      "description" varchar,
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "product_areas_card_media_idx" ON "product_areas" ("card_media_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "product_areas_slug_idx" ON "product_areas" ("slug");
    CREATE INDEX IF NOT EXISTS "product_areas_created_at_idx" ON "product_areas" ("created_at");
    CREATE INDEX IF NOT EXISTS "product_areas_updated_at_idx" ON "product_areas" ("updated_at");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_areas_card_media_fk') THEN
        ALTER TABLE "product_areas"
          ADD CONSTRAINT "product_areas_card_media_fk"
          FOREIGN KEY ("card_media_id") REFERENCES "public"."media"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "_products_v_product_areas" (
      "id" serial PRIMARY KEY,
      "_order" integer,
      "_parent_id" integer NOT NULL,
      "_path" varchar NOT NULL,
      "product_areas_id" integer
    );

    CREATE INDEX IF NOT EXISTS "_products_v_product_areas_order_idx" ON "_products_v_product_areas" ("_order");
    CREATE INDEX IF NOT EXISTS "_products_v_product_areas_parent_idx" ON "_products_v_product_areas" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_products_v_product_areas_path_idx" ON "_products_v_product_areas" ("_path");
    CREATE INDEX IF NOT EXISTS "_products_v_product_areas_product_areas_idx" ON "_products_v_product_areas" ("product_areas_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_products_v_product_areas_parent_fk') THEN
        ALTER TABLE "_products_v_product_areas"
          ADD CONSTRAINT "_products_v_product_areas_parent_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_products_v_product_areas_product_areas_fk') THEN
        ALTER TABLE "_products_v_product_areas"
          ADD CONSTRAINT "_products_v_product_areas_product_areas_fk"
          FOREIGN KEY ("product_areas_id") REFERENCES "public"."product_areas"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_products_v_product_areas" DROP CONSTRAINT IF EXISTS "_products_v_product_areas_product_areas_fk";
    ALTER TABLE "_products_v_product_areas" DROP CONSTRAINT IF EXISTS "_products_v_product_areas_parent_fk";

    DROP INDEX IF EXISTS "_products_v_product_areas_product_areas_idx";
    DROP INDEX IF EXISTS "_products_v_product_areas_path_idx";
    DROP INDEX IF EXISTS "_products_v_product_areas_parent_idx";
    DROP INDEX IF EXISTS "_products_v_product_areas_order_idx";

    DROP TABLE IF EXISTS "_products_v_product_areas";

    ALTER TABLE "product_areas" DROP CONSTRAINT IF EXISTS "product_areas_card_media_fk";

    DROP INDEX IF EXISTS "product_areas_updated_at_idx";
    DROP INDEX IF EXISTS "product_areas_created_at_idx";
    DROP INDEX IF EXISTS "product_areas_slug_idx";
    DROP INDEX IF EXISTS "product_areas_card_media_idx";

    DROP TABLE IF EXISTS "product_areas";
  `)
}
