import { deleteNotes, getExpiredNotes } from "../controllers/note/note.dao";
import EventLogger from "../logging/EventLogger";
import logger from "../logging/logger";

export const cleanInterval =
  Math.max(parseInt(<string>process.env.CLEANUP_INTERVAL_SECONDS) || 1, 1) *
  1000;

export async function cleanExpiredNotes(): Promise<number> {
  logger.info("[Cleanup] Cleaning up expired notes...");
  const toDelete = await getExpiredNotes();

  return deleteNotes(toDelete.map((n) => n.id))
    .then(async (deleteCount) => {
      const logs = toDelete.map(async (note) => {
        logger.info(
          `[Cleanup] Deleted note ${note.id} with size ${
            note.ciphertext.length + note.hmac.length
          } bytes`
        );
        return EventLogger.purgeEvent({
          success: true,
          note_id: note.id,
          size_bytes: note.ciphertext.length + note.hmac.length,
        });
      });
      await Promise.all(logs);
      logger.info(`[Cleanup] Deleted ${deleteCount} expired notes.`);
      return deleteCount;
    })
    .catch((err) => {
      logger.error(`[Cleanup] Error cleaning expired notes:`);
      logger.error(err);
      return -1;
    });
}
