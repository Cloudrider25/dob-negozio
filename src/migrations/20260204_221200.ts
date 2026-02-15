import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "attributes_values_locales" DROP CONSTRAINT IF EXISTS "attributes_values_locales_parent_id_fk";

    ALTER TABLE "attributes_values" ALTER COLUMN "id" DROP DEFAULT;
    ALTER TABLE "attributes_values" ALTER COLUMN "id" TYPE varchar USING "id"::varchar;

    ALTER TABLE "attributes_values_locales"
      ALTER COLUMN "_parent_id" TYPE varchar USING "_parent_id"::varchar;

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attributes_values_locales_parent_id_fk') THEN
        ALTER TABLE "attributes_values_locales"
          ADD CONSTRAINT "attributes_values_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."attributes_values"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    ALTER TABLE "exclusions"
      ALTER COLUMN "attribute_value_id" TYPE varchar USING "attribute_value_id"::varchar;

    ALTER TABLE "boosts"
      ALTER COLUMN "attribute_value_id" TYPE varchar USING "attribute_value_id"::varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "attributes_values_locales" DROP CONSTRAINT IF EXISTS "attributes_values_locales_parent_id_fk";

    ALTER TABLE "boosts"
      ALTER COLUMN "attribute_value_id" TYPE numeric USING "attribute_value_id"::numeric;

    ALTER TABLE "exclusions"
      ALTER COLUMN "attribute_value_id" TYPE numeric USING "attribute_value_id"::numeric;

    ALTER TABLE "attributes_values_locales"
      ALTER COLUMN "_parent_id" TYPE integer USING "_parent_id"::integer;

    ALTER TABLE "attributes_values"
      ALTER COLUMN "id" TYPE integer USING "id"::integer;

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attributes_values_locales_parent_id_fk') THEN
        ALTER TABLE "attributes_values_locales"
          ADD CONSTRAINT "attributes_values_locales_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."attributes_values"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;

    ALTER TABLE "attributes_values" ALTER COLUMN "id" SET DEFAULT nextval('attributes_values_id_seq'::regclass);
  `)
}
