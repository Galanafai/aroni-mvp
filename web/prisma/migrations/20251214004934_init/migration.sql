-- CreateTable
CREATE TABLE "PackageMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "weightKg" REAL NOT NULL,
    "dimensions" TEXT NOT NULL,
    "packageType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "carrierId" TEXT,
    "urgencyLevel" TEXT NOT NULL,
    "hsCode" TEXT NOT NULL,
    "nestedWithin" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ScanLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackingId" TEXT NOT NULL,
    "scannedQuantity" INTEGER NOT NULL,
    "scannedWeightKg" REAL NOT NULL,
    "scannedDimensions" TEXT NOT NULL,
    "location" TEXT,
    "result" TEXT NOT NULL,
    "notes" TEXT,
    "scanHash" TEXT NOT NULL,
    "scanTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScanLog_trackingId_fkey" FOREIGN KEY ("trackingId") REFERENCES "PackageMetadata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
