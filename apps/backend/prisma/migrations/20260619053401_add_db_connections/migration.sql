-- CreateTable
CREATE TABLE "DbConnection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "database" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DbConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DbQueryHistory" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "rowsCount" INTEGER,
    "connectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DbQueryHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DbConnection" ADD CONSTRAINT "DbConnection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DbQueryHistory" ADD CONSTRAINT "DbQueryHistory_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "DbConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
