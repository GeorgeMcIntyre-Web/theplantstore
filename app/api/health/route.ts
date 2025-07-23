import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db";

export async function GET() {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    const healthStatus = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: dbHealth,
      version: process.env.npm_package_version || "1.0.0",
    };

    // If database is unhealthy, return 503
    if (dbHealth.status === "unhealthy") {
      return NextResponse.json(
        { ...healthStatus, status: "degraded" },
        { status: 503 }
      );
    }

    return NextResponse.json(healthStatus);
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
