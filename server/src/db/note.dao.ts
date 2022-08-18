import { EncryptedNote } from "@prisma/client";
import prisma from "./client";

export async function getNote(noteId: string): Promise<EncryptedNote | null> {
  return prisma.encryptedNote.findUnique({
    where: { id: noteId },
  });
}

export async function createNote(note: EncryptedNote): Promise<EncryptedNote> {
  return prisma.encryptedNote.create({
    data: note,
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
