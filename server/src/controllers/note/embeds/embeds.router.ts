import express from "express";
import { getEmbedController } from "./embeds.get.controller";

export const embedsRoute = express.Router({ mergeParams: true });

embedsRoute.get("/:embed_id", getEmbedController);
