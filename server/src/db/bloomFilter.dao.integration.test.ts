import { ScalableBloomFilter } from "bloom-filters";
import { describe, it, expect } from "vitest";
import { getFilter, upsertFilter } from "./bloomFilter.dao";

describe("Serialization and deserialization of filters", () => {
  it("Should serialize and deserialize filters", async () => {
    // Serialize a new filter
    const testFilter = new ScalableBloomFilter();
    testFilter.add("item0");
    testFilter.add("item1");
    testFilter.add("item2");
    await upsertFilter("testFilter", testFilter);

    // Deserialize the filter
    const deserializedFilter = await getFilter<ScalableBloomFilter>(
      "testFilter",
      ScalableBloomFilter
    );
    expect(deserializedFilter.has("item0")).toBe(true);
    expect(deserializedFilter.has("item1")).toBe(true);
    expect(deserializedFilter.has("item2")).toBe(true);
    expect(deserializedFilter.has("not_in_filter")).toBe(false);

    // update the filter and serialize it
    deserializedFilter.add("item3");
    await upsertFilter("testFilter", deserializedFilter);

    // Deserialize the filter again
    const deserializedFilter2 = await getFilter<ScalableBloomFilter>(
      "testFilter",
      ScalableBloomFilter
    );
    expect(deserializedFilter2.has("item0")).toBe(true);
    expect(deserializedFilter2.has("item1")).toBe(true);
    expect(deserializedFilter2.has("item2")).toBe(true);
    expect(deserializedFilter2.has("item3")).toBe(true);
    expect(deserializedFilter2.has("not_in_filter")).toBe(false);
  });

  it("Should throw error if no filter is saved for given name", async () => {
    await expect(
      getFilter<ScalableBloomFilter>("not_existing", ScalableBloomFilter)
    ).rejects.toThrow("No BloomFilter found");
  });
});
