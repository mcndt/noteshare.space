import { PrismaClient } from "@prisma/client";

if (process.env.UNIT_TEST === "TRUE") {
  throw Error("Database operations must be mocked in unit tests.");
}

const prisma = new PrismaClient();

export default prisma;
