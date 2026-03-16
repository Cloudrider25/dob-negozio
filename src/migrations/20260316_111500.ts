import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      ALTER TYPE "public"."enum_email_templates_event_key"
        ADD VALUE IF NOT EXISTS 'product_waitlist_back_in_stock';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Enum value rollback is intentionally omitted.
}
