import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET(request: Request) {
  const user = getServerSession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await db.socialAccount.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ accounts });
}

export async function POST(request: Request) {
  const user = getServerSession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { platform, username, displayName, accessToken, ipAddress } = body;

  if (!platform || !username) {
    return NextResponse.json({ error: "Platform and username are required" }, { status: 400 });
  }

  try {
    const account = await db.socialAccount.create({
      data: {
        userId: user.userId,
        platform,
        username,
        displayName: displayName || username,
        accessToken: accessToken || null,
        ipAddress: ipAddress || null,
        status: "ACTIVE",
      },
    });

    // Log IP binding
    const ip = ipAddress || request.headers.get("x-forwarded-for") || "unknown";
    await db.ipLog.create({
      data: {
        userId: user.userId,
        ipAddress: ip,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Account already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
