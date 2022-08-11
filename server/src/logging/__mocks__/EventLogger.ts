import { vi } from "vitest";

const mockedEventLogger = {
  writeEvent: vi.fn(),
  readEvent: vi.fn(),
  purgeEvent: vi.fn(),
};

export default mockedEventLogger;
