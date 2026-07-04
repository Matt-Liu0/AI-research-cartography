-- CreateEnum
CREATE TYPE "PaperStatus" AS ENUM ('queued', 'parsing', 'extracted', 'failed');

-- CreateTable
CREATE TABLE "papers" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT[],
    "year" INTEGER,
    "source_url" TEXT,
    "status" "PaperStatus" NOT NULL DEFAULT 'queued',
    "sections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "extraction" JSONB NOT NULL DEFAULT '{"claims":[],"methods":[],"datasets":[],"entities":[]}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "papers_pkey" PRIMARY KEY ("id")
);
