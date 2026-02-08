import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN IF EXISTS "meta_line";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "meta_needs";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "meta_categories";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "meta_zones";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "meta_texture";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "meta_description";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "meta_how_to_use";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "meta_active_ingredients";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "meta_results";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "meta_line" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "meta_needs" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "meta_categories" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "meta_zones" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "meta_texture" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "meta_description" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "meta_how_to_use" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "meta_active_ingredients" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "meta_results" varchar;
  `)
}
