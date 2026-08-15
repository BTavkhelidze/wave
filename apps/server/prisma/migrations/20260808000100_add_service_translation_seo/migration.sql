ALTER TABLE "service_translations"
ADD COLUMN "slug" TEXT,
ADD COLUMN "meta_title" TEXT,
ADD COLUMN "meta_description" TEXT;

UPDATE "service_translations"
SET "slug" = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(trim("title"), '[^a-zA-Z0-9[:space:]-]', '', 'g'),
      '[[:space:]]+',
      '-',
      'g'
    ),
    '-+',
    '-',
    'g'
  )
);

UPDATE "service_translations"
SET "slug" = regexp_replace(regexp_replace("slug", '^-+', ''), '-+$', '');

UPDATE "service_translations"
SET "slug" = 'service-' || replace("id"::text, '-', '')
WHERE "slug" IS NULL OR "slug" = '';

WITH ranked_slugs AS (
  SELECT
    "id",
    "slug",
    row_number() OVER (
      PARTITION BY "language", "slug"
      ORDER BY "id"
    ) AS duplicate_index
  FROM "service_translations"
)
UPDATE "service_translations" AS service_translation
SET "slug" = ranked_slugs."slug" || '-' || replace(service_translation."id"::text, '-', '')
FROM ranked_slugs
WHERE service_translation."id" = ranked_slugs."id"
  AND ranked_slugs.duplicate_index > 1;

ALTER TABLE "service_translations"
ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "service_translations_language_slug_key"
ON "service_translations"("language", "slug");
