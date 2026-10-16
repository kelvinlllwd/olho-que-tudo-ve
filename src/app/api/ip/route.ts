import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET(request: Request) {
  const user = getServerSession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await db.ipLog.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ logs });
}

export async function POST(request: Request) {
  const user = getServerSession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { ipAddress, location, userAgent } = body;

  const entry = await db.ipLog.create({
    data: {
      userId: user.userId,
      ipAddress: ipAddress || request.headers.get("x-forwarded-for") || "unknown",
      location,
      userAgent: userAgent || request.headers.get("user-agent") || undefined,
    },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
