import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_locales"
      ADD COLUMN IF NOT EXISTS "routine_builder_step1_title" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_locales"
      DROP COLUMN IF EXISTS "routine_builder_step1_title";
  `)
}
