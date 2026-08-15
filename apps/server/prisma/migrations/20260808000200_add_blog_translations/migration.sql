CREATE TABLE "blog_translations" (
    "id" TEXT NOT NULL,
    "blog_id" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,

    CONSTRAINT "blog_translations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "blog_translations_blog_id_language_key" ON "blog_translations"("blog_id", "language");

CREATE UNIQUE INDEX "blog_translations_language_slug_key" ON "blog_translations"("language", "slug");

CREATE INDEX "blog_translations_language_idx" ON "blog_translations"("language");

ALTER TABLE "blog_translations" ADD CONSTRAINT "blog_translations_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
