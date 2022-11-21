import express from "express";
import supertest from "supertest";
import { vi, describe, it, beforeEach, afterEach, expect } from "vitest";
import * as noteDao from "../../db/note.dao";
import EventLogger from "../../logging/EventLogger";
import { NotePostRequest } from "../../validation/Request";
import { postNoteController } from "./note.post.controller";

vi.mock("../../db/note.dao");
vi.mock("../../logging/EventLogger");

const VALID_CIPHERTEXT = Buffer.from("sample_ciphertext").toString("base64");
const VALID_HMAC = Buffer.from("sample_hmac").toString("base64");
const VALID_VERSION = "1.0.0";
const MALFORMED_VERSION = "v1.0.0";
const VALID_USER_ID = "f06536e7df6857fc";
const MALFORMED_ID_WRONG_CRC = "f06536e7df6857fd";
const MALFORMED_ID_WRONG_LENGTH = "0";
const VALID_CRYPTO_VERSION = "v99";
const MALFORMED_CRYPTO_VERSION = "32";

const MOCK_NOTE_ID = "1234";

type TestParams = {
  payload: Partial<NotePostRequest>;
  expectedStatus: number;
};

const TEST_PAYLOADS: TestParams[] = [
  // Request with valid ciphertext and hmac
  {
    payload: {
      ciphertext: VALID_CIPHERTEXT,
      hmac: VALID_HMAC,
    },
    expectedStatus: 200,
  },
  // Request with valid ciphertext, hmac, user id, and plugin version
  {
    payload: {
      ciphertext: VALID_CIPHERTEXT,
      hmac: VALID_HMAC,
      user_id: VALID_USER_ID,
      plugin_version: VALID_VERSION,
    },
    expectedStatus: 200,
  },
  // Request with non-base64 ciphertext
  {
    payload: {
      ciphertext: "not_base64",
      hmac: VALID_HMAC,
    },
    expectedStatus: 400,
  },
  // Request with non-base64 hmac
  {
    payload: {
      ciphertext: VALID_CIPHERTEXT,
      hmac: "not_base64",
    },
    expectedStatus: 400,
  },
  // Request with empty ciphertext
  {
    payload: {
      ciphertext: "",
      hmac: VALID_HMAC,
    },
    expectedStatus: 400,
  },
  // Request with empty hmac
  {
    payload: {
      ciphertext: VALID_CIPHERTEXT,
      hmac: "",
    },
    expectedStatus: 400,
  },
  // Request with valid user id
  {
    payload: {
      ciphertext: VALID_CIPHERTEXT,
      hmac: VALID_HMAC,
      user_id: VALID_USER_ID,
    },
    expectedStatus: 200,
  },
  // Request with malformed user id (wrong crc)
  {
    payload: {
      ciphertext: VALID_CIPHERTEXT,
      hmac: VALID_HMAC,
      user_id: MALFORMED_ID_WRONG_CRC,
    },
    expectedStatus: 400,
  },
  // Request with malformed user id (wrong length)
  {
    payload: {
      ciphertext: VALID_CIPHERTEXT,
      hmac: VALID_HMAC,
      user_id: MALFORMED_ID_WRONG_LENGTH,
    },
    expectedStatus: 400,
  },
  // Request with valid plugin version
  {
    payload: {
      ciphertext: VALID_CIPHERTEXT,
      hmac: VALID_HMAC,
      plugin_version: VALID_VERSION,
    },
    expectedStatus: 200,
  },
  // Request with malformed plugin version
  {
    payload: {
      ciphertext: VALID_CIPHERTEXT,
      hmac: VALID_HMAC,
      plugin_version: MALFORMED_VERSION,
    },
    expectedStatus: 400,
  },
  // Request with valid ciphertext, hmac, user id, plugin version, and crypto version
  {
    payload: {
      ciphertext: VALID_CIPHERTEXT,
      hmac: VALID_HMAC,
      user_id: VALID_USER_ID,
      plugin_version: VALID_VERSION,
      crypto_version: VALID_CRYPTO_VERSION,
    },
    expectedStatus: 200,
  },
  // Request with malformed crypto version
  {
    payload: {
      ciphertext: VALID_CIPHERTEXT,
      hmac: VALID_HMAC,
      user_id: VALID_USER_ID,
      plugin_version: VALID_VERSION,
      crypto_version: MALFORMED_CRYPTO_VERSION,
    },
    expectedStatus: 400,
  },
];

describe("note.post.controller", () => {
  let mockNoteDao = vi.mocked(noteDao);
  let mockEventLogger = vi.mocked(EventLogger);

  const test_app = express().use(express.json()).post("/", postNoteController);

  beforeEach(() => {
    // database writes always succeed
    mockNoteDao.createNote.mockImplementation(async (note) => ({
      ...note,
      id: MOCK_NOTE_ID,
      insert_time: new Date(),
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it.each(TEST_PAYLOADS)("test payloads", async (params) => {
    const { payload, expectedStatus } = params;

    // make request
    const res = await supertest(test_app).post("/").send(payload);
    expect(res.status).toBe(expectedStatus);

    // Validate reponse body
    if (expectedStatus === 200) {
      // validate view_url
      expect(res.body).toHaveProperty("view_url");
      expect(res.body.view_url).toMatch(/^http[s]?:\/\//);
      expect(res.body.view_url).toMatch(MOCK_NOTE_ID);
      // validate_expire_time
      expect(res.body).toHaveProperty("expire_time");
      expect(new Date(res.body.expire_time).getTime()).toBeGreaterThan(
        new Date().getTime()
      );
    }

    // Validate DAO calls
    if (expectedStatus === 200) {
      expect(mockNoteDao.createNote).toHaveBeenCalledTimes(1);
      expect(mockNoteDao.createNote).toHaveBeenCalledWith(
        expect.objectContaining({
          ciphertext: payload.ciphertext,
          hmac: payload.hmac,
          crypto_version: payload.crypto_version || "v1",
          expire_time: expect.any(Date),
        })
      );
    }

    // Validate Write events
    expect(mockEventLogger.writeEvent).toHaveBeenCalledOnce();
    if (expectedStatus === 200) {
      expect(mockEventLogger.writeEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          host: expect.any(String),
          note_id: MOCK_NOTE_ID,
          size_bytes: expect.any(Number),
          expire_window_days: expect.any(Number),
          user_id: params.payload.user_id,
          user_plugin_version: params.payload.plugin_version,
        })
      );
    } else {
      expect(mockEventLogger.writeEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          host: expect.any(String),
          error: expect.any(String),
          user_id: params.payload.user_id,
          user_plugin_version: params.payload.plugin_version,
        })
      );
    }
  });

  it("test database write failure", async () => {
    // Mock database writes always fail
    mockNoteDao.createNote.mockImplementation(async (note) => {
      throw new Error("Database write failed");
    });

    // Payload
    const payload = {
      ciphertext: VALID_CIPHERTEXT,
      hmac: VALID_HMAC,
      user_id: VALID_USER_ID,
      plugin_version: VALID_VERSION,
    };

    // make request
    const res = await supertest(test_app).post("/").send(payload);
    expect(res.status).toBe(500);

    // Validate Write events
    expect(mockEventLogger.writeEvent).toHaveBeenCalledOnce();
    expect(mockEventLogger.writeEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        host: expect.any(String),
        error: "Error: Database write failed",
        user_id: payload.user_id,
        user_plugin_version: payload.plugin_version,
      })
    );
  });
});
