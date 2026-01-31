import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "slug" varchar;
    CREATE UNIQUE INDEX IF NOT EXISTS "programs_slug_idx" ON "programs" ("slug");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "programs_slug_idx";
    ALTER TABLE "programs" DROP COLUMN IF EXISTS "slug";
  `)
}
