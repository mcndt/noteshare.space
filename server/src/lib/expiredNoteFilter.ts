import { ScalableBloomFilter } from "bloom-filters";
import { getFilter, upsertFilter } from "../db/bloomFilter.dao";

export const EXPIRED_NOTES_FILTER_NAME = "expiredNotes" as const;
export const DELETED_NOTES_FILTER_NAME = "deletedNotes" as const;

type FilterName =
  | typeof EXPIRED_NOTES_FILTER_NAME
  | typeof DELETED_NOTES_FILTER_NAME;

export class NoteIdFilter {
  _filter: ScalableBloomFilter;
  _name: string;

  private constructor(name: string, filter: ScalableBloomFilter) {
    this._filter = filter;
    this._name = name;
  }

  public static async deserializeFromDb(name: string): Promise<NoteIdFilter> {
    return NoteIdFilter._deserializeFilter(name)
      .catch((err) => {
        if (err.message === "No BloomFilter found") {
          return new ScalableBloomFilter();
        } else {
          throw err;
        }
      })
      .then((filter) => {
        return new NoteIdFilter(name, filter);
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
    return upsertFilter(this._name, this._filter);
  }

  private static _deserializeFilter(
    name: string
  ): Promise<ScalableBloomFilter> {
    return getFilter<ScalableBloomFilter>(name, ScalableBloomFilter);
  }
}

let _filters: Record<FilterName, NoteIdFilter | null> = {
  expiredNotes: null,
  deletedNotes: null,
};

export async function getNoteFilter(name: FilterName): Promise<NoteIdFilter> {
  if (_filters[name] !== null) {
    return _filters[name] as NoteIdFilter;
  } else {
    _filters[name] = await NoteIdFilter.deserializeFromDb(name);
    return _filters[name] as NoteIdFilter;
  }
}
