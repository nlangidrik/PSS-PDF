-- CreateTable
CREATE TABLE "UsageEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "actorEmail" TEXT,
    "actorName" TEXT,
    "action" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSizeBytes" INTEGER,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsageEvent_actorEmail_idx" ON "UsageEvent"("actorEmail");

-- CreateIndex
CREATE INDEX "UsageEvent_action_idx" ON "UsageEvent"("action");

-- CreateIndex
CREATE INDEX "UsageEvent_occurredAt_idx" ON "UsageEvent"("occurredAt");
