import { describe, it, expect } from "vitest";
import type { EncryptedNote } from "@prisma/client";
import { getEmbed, createEmbed } from "./embed.dao";
import { createNote } from "./note.dao";

const VALID_CIPHERTEXT = Buffer.from("sample_ciphertext").toString("base64");

describe("Reading and writing embeds", () => {
  it("Should write embeds for existing note", async () => {
    const note = await createNote({
      ciphertext: "test",
      hmac: "test",
      crypto_version: "v2",
    } as EncryptedNote);

    const embed = {
      note_id: note.id,
      embed_id: "embed_id",
      hmac: "hmac",
      ciphertext: VALID_CIPHERTEXT,
    };

    const res = await createEmbed(embed);

    expect(res.note_id).toEqual(embed.note_id);
    expect(res.embed_id).toEqual(embed.embed_id);
    expect(res.hmac).toEqual(embed.hmac);
    expect(res.id).not.toBeNull();
    expect(res.id.length).toBeGreaterThan(0);
    expect(res.ciphertext.byteLength).toBeGreaterThan(0);
  });

  it("Should throw if note_id does not refer to existing note", async () => {
    const embed = {
      note_id: "note_id",
      embed_id: "embed_id",
      hmac: "hmac",
      ciphertext: VALID_CIPHERTEXT,
    };

    await expect(createEmbed(embed)).rejects.toThrowError();
  });

  it("Should throw if embed_id is not unique", async () => {
    const note = await createNote({
      ciphertext: "test",
      hmac: "test",
      crypto_version: "v2",
    } as EncryptedNote);

    const embed = {
      note_id: note.id,
      embed_id: "embed_id",
      hmac: "hmac",
      ciphertext: VALID_CIPHERTEXT,
    };

    await createEmbed(embed); // embed 1
    await expect(createEmbed(embed)).rejects.toThrowError(/Duplicate embed/g); // duplicate embed
  });

  it("Should read embeds for existing note", async () => {
    const note = await createNote({
      ciphertext: "test",
      hmac: "test",
      crypto_version: "v2",
    } as EncryptedNote);

    const embed = {
      note_id: note.id,
      embed_id: "embed_id",
      hmac: "hmac",
      ciphertext: VALID_CIPHERTEXT,
    };

    await createEmbed(embed);
    const res = await getEmbed(note.id, embed.embed_id);

    expect(res).not.toBeNull();
    expect(res?.note_id).toEqual(embed.note_id);
    expect(res?.embed_id).toEqual(embed.embed_id);
    expect(res?.hmac).toEqual(embed.hmac);
    expect(res?.ciphertext).toEqual(embed.ciphertext);
  });
});
