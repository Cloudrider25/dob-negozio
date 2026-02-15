import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_programs_currency') THEN
        CREATE TYPE "public"."enum_programs_currency" AS ENUM ('EUR', 'USD');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_programs_steps_step_type') THEN
        CREATE TYPE "public"."enum_programs_steps_step_type" AS ENUM ('manual', 'service', 'product');
      END IF;
    END $$;

    ALTER TABLE "programs"
      ADD COLUMN IF NOT EXISTS "price" numeric,
      ADD COLUMN IF NOT EXISTS "currency" "public"."enum_programs_currency" DEFAULT 'EUR',
      ADD COLUMN IF NOT EXISTS "hero_media_id" integer;

    CREATE INDEX IF NOT EXISTS "programs_hero_media_id_idx" ON "programs" ("hero_media_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programs_hero_media_id_media_id_fk') THEN
        ALTER TABLE "programs"
          ADD CONSTRAINT "programs_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE SET NULL ON UPDATE no action;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "programs_steps" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar NOT NULL,
      "step_type" "public"."enum_programs_steps_step_type" DEFAULT 'manual' NOT NULL,
      "step_service_id" integer,
      "step_product_id" integer,
      "step_hero_media_id" integer,
      "step_detail_media_id" integer,
      CONSTRAINT "programs_steps_pkey" PRIMARY KEY ("id")
    );

    CREATE INDEX IF NOT EXISTS "programs_steps_order_idx" ON "programs_steps" ("_order");
    CREATE INDEX IF NOT EXISTS "programs_steps_parent_id_idx" ON "programs_steps" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "programs_steps_step_service_id_idx" ON "programs_steps" ("step_service_id");
    CREATE INDEX IF NOT EXISTS "programs_steps_step_product_id_idx" ON "programs_steps" ("step_product_id");
    CREATE INDEX IF NOT EXISTS "programs_steps_step_hero_media_id_idx" ON "programs_steps" ("step_hero_media_id");
    CREATE INDEX IF NOT EXISTS "programs_steps_step_detail_media_id_idx" ON "programs_steps" ("step_detail_media_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programs_steps_parent_id_fk') THEN
        ALTER TABLE "programs_steps"
          ADD CONSTRAINT "programs_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE CASCADE ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programs_steps_step_service_id_services_id_fk') THEN
        ALTER TABLE "programs_steps"
          ADD CONSTRAINT "programs_steps_step_service_id_services_id_fk" FOREIGN KEY ("step_service_id") REFERENCES "public"."services"("id") ON DELETE SET NULL ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programs_steps_step_product_id_products_id_fk') THEN
        ALTER TABLE "programs_steps"
          ADD CONSTRAINT "programs_steps_step_product_id_products_id_fk" FOREIGN KEY ("step_product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programs_steps_step_hero_media_id_media_id_fk') THEN
        ALTER TABLE "programs_steps"
          ADD CONSTRAINT "programs_steps_step_hero_media_id_media_id_fk" FOREIGN KEY ("step_hero_media_id") REFERENCES "public"."media"("id") ON DELETE SET NULL ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programs_steps_step_detail_media_id_media_id_fk') THEN
        ALTER TABLE "programs_steps"
          ADD CONSTRAINT "programs_steps_step_detail_media_id_media_id_fk" FOREIGN KEY ("step_detail_media_id") REFERENCES "public"."media"("id") ON DELETE SET NULL ON UPDATE no action;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "programs_steps_locales" (
      "step_title" varchar,
      "step_subtitle" varchar,
      "id" serial PRIMARY KEY,
      "_locale" "_locales" NOT NULL,
      "_parent_id" varchar NOT NULL
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'programs_steps_locales_parent_id_fk'
      ) THEN
        ALTER TABLE "programs_steps_locales"
          ADD CONSTRAINT "programs_steps_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_steps"("id") ON DELETE CASCADE ON UPDATE no action;
      END IF;
    END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "programs_steps_locales_locale_parent_id_unique"
      ON "programs_steps_locales" ("_locale", "_parent_id");

    DROP TABLE IF EXISTS "programs_items_locales";
    DROP TABLE IF EXISTS "programs_items";
    DROP TABLE IF EXISTS "programs_rels";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "programs_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar NOT NULL,
      "item_image_id" integer,
      CONSTRAINT "programs_items_pkey" PRIMARY KEY ("id")
    );

    CREATE INDEX IF NOT EXISTS "programs_items_order_idx" ON "programs_items" ("_order");
    CREATE INDEX IF NOT EXISTS "programs_items_parent_id_idx" ON "programs_items" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "programs_items_item_image_idx" ON "programs_items" ("item_image_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programs_items_parent_id_fk') THEN
        ALTER TABLE "programs_items"
          ADD CONSTRAINT "programs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE CASCADE ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programs_items_item_image_id_media_id_fk') THEN
        ALTER TABLE "programs_items"
          ADD CONSTRAINT "programs_items_item_image_id_media_id_fk" FOREIGN KEY ("item_image_id") REFERENCES "public"."media"("id") ON DELETE SET NULL ON UPDATE no action;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "programs_items_locales" (
      "item_title" varchar,
      "item_description" varchar,
      "id" serial PRIMARY KEY,
      "_locale" "_locales" NOT NULL,
      "_parent_id" varchar NOT NULL
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'programs_items_locales_parent_id_fk'
      ) THEN
        ALTER TABLE "programs_items_locales"
          ADD CONSTRAINT "programs_items_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."programs_items"("id") ON DELETE CASCADE ON UPDATE no action;
      END IF;
    END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "programs_items_locales_locale_parent_id_unique"
      ON "programs_items_locales" ("_locale", "_parent_id");

    DROP TABLE IF EXISTS "programs_steps_locales";
    DROP TABLE IF EXISTS "programs_steps";

    ALTER TABLE "programs" DROP CONSTRAINT IF EXISTS "programs_hero_media_id_media_id_fk";
    DROP INDEX IF EXISTS "programs_hero_media_id_idx";
    ALTER TABLE "programs"
      DROP COLUMN IF EXISTS "price",
      DROP COLUMN IF EXISTS "currency",
      DROP COLUMN IF EXISTS "hero_media_id";

    DROP TYPE IF EXISTS "public"."enum_programs_steps_step_type";
    DROP TYPE IF EXISTS "public"."enum_programs_currency";
  `)
}
