import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "timing_products" (
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

    CREATE INDEX IF NOT EXISTS "timing_products_card_media_idx" ON "timing_products" ("card_media_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "timing_products_slug_idx" ON "timing_products" ("slug");
    CREATE INDEX IF NOT EXISTS "timing_products_created_at_idx" ON "timing_products" ("created_at");
    CREATE INDEX IF NOT EXISTS "timing_products_updated_at_idx" ON "timing_products" ("updated_at");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'timing_products_card_media_fk') THEN
        ALTER TABLE "timing_products"
          ADD CONSTRAINT "timing_products_card_media_fk"
          FOREIGN KEY ("card_media_id") REFERENCES "public"."media"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "_products_v_timing_products" (
      "id" serial PRIMARY KEY,
      "_order" integer,
      "_parent_id" integer NOT NULL,
      "_path" varchar NOT NULL,
      "timing_products_id" integer
    );

    CREATE INDEX IF NOT EXISTS "_products_v_timing_products_order_idx" ON "_products_v_timing_products" ("_order");
    CREATE INDEX IF NOT EXISTS "_products_v_timing_products_parent_idx" ON "_products_v_timing_products" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_products_v_timing_products_path_idx" ON "_products_v_timing_products" ("_path");
    CREATE INDEX IF NOT EXISTS "_products_v_timing_products_timing_products_idx" ON "_products_v_timing_products" ("timing_products_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_products_v_timing_products_parent_fk') THEN
        ALTER TABLE "_products_v_timing_products"
          ADD CONSTRAINT "_products_v_timing_products_parent_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_products_v_timing_products_timing_products_fk') THEN
        ALTER TABLE "_products_v_timing_products"
          ADD CONSTRAINT "_products_v_timing_products_timing_products_fk"
          FOREIGN KEY ("timing_products_id") REFERENCES "public"."timing_products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_products_v_timing_products" DROP CONSTRAINT IF EXISTS "_products_v_timing_products_timing_products_fk";
    ALTER TABLE "_products_v_timing_products" DROP CONSTRAINT IF EXISTS "_products_v_timing_products_parent_fk";

    DROP INDEX IF EXISTS "_products_v_timing_products_timing_products_idx";
    DROP INDEX IF EXISTS "_products_v_timing_products_path_idx";
    DROP INDEX IF EXISTS "_products_v_timing_products_parent_idx";
    DROP INDEX IF EXISTS "_products_v_timing_products_order_idx";

    DROP TABLE IF EXISTS "_products_v_timing_products";

    ALTER TABLE "timing_products" DROP CONSTRAINT IF EXISTS "timing_products_card_media_fk";

    DROP INDEX IF EXISTS "timing_products_updated_at_idx";
    DROP INDEX IF EXISTS "timing_products_created_at_idx";
    DROP INDEX IF EXISTS "timing_products_slug_idx";
    DROP INDEX IF EXISTS "timing_products_card_media_idx";

    DROP TABLE IF EXISTS "timing_products";
  `)
}
