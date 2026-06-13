-- SQL schema initialization script for Love Memories database (PostgreSQL / Supabase)

-- Create Enums
CREATE TYPE "LinkType" AS ENUM ('LOVE', 'EVERY', 'IDOL');
CREATE TYPE "GameLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- 1. Create admins table
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- 2. Create users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" VARCHAR(6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- 3. Create links table
CREATE TABLE "links" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "LinkType" NOT NULL DEFAULT 'LOVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "qr_code_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "profile_data" JSONB,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- 4. Create link_configs table
CREATE TABLE "link_configs" (
    "id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "background_color" TEXT DEFAULT '#ffffff',
    "accent_color" TEXT DEFAULT '#ec4899',
    "font_family" TEXT DEFAULT 'Inter',
    "music_url" TEXT,
    "auto_play" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "link_configs_pkey" PRIMARY KEY ("id")
);

-- 5. Create galleries table
CREATE TABLE "galleries" (
    "id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galleries_pkey" PRIMARY KEY ("id")
);

-- 6. Create timelines table
CREATE TABLE "timelines" (
    "id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "video_url" TEXT,
    "audio_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timelines_pkey" PRIMARY KEY ("id")
);

-- 7. Create letters table
CREATE TABLE "letters" (
    "id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "video_url" TEXT,
    "audio_url" TEXT,
    "unlock_date" TIMESTAMP(3),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "letters_pkey" PRIMARY KEY ("id")
);

-- 8. Create letter_replies table
CREATE TABLE "letter_replies" (
    "id" TEXT NOT NULL,
    "letter_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "letter_replies_pkey" PRIMARY KEY ("id")
);

-- 9. Create game_cards table
CREATE TABLE "game_cards" (
    "id" TEXT NOT NULL,
    "level" "GameLevel" NOT NULL DEFAULT 'EASY',
    "content" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_cards_pkey" PRIMARY KEY ("id")
);

-- Create Unique Indexes
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "links_user_id_key" ON "links"("user_id");
CREATE UNIQUE INDEX "links_slug_key" ON "links"("slug");
CREATE UNIQUE INDEX "link_configs_link_id_key" ON "link_configs"("link_id");

-- Create Indexes
CREATE INDEX "links_slug_idx" ON "links"("slug");
CREATE INDEX "galleries_link_id_idx" ON "galleries"("link_id");
CREATE INDEX "galleries_link_id_sort_order_idx" ON "galleries"("link_id", "sort_order");
CREATE INDEX "timelines_link_id_idx" ON "timelines"("link_id");
CREATE INDEX "timelines_link_id_date_idx" ON "timelines"("link_id", "date");
CREATE INDEX "letters_link_id_idx" ON "letters"("link_id");
CREATE INDEX "letter_replies_letter_id_idx" ON "letter_replies"("letter_id");
CREATE INDEX "game_cards_level_idx" ON "game_cards"("level");
CREATE INDEX "game_cards_level_is_active_idx" ON "game_cards"("level", "is_active");

-- Add Foreign Key Constraints
ALTER TABLE "links" ADD CONSTRAINT "links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "link_configs" ADD CONSTRAINT "link_configs_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "timelines" ADD CONSTRAINT "timelines_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "letters" ADD CONSTRAINT "letters_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "letter_replies" ADD CONSTRAINT "letter_replies_letter_id_fkey" FOREIGN KEY ("letter_id") REFERENCES "letters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
