import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      CREATE TYPE "public"."enum_auth_audit_events_event_type" AS ENUM(
        'login_success',
        'login_failed',
        'forgot_password',
        'reset_password'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END
    $$;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "auth_audit_events" (
      "id" serial PRIMARY KEY NOT NULL,
      "event_type" "public"."enum_auth_audit_events_event_type" NOT NULL,
      "success" boolean DEFAULT true NOT NULL,
      "email" varchar,
      "user_id" integer,
      "ip" varchar,
      "user_agent" varchar,
      "message" varchar,
      "meta" jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "auth_audit_events_event_type_idx" ON "auth_audit_events" ("event_type");
    CREATE INDEX IF NOT EXISTS "auth_audit_events_success_idx" ON "auth_audit_events" ("success");
    CREATE INDEX IF NOT EXISTS "auth_audit_events_email_idx" ON "auth_audit_events" ("email");
    CREATE INDEX IF NOT EXISTS "auth_audit_events_user_id_idx" ON "auth_audit_events" ("user_id");
    CREATE INDEX IF NOT EXISTS "auth_audit_events_ip_idx" ON "auth_audit_events" ("ip");
    CREATE INDEX IF NOT EXISTS "auth_audit_events_created_at_idx" ON "auth_audit_events" ("created_at");
  `)

  await db.execute(sql`
    DO $$
    BEGIN
      ALTER TABLE "auth_audit_events"
        ADD CONSTRAINT "auth_audit_events_user_id_users_id_fk"
        FOREIGN KEY ("user_id")
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
    ALTER TABLE "auth_audit_events" DROP CONSTRAINT IF EXISTS "auth_audit_events_user_id_users_id_fk";
    DROP TABLE IF EXISTS "auth_audit_events";
    DROP TYPE IF EXISTS "public"."enum_auth_audit_events_event_type";
  `)
}
