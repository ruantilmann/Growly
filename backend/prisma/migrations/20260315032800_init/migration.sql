-- CreateEnum
CREATE TYPE "UserLevel" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('healthy', 'warning', 'critical', 'unknown');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('watering', 'fertilization', 'pruning');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('disease', 'dehydration', 'overwatering', 'general');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "level" "UserLevel" NOT NULL DEFAULT 'beginner',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plants" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT,
    "location" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_images" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "image_path" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plant_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "diagnosis" JSONB NOT NULL,
    "health_status" "HealthStatus" NOT NULL DEFAULT 'unknown',
    "recommendations" TEXT NOT NULL,
    "probable_species" TEXT,
    "possible_diseases" JSONB,
    "watering_frequency_days" INTEGER,
    "care_tips" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_schedules" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "watering_interval_days" INTEGER NOT NULL,
    "next_watering_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "care_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_events" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,

    CONSTRAINT "care_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_library" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "characteristics" TEXT NOT NULL,
    "general_instructions" TEXT NOT NULL,

    CONSTRAINT "plant_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "plant_id" TEXT NOT NULL,
    "type" "AlertType" NOT NULL DEFAULT 'general',
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_id_account_id_key" ON "accounts"("provider_id", "account_id");

-- CreateIndex
CREATE UNIQUE INDEX "verifications_identifier_value_key" ON "verifications"("identifier", "value");

-- CreateIndex
CREATE INDEX "plants_user_id_idx" ON "plants"("user_id");

-- CreateIndex
CREATE INDEX "plant_images_plant_id_idx" ON "plant_images"("plant_id");

-- CreateIndex
CREATE INDEX "diagnoses_plant_id_idx" ON "diagnoses"("plant_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_schedules_plant_id_key" ON "care_schedules"("plant_id");

-- CreateIndex
CREATE INDEX "care_events_plant_id_event_date_idx" ON "care_events"("plant_id", "event_date");

-- CreateIndex
CREATE UNIQUE INDEX "plant_library_name_key" ON "plant_library"("name");

-- CreateIndex
CREATE INDEX "alerts_plant_id_created_at_idx" ON "alerts"("plant_id", "created_at");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plants" ADD CONSTRAINT "plants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_images" ADD CONSTRAINT "plant_images_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_schedules" ADD CONSTRAINT "care_schedules_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_events" ADD CONSTRAINT "care_events_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
