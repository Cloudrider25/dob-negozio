import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "logo_id" integer;
    CREATE INDEX IF NOT EXISTS "brands_logo_idx" ON "brands" ("logo_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brands_logo_id_media_id_fk') THEN
        ALTER TABLE "brands"
          ADD CONSTRAINT "brands_logo_id_media_id_fk"
          FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "brands" DROP CONSTRAINT IF EXISTS "brands_logo_id_media_id_fk";
    DROP INDEX IF EXISTS "brands_logo_idx";
    ALTER TABLE "brands" DROP COLUMN IF EXISTS "logo_id";
  `)
}
