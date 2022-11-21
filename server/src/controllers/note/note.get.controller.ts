import { NextFunction, Request, Response } from "express";
import { getNoteFilter } from "../../lib/expiredNoteFilter";
import EventLogger from "../../logging/EventLogger";
import { getConnectingIp, getNoteSize } from "../../util";
import { getNote } from "../../db/note.dao";
export async function getNoteController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const ip = getConnectingIp(req);
  getNote(req.params.id)
    .then(async (note) => {
      if (note != null) {
        await EventLogger.readEvent({
          success: true,
          host: ip,
          note_id: note.id,
          size_bytes: getNoteSize(note),
        });
        res.send(note);
      } else {
        // check the expired filter to see if the note was expired
        const deletedFilter = await getNoteFilter("deletedNotes");
        const expiredFilter = await getNoteFilter("expiredNotes");

        if (deletedFilter.hasNoteId(req.params.id)) {
          await EventLogger.readEvent({
            success: false,
            host: ip,
            note_id: req.params.id,
            error: "Note deleted",
          });
          res.status(410).send("Note deleted");
        } else if (expiredFilter.hasNoteId(req.params.id)) {
          await EventLogger.readEvent({
            success: false,
            host: ip,
            note_id: req.params.id,
            error: "Note expired",
          });
          res.status(410).send("Note expired");
        } else {
          await EventLogger.readEvent({
            success: false,
            host: ip,
            note_id: req.params.id,
            error: "Note not found",
          });
          res.status(404).send("Note not found");
        }
      }
    })
    .catch(async (err) => {
      await EventLogger.readEvent({
        success: false,
        host: ip,
        note_id: req.params.id,
        error: err.message,
      });
      next(err);
    });
}
