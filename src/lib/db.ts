import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient({
    // @ts-ignore - Prisma 7 constructor requires datasourceUrl, despite type mismatch
    datasourceUrl: process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy",
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
