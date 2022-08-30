import { EncryptedNote } from "@prisma/client";
import prisma from "./client";
import { createEmbed, EncryptedEmbedDTO } from "./embed.dao";

type EncryptedEmbed = {
  ciphertext: string;
  hmac: string;
  embed_id: string;
};

export async function getNote(noteId: string): Promise<EncryptedNote | null> {
  return prisma.encryptedNote.findUnique({
    where: { id: noteId },
  });
}

export async function createNote(
  note: EncryptedNote,
  embeds: EncryptedEmbed[] = []
): Promise<EncryptedNote> {
  return prisma.$transaction(async (transactionClient) => {
    // 1. Save note
    const savedNote = await transactionClient.encryptedNote.create({
      data: note,
    });

    // 2. Store embeds
    if (embeds.length > 0) {
      const _embeds: EncryptedEmbedDTO[] = embeds.map(
        (embed) =>
          ({
            ...embed,
            note_id: savedNote.id,
          } as EncryptedEmbedDTO)
      );
      for (const embed of _embeds) {
        await createEmbed(embed, transactionClient);
      }
    }

    // 3. Finalize transaction
    return savedNote;
  });
}

export async function getExpiredNotes(): Promise<EncryptedNote[]> {
  return prisma.encryptedNote.findMany({
    where: {
      expire_time: {
        lte: new Date(),
      },
    },
  });
}

export async function deleteNotes(noteIds: string[]): Promise<number> {
  return prisma.encryptedNote
    .deleteMany({
      where: { id: { in: noteIds } },
    })
    .then((deleted) => {
      return deleted.count;
    });
}
