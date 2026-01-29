import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services"
      DROP COLUMN IF EXISTS "accordion_cta_href";

    ALTER TABLE "services_locales"
      DROP COLUMN IF EXISTS "accordion_cta_label";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "services"
      ADD COLUMN IF NOT EXISTS "accordion_cta_href" varchar;

    ALTER TABLE "services_locales"
      ADD COLUMN IF NOT EXISTS "accordion_cta_label" varchar;
  `)
}
