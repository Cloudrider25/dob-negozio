import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_cart_mode') THEN
        CREATE TYPE "enum_orders_cart_mode" AS ENUM ('products_only', 'services_only', 'mixed');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_product_fulfillment_mode') THEN
        CREATE TYPE "enum_orders_product_fulfillment_mode" AS ENUM ('shipping', 'pickup', 'none');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_appointment_mode') THEN
        CREATE TYPE "enum_orders_appointment_mode" AS ENUM ('none', 'requested_slot', 'contact_later');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_appointment_status') THEN
        CREATE TYPE "enum_orders_appointment_status" AS ENUM ('none', 'pending', 'confirmed', 'alternative_proposed', 'confirmed_by_customer');
      END IF;
    END $$;

    ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "cart_mode" "enum_orders_cart_mode" DEFAULT 'products_only',
      ADD COLUMN IF NOT EXISTS "product_fulfillment_mode" "enum_orders_product_fulfillment_mode" DEFAULT 'shipping',
      ADD COLUMN IF NOT EXISTS "appointment_mode" "enum_orders_appointment_mode" DEFAULT 'none',
      ADD COLUMN IF NOT EXISTS "appointment_status" "enum_orders_appointment_status" DEFAULT 'none',
      ADD COLUMN IF NOT EXISTS "appointment_requested_date" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "appointment_requested_time" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "cart_mode",
      DROP COLUMN IF EXISTS "product_fulfillment_mode",
      DROP COLUMN IF EXISTS "appointment_mode",
      DROP COLUMN IF EXISTS "appointment_status",
      DROP COLUMN IF EXISTS "appointment_requested_date",
      DROP COLUMN IF EXISTS "appointment_requested_time";

    DROP TYPE IF EXISTS "enum_orders_cart_mode";
    DROP TYPE IF EXISTS "enum_orders_product_fulfillment_mode";
    DROP TYPE IF EXISTS "enum_orders_appointment_mode";
    DROP TYPE IF EXISTS "enum_orders_appointment_status";
  `)
}

