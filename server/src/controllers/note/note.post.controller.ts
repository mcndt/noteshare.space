import { EncryptedNote } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { createNote } from "../../db/note.dao";
import { addDays, getConnectingIp, getNoteSize } from "../../util";
import EventLogger, { WriteEvent } from "../../logging/EventLogger";
import { validateOrReject, ValidationError } from "class-validator";
import { generateToken } from "../../crypto/GenerateToken";
import { NotePostRequest } from "../../validation/Request";
import checkId from "../../lib/checkUserId";

/**
 * Request body for creating a note
 */

export async function postNoteController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const event: WriteEvent = {
    success: false,
    host: getConnectingIp(req),
    user_id: req.body.user_id,
    user_plugin_version: req.body.plugin_version,
  };

  // Validate request body
  const notePostRequest = new NotePostRequest();
  Object.assign(notePostRequest, req.body);
  try {
    await validateOrReject(notePostRequest);
  } catch (_err: any) {
    const err = _err as ValidationError;
    res.status(400).send(err.toString());
    event.error = err.toString();
    EventLogger.writeEvent(event);
    return;
  }

  // Validate user ID, if present
  if (notePostRequest.user_id && !checkId(notePostRequest.user_id)) {
    console.log("invalid user id");
    res.status(400).send("Invalid user id (checksum failed)");
    event.error = "Invalid user id (checksum failed)";
    EventLogger.writeEvent(event);
    return;
  }

  // Create note object
  const EXPIRE_WINDOW_DAYS = 30;
  const secret_token = generateToken();

  const note = {
    ciphertext: notePostRequest.ciphertext as string,
    hmac: notePostRequest.hmac as string,
    iv: notePostRequest.iv as string,
    expire_time: addDays(new Date(), EXPIRE_WINDOW_DAYS),
    crypto_version: notePostRequest.crypto_version,
    secret_token: secret_token,
  } as EncryptedNote;

  // Store note object
  createNote(note)
    .then(async (savedNote) => {
      event.success = true;
      event.note_id = savedNote.id;
      event.size_bytes = getNoteSize(note);
      event.expire_window_days = EXPIRE_WINDOW_DAYS;
      await EventLogger.writeEvent(event);
      res.json({
        view_url: `${process.env.FRONTEND_URL}/note/${savedNote.id}`,
        expire_time: savedNote.expire_time,
        secret_token: savedNote.secret_token,
        note_id: savedNote.id,
      });
    })
    .catch(async (err) => {
      event.error = err.toString();
      await EventLogger.writeEvent(event);
      next(err);
    });
}
