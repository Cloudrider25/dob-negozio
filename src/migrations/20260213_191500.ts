import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_id" integer;
    CREATE INDEX IF NOT EXISTS "orders_customer_id_idx" ON "orders" ("customer_id");
  `)

  await db.execute(sql`
    DO $$
    BEGIN
      ALTER TABLE "orders"
        ADD CONSTRAINT "orders_customer_id_users_id_fk"
        FOREIGN KEY ("customer_id")
        REFERENCES "public"."users"("id")
        ON DELETE set null
        ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_customer_id_users_id_fk";
    DROP INDEX IF EXISTS "orders_customer_id_idx";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "customer_id";
  `)
}
