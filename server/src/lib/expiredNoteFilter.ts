import { ScalableBloomFilter } from "bloom-filters";
import { getFilter, upsertFilter } from "../db/bloomFilter.dao";

export class ExpiredNoteFilter {
  _filter: ScalableBloomFilter;
  static FILTER_NAME = "expiredNotes";

  private constructor(filter: ScalableBloomFilter) {
    this._filter = filter;
  }

  public static async deserializeFromDb(): Promise<ExpiredNoteFilter> {
    return ExpiredNoteFilter._deserializeFilter()
      .catch((err) => {
        if (err.message === "No BloomFilter found") {
          return new ScalableBloomFilter();
        } else {
          throw err;
        }
      })
      .then((filter) => {
        return new ExpiredNoteFilter(filter);
      });
  }

  public addNoteIds(noteIds: string[]): Promise<void> {
    noteIds.forEach((noteId) => {
      this._filter.add(noteId);
    });
    return this._serialize();
  }

  public hasNoteId(noteId: string): boolean {
    return this._filter.has(noteId);
  }

  private _serialize(): Promise<void> {
    return upsertFilter(ExpiredNoteFilter.FILTER_NAME, this._filter);
  }

  private static _deserializeFilter(): Promise<ScalableBloomFilter> {
    return getFilter<ScalableBloomFilter>(
      this.FILTER_NAME,
      ScalableBloomFilter
    );
  }
}

let _filter: ExpiredNoteFilter;

export async function getExpiredNoteFilter(): Promise<ExpiredNoteFilter> {
  if (_filter) {
    return _filter;
  } else {
    _filter = await ExpiredNoteFilter.deserializeFromDb();
    return _filter;
  }
}
