import { EncryptedNote } from "@prisma/client";
import { validateOrReject } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { IsBase64 } from "class-validator";
import { createNote } from "./note.dao";
import { addDays, getConnectingIp } from "../../util";
import EventLogger from "../../logging/EventLogger";

/**
 * Request body for creating a note
 */
export class NotePostRequest {
  @IsBase64()
  ciphertext: string | undefined;

  @IsBase64()
  hmac: string | undefined;
}

export async function postNoteController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const ip = getConnectingIp(req);

  const notePostRequest = new NotePostRequest();
  Object.assign(notePostRequest, req.body);
  validateOrReject(notePostRequest).catch((err) => {
    res.status(400).send(err.message);
  });
  const note = notePostRequest as EncryptedNote;
  const EXPIRE_WINDOW_DAYS = 30;
  createNote({
    ...note,
    expire_time: addDays(new Date(), EXPIRE_WINDOW_DAYS),
  })
    .then(async (savedNote) => {
      await EventLogger.writeEvent({
        success: true,
        host: ip,
        note_id: savedNote.id,
        size_bytes: savedNote.ciphertext.length + savedNote.hmac.length,
        expire_window_days: EXPIRE_WINDOW_DAYS,
      });
      res.json({
        view_url: `${process.env.FRONTEND_URL}/note/${savedNote.id}`,
        expire_time: savedNote.expire_time,
      });
    })
    .catch(async (err) => {
      await EventLogger.writeEvent({
        success: false,
        host: ip,
        error: err.message,
      });
      next(err);
    });
}
