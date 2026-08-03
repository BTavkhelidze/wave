CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED');

ALTER TABLE "blogs" RENAME COLUMN "cover_image" TO "cover_image_key";

ALTER TABLE "blogs"
ADD COLUMN "title" TEXT,
ADD COLUMN "excerpt" TEXT,
ADD COLUMN "content" TEXT,
ADD COLUMN "cover_image_url" TEXT,
ADD COLUMN "language" "Language",
ADD COLUMN "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "is_featured" BOOLEAN NOT NULL DEFAULT false;

UPDATE "blogs"
SET
  "title" = COALESCE("source_translation"."title", ''),
  "excerpt" = COALESCE("source_translation"."excerpt", ''),
  "content" = COALESCE("source_translation"."content", ''),
  "language" = COALESCE("source_translation"."language", 'EN'::"Language"),
  "status" = CASE
    WHEN "blogs"."is_published" = true THEN 'PUBLISHED'::"BlogStatus"
    ELSE 'DRAFT'::"BlogStatus"
  END,
  "cover_image_key" = COALESCE("blogs"."cover_image_key", ''),
  "cover_image_url" = COALESCE("blogs"."cover_image_key", '')
FROM (
  SELECT DISTINCT ON ("blog_id")
    "blog_id",
    "title",
    "excerpt",
    "content",
    "language"
  FROM "blog_translations"
  ORDER BY "blog_id", CASE WHEN "language" = 'EN'::"Language" THEN 0 ELSE 1 END
) AS "source_translation"
WHERE "source_translation"."blog_id" = "blogs"."id";

UPDATE "blogs"
SET
  "title" = COALESCE("title", ''),
  "excerpt" = COALESCE("excerpt", ''),
  "content" = COALESCE("content", ''),
  "language" = COALESCE("language", 'EN'::"Language"),
  "cover_image_key" = COALESCE("cover_image_key", ''),
  "cover_image_url" = COALESCE("cover_image_url", COALESCE("cover_image_key", ''));

ALTER TABLE "blogs"
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "excerpt" SET NOT NULL,
ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "cover_image_key" SET NOT NULL,
ALTER COLUMN "cover_image_url" SET NOT NULL,
ALTER COLUMN "language" SET NOT NULL;

DROP INDEX IF EXISTS "blogs_is_published_idx";
DROP INDEX IF EXISTS "blogs_author_id_idx";
DROP TABLE IF EXISTS "blog_translations";

ALTER TABLE "blogs" DROP COLUMN "is_published";
ALTER TABLE "blogs" DROP COLUMN "author_id";
ALTER TABLE "blogs" DROP COLUMN "deleted_at";

CREATE INDEX "blogs_language_idx" ON "blogs"("language");
CREATE INDEX "blogs_status_idx" ON "blogs"("status");
CREATE INDEX "blogs_is_featured_idx" ON "blogs"("is_featured");
CREATE INDEX "blogs_created_at_idx" ON "blogs"("created_at");
