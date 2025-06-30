import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db";

export async function GET() {
  const dbHealth = await checkDatabaseHealth();
  const uptime = process.uptime();

  return NextResponse.json({
    status: dbHealth.status === "healthy" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime,
    database: dbHealth,
  });
}
