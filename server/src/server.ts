import "dotenv/config";
import logger from "./logging/logger";
import { app } from "./app";

// start the Express server
app.listen(process.env.PORT, () => {
  logger.info(`server started at port ${process.env.PORT}`);
});
