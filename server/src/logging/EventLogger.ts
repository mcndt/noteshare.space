import { event } from "@prisma/client";
import prisma from "../db/client";
import logger from "./logger";

export enum EventType {
  WRITE = "WRITE",
  READ = "READ",
  DELETE = "DELETE",
  UPDATE = "UPDATE",
  PURGE = "PURGE",
}

export interface Event {
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

interface DeleteEvent extends ClientEvent {}

interface UpdateEvent extends ClientEvent {}

interface ReadEvent extends ClientEvent {}

interface PurgeEvent extends Event {
  note_id: string;
  size_bytes?: number;
}

export default class EventLogger {
  private static printError(event: Event) {
    if (event.error) {
      logger.error(event.error);
    }
  }

  public static writeEvent(event: WriteEvent): Promise<event> {
    this.printError(event);
    return prisma.event.create({
      data: { type: EventType.WRITE, ...event },
    });
  }

  public static readEvent(event: ReadEvent): Promise<event> {
    this.printError(event);
    return prisma.event.create({
      data: { type: EventType.READ, ...event },
    });
  }

  public static deleteEvent(event: DeleteEvent): Promise<event> {
    this.printError(event);
    return prisma.event.create({
      data: { type: EventType.DELETE, ...event },
    });
  }

  public static updateEvent(event: UpdateEvent): Promise<event> {
    this.printError(event);
    return prisma.event.create({
      data: { type: EventType.UPDATE, ...event },
    });
  }

  public static purgeEvent(event: PurgeEvent): Promise<event> {
    this.printError(event);
    return prisma.event.create({
      data: { type: EventType.PURGE, ...event },
    });
  }
}
