/*
  Warnings:

  - You are about to drop the column `purge_count` on the `event` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "size_bytes" INTEGER,
    "note_id" TEXT,
    "host" TEXT,
    "error" TEXT,
    "expire_window_days" INTEGER
);
INSERT INTO "new_event" ("error", "expire_window_days", "host", "id", "size_bytes", "success", "time", "type") SELECT "error", "expire_window_days", "host", "id", "size_bytes", "success", "time", "type" FROM "event";
DROP TABLE "event";
ALTER TABLE "new_event" RENAME TO "event";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
