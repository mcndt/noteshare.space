import { deleteNotes, getExpiredNotes } from "../db/note.dao";
import { getExpiredNoteFilter } from "../lib/expiredNoteFilter";
import EventLogger from "../logging/EventLogger";
import logger from "../logging/logger";
import { getNoteSize } from "../util";

export async function deleteExpiredNotes(): Promise<number> {
  logger.info("[Cleanup] Cleaning up expired notes...");
  const toDelete = await getExpiredNotes();

  return deleteNotes(toDelete.map((n) => n.id))
    .then(async (deleteCount) => {
      const logs = toDelete.map(async (note) => {
        logger.info(
          `[Cleanup] Deleted note ${note.id} with size ${getNoteSize(
            note
          )} bytes`
        );
        return EventLogger.purgeEvent({
          success: true,
          note_id: note.id,
          size_bytes: getNoteSize(note),
        });
      });
      await Promise.all(logs);
      const filter = await getExpiredNoteFilter();
      await filter.addNoteIds(toDelete.map((n) => n.id));
      logger.info(`[Cleanup] Deleted ${deleteCount} expired notes.`);
      return deleteCount;
    })
    .catch((err) => {
      logger.error(`[Cleanup] Error cleaning expired notes:`);
      logger.error(err);
      return -1;
    });
}

export const deleteInterval =
  Math.max(parseInt(<string>process.env.CLEANUP_INTERVAL_SECONDS) || 1, 1) *
  1000;
