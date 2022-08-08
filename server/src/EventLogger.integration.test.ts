import { describe, it, expect } from "vitest";
import EventLogger, { EventType } from "./EventLogger";
import prisma from "./client";

describe("Logging write events", () => {
  it("Should write a write event to database", async () => {
    const testWriteEvent = {
      host: "localhost",
      size_bytes: 100,
      success: true,
      expire_window_days: 30,
    };

    // Is event written successfully?
    const logged = await EventLogger.writeEvent(testWriteEvent);
    expect(logged).not.toBeNull();
    expect(logged).toMatchObject(testWriteEvent);

    // Is event in database?
    const results = await prisma.event.findMany({
      where: { type: EventType.WRITE },
    });
    expect(results.length).toBe(1);

    // Are default fields populated?
    expect(logged.time).not.toBeNull();
    expect(logged.id).not.toBeNull();
  });

  it("Should log a read event to database", async () => {
    const testReadEvent = {
      host: "localhost",
      size_bytes: 100,
      success: true,
    };

    // Is event written successfully?
    const logged = await EventLogger.readEvent({
      host: "localhost",
      size_bytes: 100,
      success: true,
    });
    expect(logged).not.toBeNull();
    expect(logged).toMatchObject(testReadEvent);

    // Is event in database?
    const results = await prisma.event.findMany({
      where: { type: EventType.READ },
    });
    expect(results.length).toBe(1);

    // Are default fields populated?
    expect(logged.time).not.toBeNull();
    expect(logged.id).not.toBeNull();
  });

  it("Should log a purge event to database", async () => {
    const testPurgeEvent = {
      success: true,
      purge_count: 1,
      size_bytes: 100,
    };

    // Is event written successfully?
    const logged = await EventLogger.purgeEvent(testPurgeEvent);
    expect(logged).not.toBeNull();
    expect(logged).toMatchObject(testPurgeEvent);

    // Is event in database?
    const results = await prisma.event.findMany({
      where: { type: EventType.PURGE },
    });
    expect(results.length).toBe(1);

    // Are default fields populated?
    expect(logged.time).not.toBeNull();
    expect(logged.id).not.toBeNull();
  });
});
