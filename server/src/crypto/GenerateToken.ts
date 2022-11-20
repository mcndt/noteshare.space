import crypto from "crypto";

/**
 * Generates a 256 bit token using the nodeJS crypto module.
 * @returns base 64-encoded token.
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("base64");
}
