import { event } from "@prisma/client";
import prisma from "../db/client";

export enum EventType {
  WRITE = "WRITE",
  READ = "READ",
  PURGE = "PURGE",
}

interface Event {
  success: boolean;
  error?: string;
}

interface ClientEvent extends Event {
  host: string;
  success: boolean;
  note_id?: string;
  size_bytes?: number;
  user_id?: string;
  user_plugin_version?: string;
}

export interface WriteEvent extends ClientEvent {
  expire_window_days?: number;
}

interface ReadEvent extends ClientEvent {}

interface PurgeEvent extends Event {
  note_id: string;
  size_bytes?: number;
}

export default class EventLogger {
  public static writeEvent(event: WriteEvent): Promise<event> {
    return prisma.event.create({
      data: { type: EventType.WRITE, ...event },
    });
  }

  public static readEvent(event: ReadEvent): Promise<event> {
    return prisma.event.create({
      data: { type: EventType.READ, ...event },
    });
  }

  public static purgeEvent(event: PurgeEvent): Promise<event> {
    return prisma.event.create({
      data: { type: EventType.PURGE, ...event },
    });
  }
}
