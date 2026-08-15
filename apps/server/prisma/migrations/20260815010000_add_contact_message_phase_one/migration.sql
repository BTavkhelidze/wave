ALTER TABLE "contact_messages" RENAME COLUMN "name" TO "full_name";

ALTER TABLE "contact_messages"
DROP COLUMN IF EXISTS "company",
ADD COLUMN "subject" TEXT,
ADD COLUMN "read_at" TIMESTAMPTZ(6),
ADD COLUMN "archived_at" TIMESTAMPTZ(6),
ADD COLUMN "updated_at" TIMESTAMPTZ(6);

UPDATE "contact_messages"
SET "updated_at" = COALESCE("created_at", now());

ALTER TABLE "contact_messages"
ALTER COLUMN "updated_at" SET NOT NULL;
