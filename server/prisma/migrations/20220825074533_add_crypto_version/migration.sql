-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EncryptedNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "insert_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ciphertext" TEXT NOT NULL,
    "hmac" TEXT NOT NULL,
    "crypto_version" TEXT NOT NULL DEFAULT 'v1'
);
INSERT INTO "new_EncryptedNote" ("ciphertext", "expire_time", "hmac", "id", "insert_time") SELECT "ciphertext", "expire_time", "hmac", "id", "insert_time" FROM "EncryptedNote";
DROP TABLE "EncryptedNote";
ALTER TABLE "new_EncryptedNote" RENAME TO "EncryptedNote";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
