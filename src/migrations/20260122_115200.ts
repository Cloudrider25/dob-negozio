import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "image_id" integer;

  UPDATE "treatments"
  SET "image_id" = "service_categories"."image_id"
  FROM "service_categories"
  WHERE "service_categories"."id" = "treatments"."id";

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'treatments_image_id_media_id_fk') THEN
      ALTER TABLE "treatments" ADD CONSTRAINT "treatments_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;

  CREATE INDEX IF NOT EXISTS "treatments_image_idx" ON "treatments" USING btree ("image_id");
  `)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX IF EXISTS "treatments_image_idx";
  ALTER TABLE "treatments" DROP CONSTRAINT IF EXISTS "treatments_image_id_media_id_fk";
  ALTER TABLE "treatments" DROP COLUMN IF EXISTS "image_id";
  `)
}
