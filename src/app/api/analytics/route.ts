import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET(request: Request) {
  const user = getServerSession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "30d";

  let days = 30;
  if (range === "7d") days = 7;
  else if (range === "90d") days = 90;
  else if (range === "365d") days = 365;
  else if (range === "all") days = 3650;

  const since = new Date();
  since.setDate(since.getDate() - days);

  const posts = await db.post.findMany({
    where: {
      account: { userId: user.userId },
      postedAt: { gte: since },
    },
  });

  // Build daily chart data
  const chartData: Record<string, any> = {};
  const d = new Date(since);
  while (d <= new Date()) {
    const day = d.toISOString().split("T")[0];
    chartData[day] = {
      date: day,
      views: 0,
      likes: 0,
      spend: 0,
      revenue: 0,
      posts: 0,
    };
    d.setDate(d.getDate() + 1);
  }

  posts.forEach((post) => {
    const day = post.postedAt.toISOString().split("T")[0];
    if (chartData[day]) {
      chartData[day].views += post.views;
      chartData[day].likes += post.likes;
      chartData[day].spend += post.spend;
      chartData[day].revenue += post.revenue;
      chartData[day].posts += 1;
    }
  });

  const dailyData = Object.values(chartData).sort((a, b) => a.date.localeCompare(b.date));

  // Best performing posts
  const topPosts = await db.post.findMany({
    where: { account: { userId: user.userId } },
    orderBy: { views: "desc" },
    take: 10,
    include: { account: true },
  });

  // Engagement rate by platform
  const platformStats = await db.post.groupBy({
    by: ["platform", "type"],
    where: { account: { userId: user.userId } },
    _sum: {
      views: true,
      likes: true,
      comments: true,
      shares: true,
      spend: true,
      revenue: true,
    },
    _count: { _all: true },
  });

  return NextResponse.json({
    dailyData,
    topPosts,
    platformStats,
    range: { days, label: range },
  });
}
