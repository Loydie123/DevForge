-- CreateTable
CREATE TABLE "UptimeCheck" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 60,
    "status" TEXT NOT NULL DEFAULT 'unknown',
    "latencyMs" INTEGER,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UptimeCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UptimeResult" (
    "id" TEXT NOT NULL,
    "statusCode" INTEGER,
    "latencyMs" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "uptimeCheckId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UptimeResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UptimeCheck" ADD CONSTRAINT "UptimeCheck_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UptimeResult" ADD CONSTRAINT "UptimeResult_uptimeCheckId_fkey" FOREIGN KEY ("uptimeCheckId") REFERENCES "UptimeCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
