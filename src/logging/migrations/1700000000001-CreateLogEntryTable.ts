import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLogEntryTable1700000000001 implements MigrationInterface {
  name = 'CreateLogEntryTable1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."log_entry_level_enum" AS ENUM('error', 'warn', 'info', 'debug')
    `);

    await queryRunner.query(`
      CREATE TABLE "log_entry" (
        "id" SERIAL NOT NULL,
        "level" "public"."log_entry_level_enum" NOT NULL,
        "message" text NOT NULL,
        "context" character varying,
        "method" character varying,
        "url" character varying,
        "userAgent" text,
        "ip" character varying,
        "userId" integer,
        "statusCode" integer,
        "responseTime" integer,
        "requestId" character varying,
        "metadata" jsonb,
        "timestamp" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_log_entry" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_log_entry_level" ON "log_entry" ("level")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_log_entry_userId" ON "log_entry" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_log_entry_requestId" ON "log_entry" ("requestId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_log_entry_timestamp" ON "log_entry" ("timestamp")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_log_entry_timestamp"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_log_entry_requestId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_log_entry_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_log_entry_level"`);
    await queryRunner.query(`DROP TABLE "log_entry"`);
    await queryRunner.query(`DROP TYPE "public"."log_entry_level_enum"`);
  }
}
