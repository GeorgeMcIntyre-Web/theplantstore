import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Only create Prisma client if DATABASE_URL is available
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found - Prisma client will not be initialized');
    return null;
  }
  
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && prisma) globalForPrisma.prisma = prisma;

// Helper function to safely access prisma in API routes
export const getPrismaClient = () => {
  if (!prisma) {
    throw new Error('Database not available - DATABASE_URL not configured');
  }
  return prisma;
};

// Graceful shutdown
process.on("beforeExit", async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

// Health check function
export const checkDatabaseHealth = async () => {
  if (!prisma) {
    return {
      status: "unhealthy",
      error: "Prisma client not initialized - DATABASE_URL missing",
      timestamp: new Date().toISOString(),
    };
  }
  
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return { status: "healthy", timestamp: new Date().toISOString() };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
};
