import express from "express";
import supertest from "supertest";
import { vi, it, expect, describe, beforeEach, afterEach } from "vitest";
import { getEmbedController } from "./embeds.get.controller";
import * as embedDao from "../../../db/embed.dao";

vi.mock("../../../db/embed.dao");

const MOCK_EMBED_DTO: embedDao.EncryptedEmbedDTO = {
  note_id: "valid_note_id",
  embed_id: "valid_embed_id",
  ciphertext: Buffer.from("sample_ciphertext").toString("base64"),
  hmac: Buffer.from("sample_hmac").toString("base64"),
};

describe("Test GET embeds", () => {
  let app: express.Express;
  let mockEmbedDao = vi.mocked(embedDao);

  beforeEach(() => {
    app = express()
      .use(express.json())
      .get("/:id/embeds/:embed_id", getEmbedController);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("Should return 200 for a valid note_id+embed_id pair", async () => {
    // mock db response
    mockEmbedDao.getEmbed.mockImplementation(async (noteId, embedId) => {
      if (
        noteId === MOCK_EMBED_DTO.note_id &&
        embedId === MOCK_EMBED_DTO.embed_id
      ) {
        return MOCK_EMBED_DTO;
      }
      return null;
    });

    // make request
    const res = await supertest(app).get(
      "/valid_note_id/embeds/valid_embed_id"
    );

    // check response
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject(MOCK_EMBED_DTO);
  });

  it("Should return 404 for an invalid note_id+embed_id pair", async () => {
    // mock db response
    mockEmbedDao.getEmbed.mockImplementation(async (noteId, embedId) => {
      if (
        noteId === MOCK_EMBED_DTO.note_id &&
        embedId === MOCK_EMBED_DTO.embed_id
      ) {
        return MOCK_EMBED_DTO;
      }
      return null;
    });

    // make request
    const res = await supertest(app).get(
      "/invalid_note_id/embeds/invalid_embed_id"
    );

    // check response
    expect(res.statusCode).toBe(404);
  });

  it("Should return 500 on database failure", async () => {
    // mock db response
    mockEmbedDao.getEmbed.mockImplementation(async (noteId, embedId) => {
      throw new Error("Database failure");
    });

    // make request
    const res = await supertest(app).get(
      "/valid_note_id/embeds/valid_embed_id"
    );

    // check response
    expect(res.statusCode).toBe(500);
  });
});
