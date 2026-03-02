import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') THEN
        ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "slug" varchar;
        CREATE UNIQUE INDEX IF NOT EXISTS "programs_slug_idx" ON "programs" ("slug");
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') THEN
        DROP INDEX IF EXISTS "programs_slug_idx";
        ALTER TABLE "programs" DROP COLUMN IF EXISTS "slug";
      END IF;
    END $$;
  `)
}
