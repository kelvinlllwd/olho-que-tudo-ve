import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET(request: Request) {
  const user = getServerSession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");

  const since = new Date();
  since.setDate(since.getDate() - days);

  const accounts = await db.socialAccount.findMany({
    where: { userId: user.userId },
  });

  const posts = await db.post.findMany({
    where: {
      account: { userId: user.userId },
      postedAt: { gte: since },
    },
    include: { account: true },
  });

  const dailyActivity = await db.dailyActivity.findMany({
    where: {
      userId: user.userId,
      date: { gte: since },
    },
    include: { account: true },
  });

  const totals = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter((a) => a.status === "ACTIVE").length,
    totalPosts: posts.length,
    totalViews: posts.reduce((s, p) => s + p.views, 0),
    totalLikes: posts.reduce((s, p) => s + p.likes, 0),
    totalComments: posts.reduce((s, p) => s + p.comments, 0),
    totalShares: posts.reduce((s, p) => s + p.shares, 0),
    totalSpend: posts.reduce((s, p) => s + p.spend, 0),
    totalRevenue: posts.reduce((s, p) => s + p.revenue, 0),
    totalReach: posts.reduce((s, p) => s + p.reach, 0),
    totalImpressions: posts.reduce((s, p) => s + p.impressions, 0),
    roi: 0,
    postedDays: dailyActivity.filter((a) => a.action === "POSTED").length,
    noPostDays: dailyActivity.filter((a) => a.action === "NO_POST").length,
  };

  totals.roi = totals.totalSpend > 0
    ? ((totals.totalRevenue - totals.totalSpend) / totals.totalSpend) * 100
    : 0;

  // Per-account breakdown
  const byAccount = accounts.map((account) => {
    const accountPosts = posts.filter((p) => p.accountId === account.id);
    const spend = accountPosts.reduce((s, p) => s + p.spend, 0);
    const revenue = accountPosts.reduce((s, p) => s + p.revenue, 0);
    const views = accountPosts.reduce((s, p) => s + p.views, 0);
    return {
      id: account.id,
      platform: account.platform,
      username: account.username,
      displayName: account.displayName,
      status: account.status,
      posts: accountPosts.length,
      views,
      likes: accountPosts.reduce((s, p) => s + p.likes, 0),
      comments: accountPosts.reduce((s, p) => s + p.comments, 0),
      shares: accountPosts.reduce((s, p) => s + p.shares, 0),
      spend,
      revenue,
      roi: spend > 0 ? ((revenue - spend) / spend) * 100 : 0,
    };
  });

  // Platform breakdown
  const byPlatform = ["INSTAGRAM", "TIKTOK"].map((platform) => {
    const platformPosts = posts.filter((p) => p.platform === platform);
    return {
      platform,
      posts: platformPosts.length,
      views: platformPosts.reduce((s, p) => s + p.views, 0),
      likes: platformPosts.reduce((s, p) => s + p.likes, 0),
      spend: platformPosts.reduce((s, p) => s + p.spend, 0),
      revenue: platformPosts.reduce((s, p) => s + p.revenue, 0),
    };
  });

  // Daily aggregations for chart
  const dailyData: Record<string, any> = {};
  posts.forEach((post) => {
    const day = post.postedAt.toISOString().split("T")[0];
    if (!dailyData[day]) {
      dailyData[day] = { date: day, views: 0, posts: 0, spend: 0, revenue: 0 };
    }
    dailyData[day].views += post.views;
    dailyData[day].posts += 1;
    dailyData[day].spend += post.spend;
    dailyData[day].revenue += post.revenue;
  });

  const dailyArray = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

  // Post type breakdown
  const postTypeData = ["FEED", "REEL", "STORY", "VIDEO", "SHORT", "LIVE"].map((type) => ({
    type,
    count: posts.filter((p) => p.type === type).length,
  }));

  return NextResponse.json({
    totals,
    byAccount,
    byPlatform,
    dailyArray,
    postTypeData,
    accounts,
  });
}
