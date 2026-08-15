CREATE TYPE "OutboundEmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

ALTER TYPE "AdminEntity" ADD VALUE 'OUTBOUND_EMAIL';

CREATE TABLE "outbound_emails" (
  "id" TEXT NOT NULL,
  "recipient_email" TEXT NOT NULL,
  "recipient_name" TEXT,
  "subject" TEXT NOT NULL,
  "heading" TEXT,
  "message" TEXT NOT NULL,
  "button_text" TEXT,
  "button_url" TEXT,
  "status" "OutboundEmailStatus" NOT NULL DEFAULT 'PENDING',
  "provider_message_id" TEXT,
  "failure_code" TEXT,
  "sent_at" TIMESTAMPTZ(6),
  "created_by_user_id" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "outbound_emails_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "outbound_emails_status_idx" ON "outbound_emails"("status");

CREATE INDEX "outbound_emails_created_at_idx" ON "outbound_emails"("created_at");

CREATE INDEX "outbound_emails_created_by_user_id_idx" ON "outbound_emails"("created_by_user_id");

CREATE INDEX "outbound_emails_status_created_at_idx" ON "outbound_emails"("status", "created_at");

ALTER TABLE "outbound_emails"
ADD CONSTRAINT "outbound_emails_created_by_user_id_fkey"
FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
