ALTER TABLE "services"
ADD COLUMN "animation_colors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
