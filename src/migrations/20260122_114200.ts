import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "treatments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"image_id" integer,
  	"highlight_image_left_id" integer,
  	"highlight_image_right_id" integer,
  	"dob_group" varchar,
  	"slug" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "treatments_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"highlight_lead" varchar,
  	"highlight_point_one_title" varchar,
  	"highlight_point_one_body" varchar,
  	"highlight_point_two_title" varchar,
  	"highlight_point_two_body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "image_id" integer;

  INSERT INTO "treatments" (
    "id",
    "hero_image_id",
    "image_id",
    "highlight_image_left_id",
    "highlight_image_right_id",
    "dob_group",
    "slug",
    "active",
    "updated_at",
    "created_at"
  )
  SELECT
    "id",
    "hero_image_id",
    "image_id",
    "highlight_image_left_id",
    "highlight_image_right_id",
    "dob_group",
    "slug",
    "active",
    "updated_at",
    "created_at"
  FROM "service_categories"
  ON CONFLICT ("id") DO NOTHING;

  INSERT INTO "treatments_locales" (
    "id",
    "title",
    "description",
    "highlight_lead",
    "highlight_point_one_title",
    "highlight_point_one_body",
    "highlight_point_two_title",
    "highlight_point_two_body",
    "_locale",
    "_parent_id"
  )
  SELECT
    "id",
    "title",
    "description",
    "highlight_lead",
    "highlight_point_one_title",
    "highlight_point_one_body",
    "highlight_point_two_title",
    "highlight_point_two_body",
    "_locale",
    "_parent_id"
  FROM "service_categories_locales"
  ON CONFLICT ("id") DO NOTHING;

  SELECT setval(pg_get_serial_sequence('"treatments"', 'id'), COALESCE(MAX("id"), 1)) FROM "treatments";
  SELECT setval(pg_get_serial_sequence('"treatments_locales"', 'id'), COALESCE(MAX("id"), 1)) FROM "treatments_locales";

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'treatments_hero_image_id_media_id_fk') THEN
      ALTER TABLE "treatments" ADD CONSTRAINT "treatments_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'treatments_image_id_media_id_fk') THEN
      ALTER TABLE "treatments" ADD CONSTRAINT "treatments_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'treatments_highlight_image_left_id_media_id_fk') THEN
      ALTER TABLE "treatments" ADD CONSTRAINT "treatments_highlight_image_left_id_media_id_fk" FOREIGN KEY ("highlight_image_left_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'treatments_highlight_image_right_id_media_id_fk') THEN
      ALTER TABLE "treatments" ADD CONSTRAINT "treatments_highlight_image_right_id_media_id_fk" FOREIGN KEY ("highlight_image_right_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'treatments_locales_parent_id_fk') THEN
      ALTER TABLE "treatments_locales" ADD CONSTRAINT "treatments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."treatments"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  CREATE INDEX IF NOT EXISTS "treatments_hero_image_idx" ON "treatments" USING btree ("hero_image_id");
  CREATE INDEX IF NOT EXISTS "treatments_image_idx" ON "treatments" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "treatments_highlight_image_left_idx" ON "treatments" USING btree ("highlight_image_left_id");
  CREATE INDEX IF NOT EXISTS "treatments_highlight_image_right_idx" ON "treatments" USING btree ("highlight_image_right_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "treatments_slug_idx" ON "treatments" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "treatments_updated_at_idx" ON "treatments" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "treatments_created_at_idx" ON "treatments" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "treatments_locales_locale_parent_id_unique" ON "treatments_locales" USING btree ("_locale","_parent_id");

  ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "services_category_id_service_categories_id_fk";
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_category_id_treatments_id_fk') THEN
      ALTER TABLE "services" ADD CONSTRAINT "services_category_id_treatments_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."treatments"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "treatments_id" integer;
  UPDATE "payload_locked_documents_rels" SET "treatments_id" = "service_categories_id" WHERE "service_categories_id" IS NOT NULL;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_treatments_fk') THEN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_treatments_fk" FOREIGN KEY ("treatments_id") REFERENCES "public"."treatments"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_treatments_id_idx" ON "payload_locked_documents_rels" USING btree ("treatments_id");

  CREATE TABLE IF NOT EXISTS "areas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"card_media_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "areas_locales" (
  	"name" varchar NOT NULL,
  	"box_tagline" varchar,
  	"card_title" varchar,
  	"card_tagline" varchar,
  	"card_description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "objectives" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"card_media_id" integer,
  	"area_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "objectives_locales" (
  	"box_name" varchar NOT NULL,
  	"box_tagline" varchar,
  	"card_name" varchar,
  	"card_tagline" varchar,
  	"card_description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'areas_card_media_id_media_id_fk') THEN
      ALTER TABLE "areas" ADD CONSTRAINT "areas_card_media_id_media_id_fk" FOREIGN KEY ("card_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'areas_locales_parent_id_fk') THEN
      ALTER TABLE "areas_locales" ADD CONSTRAINT "areas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'objectives_card_media_id_media_id_fk') THEN
      ALTER TABLE "objectives" ADD CONSTRAINT "objectives_card_media_id_media_id_fk" FOREIGN KEY ("card_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'objectives_area_id_areas_id_fk') THEN
      ALTER TABLE "objectives" ADD CONSTRAINT "objectives_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'objectives_locales_parent_id_fk') THEN
      ALTER TABLE "objectives_locales" ADD CONSTRAINT "objectives_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."objectives"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  CREATE INDEX IF NOT EXISTS "areas_card_media_idx" ON "areas" USING btree ("card_media_id");
  CREATE INDEX IF NOT EXISTS "areas_updated_at_idx" ON "areas" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "areas_created_at_idx" ON "areas" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "areas_locales_locale_parent_id_unique" ON "areas_locales" USING btree ("_locale","_parent_id");

  CREATE INDEX IF NOT EXISTS "objectives_card_media_idx" ON "objectives" USING btree ("card_media_id");
  CREATE INDEX IF NOT EXISTS "objectives_area_idx" ON "objectives" USING btree ("area_id");
  CREATE INDEX IF NOT EXISTS "objectives_updated_at_idx" ON "objectives" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "objectives_created_at_idx" ON "objectives" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "objectives_locales_locale_parent_id_unique" ON "objectives_locales" USING btree ("_locale","_parent_id");

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "areas_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "objectives_id" integer;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_areas_fk') THEN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_areas_fk" FOREIGN KEY ("areas_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_objectives_fk') THEN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_objectives_fk" FOREIGN KEY ("objectives_id") REFERENCES "public"."objectives"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_areas_id_idx" ON "payload_locked_documents_rels" USING btree ("areas_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_objectives_id_idx" ON "payload_locked_documents_rels" USING btree ("objectives_id");
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_areas_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_objectives_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_areas_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_objectives_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "areas_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "objectives_id";

  DROP TABLE IF EXISTS "objectives_locales" CASCADE;
  DROP TABLE IF EXISTS "objectives" CASCADE;
  DROP TABLE IF EXISTS "areas_locales" CASCADE;
  DROP TABLE IF EXISTS "areas" CASCADE;

  CREATE TABLE IF NOT EXISTS "service_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"image_id" integer,
  	"highlight_image_left_id" integer,
  	"highlight_image_right_id" integer,
  	"dob_group" varchar,
  	"slug" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "service_categories_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"highlight_lead" varchar,
  	"highlight_point_one_title" varchar,
  	"highlight_point_one_body" varchar,
  	"highlight_point_two_title" varchar,
  	"highlight_point_two_body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  ALTER TABLE "service_categories" ADD COLUMN IF NOT EXISTS "image_id" integer;

  INSERT INTO "service_categories" (
    "id",
    "hero_image_id",
    "image_id",
    "highlight_image_left_id",
    "highlight_image_right_id",
    "dob_group",
    "slug",
    "active",
    "updated_at",
    "created_at"
  )
  SELECT
    "id",
    "hero_image_id",
    "image_id",
    "highlight_image_left_id",
    "highlight_image_right_id",
    "dob_group",
    "slug",
    "active",
    "updated_at",
    "created_at"
  FROM "treatments"
  ON CONFLICT ("id") DO NOTHING;

  INSERT INTO "service_categories_locales" (
    "id",
    "title",
    "description",
    "highlight_lead",
    "highlight_point_one_title",
    "highlight_point_one_body",
    "highlight_point_two_title",
    "highlight_point_two_body",
    "_locale",
    "_parent_id"
  )
  SELECT
    "id",
    "title",
    "description",
    "highlight_lead",
    "highlight_point_one_title",
    "highlight_point_one_body",
    "highlight_point_two_title",
    "highlight_point_two_body",
    "_locale",
    "_parent_id"
  FROM "treatments_locales"
  ON CONFLICT ("id") DO NOTHING;

  SELECT setval(pg_get_serial_sequence('"service_categories"', 'id'), COALESCE(MAX("id"), 1)) FROM "service_categories";
  SELECT setval(pg_get_serial_sequence('"service_categories_locales"', 'id'), COALESCE(MAX("id"), 1)) FROM "service_categories_locales";

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_categories_hero_image_id_media_id_fk') THEN
      ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_categories_image_id_media_id_fk') THEN
      ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_categories_highlight_image_left_id_media_id_fk') THEN
      ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_highlight_image_left_id_media_id_fk" FOREIGN KEY ("highlight_image_left_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_categories_highlight_image_right_id_media_id_fk') THEN
      ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_highlight_image_right_id_media_id_fk" FOREIGN KEY ("highlight_image_right_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_categories_locales_parent_id_fk') THEN
      ALTER TABLE "service_categories_locales" ADD CONSTRAINT "service_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."service_categories"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  CREATE INDEX IF NOT EXISTS "service_categories_hero_image_idx" ON "service_categories" USING btree ("hero_image_id");
  CREATE INDEX IF NOT EXISTS "service_categories_image_idx" ON "service_categories" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "service_categories_highlight_image_left_idx" ON "service_categories" USING btree ("highlight_image_left_id");
  CREATE INDEX IF NOT EXISTS "service_categories_highlight_image_right_idx" ON "service_categories" USING btree ("highlight_image_right_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "service_categories_slug_idx" ON "service_categories" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "service_categories_updated_at_idx" ON "service_categories" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "service_categories_created_at_idx" ON "service_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "service_categories_locales_locale_parent_id_unique" ON "service_categories_locales" USING btree ("_locale","_parent_id");

  ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "services_category_id_treatments_id_fk";
  ALTER TABLE "services" ADD CONSTRAINT "services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE set null ON UPDATE no action;

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "service_categories_id" integer;
  UPDATE "payload_locked_documents_rels" SET "service_categories_id" = "treatments_id" WHERE "treatments_id" IS NOT NULL;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_service_categories_fk') THEN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_service_categories_fk" FOREIGN KEY ("service_categories_id") REFERENCES "public"."service_categories"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_service_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("service_categories_id");

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_treatments_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_treatments_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "treatments_id";

  DROP TABLE IF EXISTS "treatments_locales" CASCADE;
  DROP TABLE IF EXISTS "treatments" CASCADE;
  `)
}
