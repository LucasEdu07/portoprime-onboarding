import { PrismaClient } from "@prisma/client";

// Singleton do Prisma para evitar múltiplas conexões em dev (hot reload) e em
// ambientes serverless. Verdade dos dados = banco.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
