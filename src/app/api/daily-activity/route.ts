import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET(request: Request) {
  const user = getServerSession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
  const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString());

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const activity = await db.dailyActivity.findMany({
    where: {
      userId: user.userId,
      date: { gte: startDate, lte: endDate },
    },
    include: { account: true },
  });

  const activityMap: Record<string, any[]> = {};
  activity.forEach((a) => {
    const day = a.date.getDate();
    if (!activityMap[day]) activityMap[day] = [];
    activityMap[day].push({
      id: a.id,
      accountId: a.accountId,
      account: a.account,
      action: a.action,
      notes: a.notes,
    });
  });

  return NextResponse.json({
    days: activityMap,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    year,
    month,
  });
}

export async function POST(request: Request) {
  const user = getServerSession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { date, accountId, action, notes } = body;

  if (!date || !action) {
    return NextResponse.json({ error: "date and action are required" }, { status: 400 });
  }

  const day = new Date(date);
  const startOfDay = new Date(day.setHours(0, 0, 0, 0));

  const activity = await db.dailyActivity.create({
    data: {
      userId: user.userId,
      accountId: accountId || null,
      date: startOfDay,
      action,
      notes,
    },
    include: { account: true },
  });

  return NextResponse.json({ activity }, { status: 201 });
}
