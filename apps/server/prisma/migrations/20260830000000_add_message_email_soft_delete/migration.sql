-- Add soft deletion metadata for contact messages and outbound email history.
ALTER TABLE "contact_messages"
ADD COLUMN "deleted_at" TIMESTAMPTZ(6),
ADD COLUMN "deleted_by_user_id" TEXT;

ALTER TABLE "outbound_emails"
ADD COLUMN "deleted_at" TIMESTAMPTZ(6),
ADD COLUMN "deleted_by_user_id" TEXT;

ALTER TABLE "contact_messages"
ADD CONSTRAINT "contact_messages_deleted_by_user_id_fkey"
FOREIGN KEY ("deleted_by_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "outbound_emails"
ADD CONSTRAINT "outbound_emails_deleted_by_user_id_fkey"
FOREIGN KEY ("deleted_by_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "contact_messages_deleted_at_idx" ON "contact_messages"("deleted_at");
CREATE INDEX "contact_messages_status_deleted_at_idx" ON "contact_messages"("status", "deleted_at");
CREATE INDEX "outbound_emails_deleted_at_idx" ON "outbound_emails"("deleted_at");
CREATE INDEX "outbound_emails_status_deleted_at_idx" ON "outbound_emails"("status", "deleted_at");
