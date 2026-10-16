import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET(request: Request) {
  const user = getServerSession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");

  const where: any = { userId: user.userId };
  if (accountId) where.accountId = parseInt(accountId);

  const posts = await db.post.findMany({
    where,
    include: { account: true },
    orderBy: { postedAt: "desc" },
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const user = getServerSession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { accountId, platform, type, caption, mediaUrl, postedAt, views, likes, comments, shares, spend, revenue } = body;

  if (!accountId || !type || !postedAt) {
    return NextResponse.json({ error: "accountId, type, and postedAt are required" }, { status: 400 });
  }

  const post = await db.post.create({
    data: {
      accountId,
      platform: platform || "INSTAGRAM",
      type,
      caption,
      mediaUrl,
      postedAt: new Date(postedAt),
      views: views || 0,
      likes: likes || 0,
      comments: comments || 0,
      shares: shares || 0,
      spend: spend || 0,
      revenue: revenue || 0,
    },
    include: { account: true },
  });

  // Update daily activity
  const date = new Date(postedAt);
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const activityType = type === "STORY" ? "STORY" : type === "VIDEO" || type === "REEL" || type === "SHORT" ? "VIDEO" : "FEED";

  await db.dailyActivity.upsert({
    where: {
      userId_date_accountId: {
        userId: user.userId,
        date: startOfDay,
        accountId,
      },
    },
    update: {
      action: "POSTED",
      notes: `Posted ${type} with ${views || 0} views`,
    },
    create: {
      userId: user.userId,
      accountId,
      date: startOfDay,
      action: "POSTED",
      notes: `Posted ${type} with ${views || 0} views`,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
