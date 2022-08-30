import express from "express";
import { getNoteController } from "../note.get.controller";

export const embedsRoute = express.Router({ mergeParams: true });

embedsRoute.get("/:embed_id", getNoteController);
