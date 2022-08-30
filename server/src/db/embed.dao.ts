import { EncryptedEmbed, Prisma, PrismaClient } from "@prisma/client";
import { BufferToBase64, base64ToBuffer } from "../util";
import prisma from "./client";

export interface EncryptedEmbedDTO {
  note_id: string;
  embed_id: string;
  ciphertext: string; // in base64
  hmac: string;
}

/**
 * Get an embed for a note by embed_id.
 * @param noteId note id
 * @param embedId embed id
 * @returns encrypted embed (serialized ciphertext to base64)
 */
export async function getEmbed(
  noteId: string,
  embedId: string
): Promise<EncryptedEmbedDTO | null> {
  const embed = await prisma.encryptedEmbed.findUnique({
    where: {
      noteId_embedId: {
        note_id: noteId,
        embed_id: embedId,
      },
    },
  });

  if (!embed) return null;

  return {
    note_id: embed.note_id,
    embed_id: embed.embed_id,
    hmac: embed.hmac,
    ciphertext: BufferToBase64(embed.ciphertext),
  };
}

/**
 * Create an embed for a note.
 * @param embed EncryptedEmbedDTO to serialize and save
 * @param transactionClient optionally pass a TransactionClient object when running in a Prisma interactive transaction
 * @returns the saved EncryptedEmbed (deserialized ciphertext to Buffer)
 */
export async function createEmbed(
  embed: EncryptedEmbedDTO,
  transactionClient: Prisma.TransactionClient = prisma
): Promise<EncryptedEmbed> {
  const cipher_buf = base64ToBuffer(embed.ciphertext);
  const data = {
    note_id: embed.note_id,
    embed_id: embed.embed_id,
    hmac: embed.hmac,
    ciphertext: cipher_buf,
    size_bytes: cipher_buf.byteLength,
  } as EncryptedEmbed;
  return transactionClient.encryptedEmbed.create({ data }).catch((err) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (err.code === "P2002") {
        throw new Error("Duplicate embed");
      }
    }
    throw err;
  });
}
