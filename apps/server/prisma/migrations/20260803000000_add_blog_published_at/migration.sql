ALTER TABLE "blogs"
ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMPTZ(6);

CREATE INDEX IF NOT EXISTS "blogs_published_at_idx" ON "blogs"("published_at");
