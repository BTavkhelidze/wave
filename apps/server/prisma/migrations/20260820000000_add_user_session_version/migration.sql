-- Add session versioning for immediate JWT invalidation after password changes.
ALTER TABLE "users" ADD COLUMN "session_version" INTEGER NOT NULL DEFAULT 0;
