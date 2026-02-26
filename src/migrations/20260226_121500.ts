import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "users_addresses" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "first_name" varchar,
      "last_name" varchar,
      "company" varchar,
      "street_address" varchar,
      "apartment" varchar,
      "city" varchar,
      "country" varchar,
      "province" varchar,
      "postal_code" varchar,
      "phone" varchar,
      "is_default" boolean DEFAULT false
    );

    CREATE INDEX IF NOT EXISTS "users_addresses_order_idx" ON "users_addresses" ("_order");
    CREATE INDEX IF NOT EXISTS "users_addresses_parent_id_idx" ON "users_addresses" ("_parent_id");

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_addresses_parent_id_fk') THEN
        ALTER TABLE "users_addresses"
          ADD CONSTRAINT "users_addresses_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users_addresses" DROP CONSTRAINT IF EXISTS "users_addresses_parent_id_fk";
    DROP INDEX IF EXISTS "users_addresses_parent_id_idx";
    DROP INDEX IF EXISTS "users_addresses_order_idx";
    DROP TABLE IF EXISTS "users_addresses";
  `)
}

