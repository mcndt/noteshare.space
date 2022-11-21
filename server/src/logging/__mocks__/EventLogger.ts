import { vi } from "vitest";
import { Event } from "../EventLogger";
import logger from "../logger";

const logEventToConsole = (event: Event) => {
  if (event.error) {
    console.error(event.error);
  }
};

const mockedEventLogger = {
  writeEvent: vi.fn(logEventToConsole),
  readEvent: vi.fn(logEventToConsole),
  purgeEvent: vi.fn(logEventToConsole),
  deleteEvent: vi.fn(logEventToConsole),
  updateEvent: vi.fn(logEventToConsole),
};

export default mockedEventLogger;
