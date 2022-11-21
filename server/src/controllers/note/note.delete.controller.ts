import { validateOrReject, ValidationError } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { deleteNote, getNote } from "../../db/note.dao";
import checkId from "../../lib/checkUserId";
import EventLogger, { WriteEvent } from "../../logging/EventLogger";
import { getConnectingIp, getNoteSize } from "../../util";
import { NoteDeleteRequest } from "../../validation/Request";

export async function deleteNoteController(
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
  const noteDeleteRequest = new NoteDeleteRequest();
  Object.assign(noteDeleteRequest, req.body);
  try {
    await validateOrReject(noteDeleteRequest);
  } catch (_err: any) {
    const err = _err as ValidationError;
    res.status(400).send(err.toString());
    event.error = err.toString();
    await EventLogger.deleteEvent(event);
    return;
  }

  // Validate user ID, if present
  if (noteDeleteRequest.user_id && !checkId(noteDeleteRequest.user_id)) {
    console.log("invalid user id");
    res.status(400).send("Invalid user id (checksum failed)");
    event.error = "Invalid user id (checksum failed)";
    EventLogger.deleteEvent(event);
    return;
  }

  // get note from db
  const note = await getNote(req.params.id);
  if (!note) {
    res.status(404).send("Note not found");
    event.error = "Note not found";
    await EventLogger.deleteEvent(event);
    return;
  }

  // Validate secret token
  if (note.secret_token !== req.body.secret_token) {
    res.status(401).send("Invalid token");
    event.error = "Invalid secret token";
    await EventLogger.deleteEvent(event);
    return;
  }

  // Delete note
  try {
    await deleteNote(note.id);
    res.status(200).send();
    event.success = true;
    event.note_id = note.id;
    event.size_bytes = getNoteSize(note);
    await EventLogger.deleteEvent(event);
  } catch (err) {
    event.error = (err as Error).toString();
    await EventLogger.deleteEvent(event);
    next(err);
  }
}
