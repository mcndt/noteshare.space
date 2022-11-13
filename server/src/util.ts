import { EncryptedNote } from "@prisma/client";
import { Request } from "express";

export function addDays(date: Date, days: number): Date {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getConnectingIp(req: Request): string {
  return (req.headers["cf-connecting-ip"] ||
    req.headers["X-Forwarded-For"] ||
    req.socket.remoteAddress) as string;
}

export function getNoteSize(
  note: Pick<EncryptedNote, "ciphertext" | "hmac" | "iv">
) {
  return (
    note.ciphertext.length + (note.hmac?.length ?? 0) + (note.iv?.length ?? 0)
  );
}
