import { EncryptedEmbed } from "@prisma/client";
import { BufferToBase64, base64ToBuffer } from "../util";
import prisma from "./client";

export interface EncryptedEmbedDTO {
  note_id: string;
  embed_id: string;
  ciphertext: string; // in base64
  hmac: string;
}

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

  console.log(embed.ciphertext.byteLength, embed.size_bytes);

  return {
    note_id: embed.note_id,
    embed_id: embed.embed_id,
    hmac: embed.hmac,
    ciphertext: BufferToBase64(embed.ciphertext),
  };
}

export async function createEmbed(
  embed: EncryptedEmbedDTO
): Promise<EncryptedEmbed> {
  const cipher_buf = base64ToBuffer(embed.ciphertext);
  const data = {
    note_id: embed.note_id,
    embed_id: embed.embed_id,
    hmac: embed.hmac,
    ciphertext: cipher_buf,
    size_bytes: cipher_buf.byteLength,
  } as EncryptedEmbed;
  return prisma.encryptedEmbed.create({ data });
}
