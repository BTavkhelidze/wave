-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'KA');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OutboundEmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "AdminAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'PASSWORD_CHANGE', 'LOGIN', 'LOGOUT', 'PUBLISH', 'UNPUBLISH', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "AdminEntity" AS ENUM ('USER', 'SERVICE', 'BLOG', 'CONTACT_MESSAGE', 'OUTBOUND_EMAIL');

-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "hashed_refresh_token" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,
    "password_changed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "icon_color" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_translations" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,

    CONSTRAINT "service_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cover_image_key" TEXT NOT NULL,
    "cover_image_url" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMPTZ(6),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'UNREAD',
    "read_at" TIMESTAMPTZ(6),
    "archived_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "admin_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" "AdminAction" NOT NULL,
    "entity" "AdminEntity" NOT NULL,
    "entity_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "services_is_active_idx" ON "services"("is_active");

-- CreateIndex
CREATE INDEX "services_sort_order_idx" ON "services"("sort_order");

-- CreateIndex
CREATE INDEX "service_translations_language_idx" ON "service_translations"("language");

-- CreateIndex
CREATE UNIQUE INDEX "service_translations_service_id_language_key" ON "service_translations"("service_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "service_translations_language_slug_key" ON "service_translations"("language", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "blogs_language_idx" ON "blogs"("language");

-- CreateIndex
CREATE INDEX "blogs_status_idx" ON "blogs"("status");

-- CreateIndex
CREATE INDEX "blogs_is_featured_idx" ON "blogs"("is_featured");

-- CreateIndex
CREATE INDEX "blogs_published_at_idx" ON "blogs"("published_at");

-- CreateIndex
CREATE INDEX "blogs_created_at_idx" ON "blogs"("created_at");

-- CreateIndex
CREATE INDEX "blog_translations_language_idx" ON "blog_translations"("language");

-- CreateIndex
CREATE UNIQUE INDEX "blog_translations_blog_id_language_key" ON "blog_translations"("blog_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "blog_translations_language_slug_key" ON "blog_translations"("language", "slug");

-- CreateIndex
CREATE INDEX "contact_messages_status_idx" ON "contact_messages"("status");

-- CreateIndex
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at");

-- CreateIndex
CREATE INDEX "outbound_emails_status_idx" ON "outbound_emails"("status");

-- CreateIndex
CREATE INDEX "outbound_emails_created_at_idx" ON "outbound_emails"("created_at");

-- CreateIndex
CREATE INDEX "outbound_emails_created_by_user_id_idx" ON "outbound_emails"("created_by_user_id");

-- CreateIndex
CREATE INDEX "outbound_emails_status_created_at_idx" ON "outbound_emails"("status", "created_at");

-- CreateIndex
CREATE INDEX "admin_logs_user_id_idx" ON "admin_logs"("user_id");

-- CreateIndex
CREATE INDEX "admin_logs_action_idx" ON "admin_logs"("action");

-- CreateIndex
CREATE INDEX "admin_logs_entity_idx" ON "admin_logs"("entity");

-- CreateIndex
CREATE INDEX "admin_logs_created_at_idx" ON "admin_logs"("created_at");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_translations" ADD CONSTRAINT "service_translations_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_translations" ADD CONSTRAINT "blog_translations_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbound_emails" ADD CONSTRAINT "outbound_emails_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
