import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_rels"
      ADD COLUMN IF NOT EXISTS "treatments_id" integer,
      ADD COLUMN IF NOT EXISTS "objectives_id" integer,
      ADD COLUMN IF NOT EXISTS "areas_id" integer,
      ADD COLUMN IF NOT EXISTS "intents_id" integer,
      ADD COLUMN IF NOT EXISTS "zones_id" integer;

    CREATE INDEX IF NOT EXISTS "pages_rels_treatments_id_idx" ON "pages_rels" ("treatments_id");
    CREATE INDEX IF NOT EXISTS "pages_rels_objectives_id_idx" ON "pages_rels" ("objectives_id");
    CREATE INDEX IF NOT EXISTS "pages_rels_areas_id_idx" ON "pages_rels" ("areas_id");
    CREATE INDEX IF NOT EXISTS "pages_rels_intents_id_idx" ON "pages_rels" ("intents_id");
    CREATE INDEX IF NOT EXISTS "pages_rels_zones_id_idx" ON "pages_rels" ("zones_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_rels_treatments_fk') THEN
        ALTER TABLE "pages_rels"
          ADD CONSTRAINT "pages_rels_treatments_fk" FOREIGN KEY ("treatments_id") REFERENCES "public"."treatments"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_rels_objectives_fk') THEN
        ALTER TABLE "pages_rels"
          ADD CONSTRAINT "pages_rels_objectives_fk" FOREIGN KEY ("objectives_id") REFERENCES "public"."objectives"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_rels_areas_fk') THEN
        ALTER TABLE "pages_rels"
          ADD CONSTRAINT "pages_rels_areas_fk" FOREIGN KEY ("areas_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_rels_intents_fk') THEN
        ALTER TABLE "pages_rels"
          ADD CONSTRAINT "pages_rels_intents_fk" FOREIGN KEY ("intents_id") REFERENCES "public"."intents"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pages_rels_zones_fk') THEN
        ALTER TABLE "pages_rels"
          ADD CONSTRAINT "pages_rels_zones_fk" FOREIGN KEY ("zones_id") REFERENCES "public"."zones"("id") ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_treatments_fk";
    ALTER TABLE "pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_objectives_fk";
    ALTER TABLE "pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_areas_fk";
    ALTER TABLE "pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_intents_fk";
    ALTER TABLE "pages_rels" DROP CONSTRAINT IF EXISTS "pages_rels_zones_fk";

    DROP INDEX IF EXISTS "pages_rels_treatments_id_idx";
    DROP INDEX IF EXISTS "pages_rels_objectives_id_idx";
    DROP INDEX IF EXISTS "pages_rels_areas_id_idx";
    DROP INDEX IF EXISTS "pages_rels_intents_id_idx";
    DROP INDEX IF EXISTS "pages_rels_zones_id_idx";

    ALTER TABLE "pages_rels"
      DROP COLUMN IF EXISTS "treatments_id",
      DROP COLUMN IF EXISTS "objectives_id",
      DROP COLUMN IF EXISTS "areas_id",
      DROP COLUMN IF EXISTS "intents_id",
      DROP COLUMN IF EXISTS "zones_id";
  `)
}
