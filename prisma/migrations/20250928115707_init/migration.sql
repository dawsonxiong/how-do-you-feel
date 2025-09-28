-- CreateTable
CREATE TABLE "mood_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "tags" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
