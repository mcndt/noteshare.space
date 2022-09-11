-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EncryptedEmbed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "note_id" TEXT NOT NULL,
    "embed_id" TEXT NOT NULL,
    "ciphertext" BLOB NOT NULL,
    "hmac" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    CONSTRAINT "EncryptedEmbed_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "EncryptedNote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EncryptedEmbed" ("ciphertext", "embed_id", "hmac", "id", "note_id", "size_bytes") SELECT "ciphertext", "embed_id", "hmac", "id", "note_id", "size_bytes" FROM "EncryptedEmbed";
DROP TABLE "EncryptedEmbed";
ALTER TABLE "new_EncryptedEmbed" RENAME TO "EncryptedEmbed";
CREATE UNIQUE INDEX "EncryptedEmbed_note_id_embed_id_key" ON "EncryptedEmbed"("note_id", "embed_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
