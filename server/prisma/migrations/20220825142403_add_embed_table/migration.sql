-- CreateTable
CREATE TABLE "EncryptedEmbed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "note_id" TEXT NOT NULL,
    "embed_id" TEXT NOT NULL,
    "ciphertext" BLOB NOT NULL,
    "hmac" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    CONSTRAINT "EncryptedEmbed_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "EncryptedNote" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
