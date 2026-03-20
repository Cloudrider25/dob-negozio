import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_pages_page_key" ADD VALUE IF NOT EXISTS 'refund';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "pages_locales"
    WHERE "_parent_id" IN (
      SELECT "id"
      FROM "pages"
      WHERE "page_key" = 'refund'::"public"."enum_pages_page_key"
    );

    DELETE FROM "pages"
    WHERE "page_key" = 'refund'::"public"."enum_pages_page_key";

    ALTER TABLE "pages_locales"
      DROP COLUMN IF EXISTS "refund_content";
  `)
}
