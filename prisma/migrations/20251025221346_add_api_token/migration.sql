-- Production got this column from `db push`, so guard against it already existing.
-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "apiToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_apiToken_key" ON "users"("apiToken");
