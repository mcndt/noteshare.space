import { EncryptedNote } from "@prisma/client";
import express from "express";
import supertest from "supertest";
import { vi, describe, it, beforeEach, afterEach, expect } from "vitest";
import * as noteDao from "../../db/note.dao";
import * as bloomFilter from "../../db/bloomFilter.dao";
import EventLogger from "../../logging/EventLogger";
import { deleteNoteController } from "./note.delete.controller";

vi.mock("../../db/note.dao");
vi.mock("../../db/bloomFilter.dao");
vi.mock("../../logging/EventLogger");

const VALID_USER_ID = "f06536e7df6857fc";

const MOCK_SECRET_TOKEN = "U0VDUkVUX1RPS0VO";
const MOCK_NOTE_ID = "NOTE_ID";

describe("note.delete.controller", () => {
  let mockNoteDao = vi.mocked(noteDao);
  let mockEventLogger = vi.mocked(EventLogger);
  let mockBloomFilterDao = vi.mocked(bloomFilter);

  const test_app = express()
    .use(express.json())
    .delete("/:id", deleteNoteController);

  beforeEach(() => {
    mockNoteDao.getNote.mockImplementation(async (noteId) => {
      if (noteId === MOCK_NOTE_ID) {
        return {
          id: MOCK_NOTE_ID,
          secret_token: MOCK_SECRET_TOKEN,
        } as EncryptedNote;
      } else {
        return null;
      }
    });

    mockNoteDao.deleteNote.mockImplementation(async (id) => {
      if (id === MOCK_NOTE_ID) {
        return vi.fn() as unknown as EncryptedNote;
      } else {
        throw new Error("Note not found");
      }
    });

    mockBloomFilterDao.getFilter.mockImplementation(async () => {
      throw new Error("No BloomFilter found");
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("Should delete a note with a valid secret token", async () => {
    const response = await supertest(test_app)
      .delete(`/${MOCK_NOTE_ID}`)
      .send({ user_id: VALID_USER_ID, secret_token: MOCK_SECRET_TOKEN });

    expect(response.status).toBe(200);
    expect(mockNoteDao.deleteNote).toBeCalledWith(MOCK_NOTE_ID);
    expect(mockEventLogger.deleteEvent).toBeCalledWith(
      expect.objectContaining({
        note_id: MOCK_NOTE_ID,
        user_id: VALID_USER_ID,
        success: true,
      })
    );
  });

  it("Should return 401 for an invalid secret token", async () => {
    const response = await supertest(test_app)
      .delete(`/${MOCK_NOTE_ID}`)
      .send({ user_id: VALID_USER_ID, secret_token: "0000" });

    expect(response.status).toBe(401);
    expect(mockNoteDao.deleteNote).not.toBeCalled();
    expect(mockEventLogger.deleteEvent).toBeCalledWith(
      expect.objectContaining({
        user_id: VALID_USER_ID,
        success: false,
      })
    );
  });

  it("Should return 404 for a note that does not exist", async () => {
    const response = await supertest(test_app)
      .delete("/0000")
      .send({ user_id: VALID_USER_ID, secret_token: MOCK_SECRET_TOKEN });

    expect(response.status).toBe(404);
    expect(mockNoteDao.deleteNote).not.toBeCalled();
    expect(mockEventLogger.deleteEvent).toBeCalledWith(
      expect.objectContaining({
        user_id: VALID_USER_ID,
        success: false,
      })
    );
  });
});
