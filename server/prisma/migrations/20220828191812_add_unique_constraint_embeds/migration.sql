/*
  Warnings:

  - A unique constraint covering the columns `[note_id,embed_id]` on the table `EncryptedEmbed` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EncryptedEmbed_note_id_embed_id_key" ON "EncryptedEmbed"("note_id", "embed_id");
