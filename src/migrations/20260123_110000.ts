import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'treatments_locales') THEN
        ALTER TABLE "treatments_locales"
        ADD COLUMN IF NOT EXISTS "card_name" character varying;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'treatments_locales'
          AND column_name = 'box_name'
        ) THEN
          UPDATE "treatments_locales"
          SET "card_name" = "box_name"
          WHERE "card_name" IS NULL AND "box_name" IS NOT NULL;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'treatments_locales'
          AND column_name = 'title'
        ) THEN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'treatments_locales'
            AND column_name = 'box_name'
          ) THEN
            UPDATE "treatments_locales"
            SET "box_name" = "title"
            WHERE "title" IS NOT NULL AND "title" <> '';
          END IF;

          ALTER TABLE "treatments_locales"
          DROP COLUMN IF EXISTS "title";
        END IF;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'treatments_locales') THEN
        ALTER TABLE "treatments_locales"
        ADD COLUMN IF NOT EXISTS "title" character varying;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'treatments_locales'
          AND column_name = 'box_name'
        ) THEN
          UPDATE "treatments_locales"
          SET "title" = "box_name"
          WHERE "title" IS NULL AND "box_name" IS NOT NULL;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'treatments_locales'
          AND column_name = 'box_name'
        ) AND EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'treatments_locales'
          AND column_name = 'card_name'
        ) THEN
          UPDATE "treatments_locales"
          SET "box_name" = "card_name"
          WHERE "card_name" IS NOT NULL AND "card_name" <> '';
        END IF;

        ALTER TABLE "treatments_locales"
        DROP COLUMN IF EXISTS "card_name";
      END IF;
    END $$;
  `)
}
