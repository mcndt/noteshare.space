import bodyParser from "body-parser";
import express from "express";
import rateLimit from "express-rate-limit";
import { embedsRoute } from "./embeds/embeds.router";
import { getNoteController } from "./note.get.controller";
import { postNoteController } from "./note.post.controller";

export const notesRoute = express.Router();

const jsonParser = express.json();
const uploadLimit = bodyParser.json({ limit: "8mb" });

const postRateLimit = rateLimit({
  windowMs: parseFloat(process.env.POST_LIMIT_WINDOW_SECONDS as string) * 1000,
  max: parseInt(process.env.POST_LIMIT as string), // Limit each IP to X requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const getRateLimit = rateLimit({
  windowMs: parseFloat(process.env.GET_LIMIT_WINDOW_SECONDS as string) * 1000,
  max: parseInt(process.env.GET_LIMIT as string), // Limit each IP to X requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// notesRoute.use(jsonParser, uploadLimit);
notesRoute.use(uploadLimit);
notesRoute.use(jsonParser);
notesRoute.post("", postRateLimit, postNoteController);
notesRoute.get("/:id", getRateLimit, getNoteController);
notesRoute.use("/:id/embeds/", embedsRoute);
