import "dotenv/config";
import express, { type Express } from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import logger from "./logging/logger";
import { notesRoute } from "./controllers/note/note.router";
import { deleteExpiredNotes, deleteInterval } from "./tasks/deleteExpiredNotes";

// Initialize middleware clients
export const app: Express = express();

// configure logging
app.use(
  pinoHttp({
    logger: logger,
  })
);

// configure Helmet and CORS
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: process.env.ENVIRONMENT == "dev" ? "cross-origin" : "same-origin",
    },
  })
);

// Mount routes
app.use("/api/note/", notesRoute);

// Run periodic tasks
setInterval(deleteExpiredNotes, deleteInterval);
