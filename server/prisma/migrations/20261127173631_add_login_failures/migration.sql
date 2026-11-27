-- CreateTable
CREATE TABLE "login_failures" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_failures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_failures_email_created_at_idx" ON "login_failures"("email", "created_at");
