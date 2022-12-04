import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NoteIdFilter } from "./expiredNoteFilter";
import { ScalableBloomFilter } from "bloom-filters";

import * as dao from "../db/bloomFilter.dao";
vi.mock("../db/bloomFilter.dao");

describe("Deserialization from database", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new filter if no filter is found in database", async () => {
    // mock no filter in database
    const mockedDao = vi.mocked(dao);
    mockedDao.getFilter.mockRejectedValue(new Error("No BloomFilter found"));

    // test instatiation
    const testFilter = await NoteIdFilter.deserializeFromDb("expiredNotes");
    expect(mockedDao.getFilter).toHaveBeenCalledWith(
      "expiredNotes",
      ScalableBloomFilter
    );
    expect(testFilter).toBeInstanceOf(NoteIdFilter);

    // expect the _filter property to be a fresh ScalableBloomFilter (capacity 8)
    expect(testFilter._filter).toBeInstanceOf(ScalableBloomFilter);
    expect(testFilter._filter.capacity()).toBe(8);
  });

  it("should deserialize a filter from the database", async () => {
    // mock prefilled bloom filter
    const bloomFilter = new ScalableBloomFilter();
    bloomFilter.add("test");
    bloomFilter.add("test2");
    const mockedDao = vi.mocked(dao);
    mockedDao.getFilter.mockResolvedValue(bloomFilter);

    // test instatiation
    const testFilter = await NoteIdFilter.deserializeFromDb("expiredNotes");
    expect(mockedDao.getFilter).toHaveBeenCalledWith(
      "expiredNotes",
      ScalableBloomFilter
    );
    expect(testFilter._filter).toBe(bloomFilter);

    // expect the testFilter to have the same content as the mocked bloom filter
    expect(testFilter.hasNoteId("test")).toBe(true);
    expect(testFilter.hasNoteId("test2")).toBe(true);
  });
});

describe("Filter operations and serialization", () => {
  let testFilter: NoteIdFilter;

  beforeEach(async () => {
    const mockedDao = vi.mocked(dao);
    mockedDao.getFilter.mockResolvedValue(new ScalableBloomFilter());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should add multiple noteIds to the filter", async () => {
    testFilter = await NoteIdFilter.deserializeFromDb("expiredNotes");
    testFilter.addNoteIds(["test", "test2"]);
    expect(testFilter.hasNoteId("test")).toBe(true);
    expect(testFilter.hasNoteId("test2")).toBe(true);

    // expect the filter to be serialized to database
    const mockedDao = vi.mocked(dao);
    expect(mockedDao.upsertFilter).toHaveBeenCalledWith(
      "expiredNotes",
      testFilter._filter
    );
  });

  it("Should have an error rate <1% for 1000 elements", async () => {
    testFilter = await NoteIdFilter.deserializeFromDb("expiredNotes");
    const elements = Array.from({ length: 1000 }, (_, i) => i.toString());
    testFilter.addNoteIds(elements);

    // expect the filter to have an error rate <1%
    const errorRate = elements
      .map<number>((el) => (testFilter.hasNoteId(el) ? 0 : 1))
      .reduce((acc, cur) => acc + cur, 0);
    expect(errorRate).toBeLessThan(10);
  });
});
