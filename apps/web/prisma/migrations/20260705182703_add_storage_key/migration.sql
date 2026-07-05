/*
  Warnings:

  - Added the required column `storage_key` to the `papers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "papers" ADD COLUMN     "storage_key" TEXT;

-- Backfill existing (fixture) rows with a placeholder before enforcing NOT NULL.
UPDATE "papers" SET "storage_key" = 'seed/' || "filename" WHERE "storage_key" IS NULL;

ALTER TABLE "papers" ALTER COLUMN "storage_key" SET NOT NULL;
