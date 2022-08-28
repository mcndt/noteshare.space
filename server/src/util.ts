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

// base64 to array buffer (Node JS api, so don't use atob or btoa)
export function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, "base64");
}

// array buffer to base64 (Node JS api, so don't use atob or btoa)
export function BufferToBase64(buffer: Buffer): string {
  return Buffer.from(buffer).toString("base64");
}
