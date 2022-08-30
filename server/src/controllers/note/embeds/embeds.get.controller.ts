import type { NextFunction, Request, Response } from "express";
import { getEmbed } from "../../../db/embed.dao";

export async function getNoteController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { id: note_id, embed_id } = req.params;
  try {
    const embed = await getEmbed(note_id, embed_id);
    if (embed != null) {
      res.status(200).json(embed).send();
    } else {
      res.status(404).send();
    }
  } catch (err) {
    next(err);
  }
}
