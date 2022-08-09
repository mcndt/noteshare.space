import { NextFunction, Request, Response } from "express";
import EventLogger from "../../logging/EventLogger";
import { getConnectingIp } from "../../util";
import { getNote } from "./note.dao";

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
          size_bytes: note.ciphertext.length + note.hmac.length,
        });
        res.send(note);
      } else {
        await EventLogger.readEvent({
          success: false,
          host: ip,
          note_id: req.params.id,
          error: "Note not found",
        });
        res.status(404).send();
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
