import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { deleteExpiredNotes } from "./deleteExpiredNotes";
import * as noteDao from "../controllers/note/note.dao";
import EventLogger from "../logging/EventLogger";
import logger from "../logging/logger";
import * as filter from "../lib/expiredNoteFilter";

vi.mock("../controllers/note/note.dao", () => ({
  getExpiredNotes: vi.fn(),
  deleteNotes: vi.fn(),
}));

vi.mock("../lib/expiredNoteFilter", () => {
  const instance = {
    addNoteIds: vi.fn(),
  };
  return { getExpiredNoteFilter: () => instance };
});

vi.mock("../logging/EventLogger");

vi.spyOn(logger, "error");

describe("deleteExpiredNotes", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call note dao", async () => {
    // mock note dao
    const mockedDao = vi.mocked(noteDao);
    mockedDao.getExpiredNotes.mockResolvedValue([
      {
        id: "test",
        ciphertext: "test",
        hmac: "test",
        insert_time: new Date(),
        expire_time: new Date(),
      },
    ]);
    mockedDao.deleteNotes.mockResolvedValue(1);

    // mock ExpiredNoteFilter
    const mockedFilter = vi.mocked(await filter.getExpiredNoteFilter());
    mockedFilter.addNoteIds.mockResolvedValue();

    // test task call
    await deleteExpiredNotes();
    expect(mockedDao.getExpiredNotes).toHaveBeenCalledOnce();
    expect(mockedDao.deleteNotes).toHaveBeenCalledWith(["test"]);
    expect(logger.error).not.toHaveBeenCalled();
    expect(vi.mocked(EventLogger).purgeEvent).toHaveBeenCalledOnce();
    expect(mockedFilter.addNoteIds).toHaveBeenCalledWith(["test"]);
  });
});
