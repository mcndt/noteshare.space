-- CreateTable
CREATE TABLE "event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "size_bytes" INTEGER,
    "purge_count" INTEGER,
    "host" TEXT,
    "error" TEXT,
    "expire_window_days" INTEGER
);
