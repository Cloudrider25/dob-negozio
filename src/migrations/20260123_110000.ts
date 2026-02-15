import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "treatments_locales"
    ADD COLUMN IF NOT EXISTS "card_name" character varying;

    UPDATE "treatments_locales"
    SET "card_name" = "box_name"
    WHERE "card_name" IS NULL AND "box_name" IS NOT NULL;

    UPDATE "treatments_locales"
    SET "box_name" = "title"
    WHERE "title" IS NOT NULL AND "title" <> '';

    ALTER TABLE "treatments_locales"
    DROP COLUMN IF EXISTS "title";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "treatments_locales"
    ADD COLUMN IF NOT EXISTS "title" character varying;

    UPDATE "treatments_locales"
    SET "title" = "box_name"
    WHERE "title" IS NULL AND "box_name" IS NOT NULL;

    UPDATE "treatments_locales"
    SET "box_name" = "card_name"
    WHERE "card_name" IS NOT NULL AND "card_name" <> '';

    ALTER TABLE "treatments_locales"
    DROP COLUMN IF EXISTS "card_name";
  `)
}
