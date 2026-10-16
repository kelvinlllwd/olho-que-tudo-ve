import { PrismaClient } from "@prisma/client";

declare global {
  var __db: PrismaClient | undefined;
}

const client = global.__db ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__db = client;
}

export default client;
