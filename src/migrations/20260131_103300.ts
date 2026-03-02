import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const toLexicalJSON = (column: string) => sql`
  CASE
    WHEN ${sql.raw(column)} IS NULL OR ${sql.raw(column)} = '' THEN NULL
    ELSE jsonb_build_object(
      'root',
      jsonb_build_object(
        'type', 'root',
        'format', '',
        'indent', 0,
        'version', 1,
        'direction', 'ltr',
        'children',
        jsonb_build_array(
          jsonb_build_object(
            'type', 'paragraph',
            'format', '',
            'indent', 0,
            'version', 1,
            'direction', 'ltr',
            'children',
            jsonb_build_array(
              jsonb_build_object(
                'type', 'text',
                'text', ${sql.raw(column)},
                'format', 0,
                'style', '',
                'detail', 0,
                'mode', 'normal',
                'version', 1
              )
            )
          )
        )
      )
    )
  END
`

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services_locales') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services_locales' AND column_name = 'results') THEN
          ALTER TABLE "services_locales"
            ALTER COLUMN "results" TYPE jsonb USING ${toLexicalJSON('results')};
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services_locales' AND column_name = 'indications') THEN
          ALTER TABLE "services_locales"
            ALTER COLUMN "indications" TYPE jsonb USING ${toLexicalJSON('indications')};
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services_locales' AND column_name = 'tech_protocol_short') THEN
          ALTER TABLE "services_locales"
            ALTER COLUMN "tech_protocol_short" TYPE jsonb USING ${toLexicalJSON('tech_protocol_short')};
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services_locales' AND column_name = 'downtime') THEN
          ALTER TABLE "services_locales"
            ALTER COLUMN "downtime" TYPE jsonb USING ${toLexicalJSON('downtime')};
        END IF;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services_locales') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services_locales' AND column_name = 'results') THEN
          ALTER TABLE "services_locales"
            ALTER COLUMN "results" TYPE varchar USING "results"::text;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services_locales' AND column_name = 'indications') THEN
          ALTER TABLE "services_locales"
            ALTER COLUMN "indications" TYPE varchar USING "indications"::text;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services_locales' AND column_name = 'tech_protocol_short') THEN
          ALTER TABLE "services_locales"
            ALTER COLUMN "tech_protocol_short" TYPE varchar USING "tech_protocol_short"::text;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services_locales' AND column_name = 'downtime') THEN
          ALTER TABLE "services_locales"
            ALTER COLUMN "downtime" TYPE varchar USING "downtime"::text;
        END IF;
      END IF;
    END $$;
  `)
}
