import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "account_aesthetic_profiles" (
      "id" serial PRIMARY KEY,
      "user_id" integer NOT NULL,
      "last_assessment_date" timestamp(3) with time zone,
      "skin_type" varchar,
      "skin_sensitivity" varchar,
      "fitzpatrick" varchar,
      "hydration_level" numeric,
      "sebum_level" numeric,
      "elasticity_level" numeric,
      "acne_tendency" boolean DEFAULT false,
      "rosacea_tendency" boolean DEFAULT false,
      "hyperpigmentation_tendency" boolean DEFAULT false,
      "allergies" varchar,
      "contraindications" varchar,
      "medications" varchar,
      "pregnancy_or_breastfeeding" varchar,
      "home_care_routine" varchar,
      "treatment_goals" varchar,
      "esthetician_notes" varchar,
      "service_recommendations" varchar,
      "product_recommendations" varchar,
      "updated_at" timestamp(3) with time zone NOT NULL DEFAULT now(),
      "created_at" timestamp(3) with time zone NOT NULL DEFAULT now()
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'account_aesthetic_profiles_user_id_users_id_fk'
      ) THEN
        ALTER TABLE "account_aesthetic_profiles"
          ADD CONSTRAINT "account_aesthetic_profiles_user_id_users_id_fk"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
      END IF;
    END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "account_aesthetic_profiles_user_unique_idx"
      ON "account_aesthetic_profiles" ("user_id");

    CREATE INDEX IF NOT EXISTS "account_aesthetic_profiles_user_idx"
      ON "account_aesthetic_profiles" ("user_id");

    CREATE INDEX IF NOT EXISTS "account_aesthetic_profiles_updated_at_idx"
      ON "account_aesthetic_profiles" ("updated_at");

    CREATE INDEX IF NOT EXISTS "account_aesthetic_profiles_created_at_idx"
      ON "account_aesthetic_profiles" ("created_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "account_aesthetic_profiles"
      DROP CONSTRAINT IF EXISTS "account_aesthetic_profiles_user_id_users_id_fk";

    DROP INDEX IF EXISTS "account_aesthetic_profiles_user_unique_idx";
    DROP INDEX IF EXISTS "account_aesthetic_profiles_user_idx";
    DROP INDEX IF EXISTS "account_aesthetic_profiles_updated_at_idx";
    DROP INDEX IF EXISTS "account_aesthetic_profiles_created_at_idx";

    DROP TABLE IF EXISTS "account_aesthetic_profiles";
  `)
}
