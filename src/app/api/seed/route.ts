import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth";

const mockData = {
  accounts: [
    { platform: "INSTAGRAM", username: "minhaempresa.ig", displayName: "Minha Empresa", accessToken: "ig_token_123456" },
    { platform: "INSTAGRAM", username: "minhaempresa.promo", displayName: "Promoções", accessToken: "ig_token_789" },
    { platform: "INSTAGRAM", username: "minhabrand.story", displayName: "Stories", accessToken: "ig_token_story" },
    { platform: "INSTAGRAM", username: "minhabrand.reels", displayName: "Reels", accessToken: "ig_token_reels" },
    { platform: "INSTAGRAM", username: "minhabrand.feed", displayName: "Feed", accessToken: "ig_token_feed" },
    { platform: "TIKTOK", username: "minhaempresa.tiktok", displayName: "Minha Empresa TT" },
    { platform: "TIKTOK", username: "minhabrand.tt", displayName: "Brand TT" },
    { platform: "TIKTOK", username: "minhabrand.tt2", displayName: "Brand TT 2" },
  ],
  posts: [
    { platform: "INSTAGRAM", type: "REEL", caption: "Lançamento do novo produto!", views: 12500, likes: 890, comments: 45, shares: 23, spend: 45.0, revenue: 0 },
    { platform: "INSTAGRAM", type: "FEED", caption: "Nossa equipe em ação", views: 5400, likes: 430, comments: 18, shares: 12, spend: 0, revenue: 0 },
    { platform: "INSTAGRAM", type: "STORY", caption: "Stories da semana", views: 8700, likes: 0, comments: 5, shares: 0, spend: 0, revenue: 0 },
    { platform: "TIKTOK", type: "SHORT", caption: "Tutorial rápido", views: 45600, likes: 2340, comments: 89, shares: 156, spend: 30.0, revenue: 890.0 },
    { platform: "TIKTOK", type: "SHORT", caption: "Behind the scenes", views: 32100, likes: 1890, comments: 67, shares: 98, spend: 25.0, revenue: 650.0 },
  ],
};

export async function POST(request: Request) {
  const user = getServerSession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const results = {
    accountsCreated: 0,
    postsCreated: 0,
    accounts: [] as any[],
    posts: [] as any[],
  };

  for (const acc of mockData.accounts) {
    try {
      const account = await db.socialAccount.create({
        data: {
          userId: user.userId,
          platform: acc.platform,
          username: acc.username,
          displayName: acc.displayName,
          accessToken: acc.accessToken || null,
          ipAddress: "192.168.1.100",
          status: "ACTIVE",
        },
      });
      results.accounts.push(account);
      results.accountsCreated++;
    } catch {
    }
  }

  const createdAccounts = results.accounts;
  for (const postData of mockData.posts) {
    const account = createdAccounts.find((a) => a.platform === postData.platform) || createdAccounts[0];
    const post = await db.post.create({
      data: {
        accountId: account.id,
        platform: postData.platform,
        type: postData.type,
        caption: postData.caption,
        mediaUrl: "https://via.placeholder.com/400x400",
        postedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        views: postData.views,
        likes: postData.likes,
        comments: postData.comments,
        shares: postData.shares,
        spend: postData.spend,
        revenue: postData.revenue,
      },
    });
    results.posts.push(post);
    results.postsCreated++;

    // Create daily activity entries
    const date = new Date(post.postedAt);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const activityType = postData.type === "STORY" ? "STORY" : postData.type === "SHORT" ? "VIDEO" : "FEED";
    await db.dailyActivity.upsert({
      where: {
        userId_date_accountId: {
          userId: user.userId,
          date: startOfDay,
          accountId: account.id,
        },
      },
      update: { action: "POSTED", notes: `Posted ${postData.type}` },
      create: {
        userId: user.userId,
        accountId: account.id,
        date: startOfDay,
        action: "POSTED",
        notes: `Posted ${postData.type}`,
      },
    });
  }

  // Fill in some no-post days
  const dailyActivity = await db.dailyActivity.findMany({
    where: { userId: user.userId },
  });

  // Generate no-post entries for random days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const existing = dailyActivity.find((a) => a.date.toISOString().split("T")[0] === startOfDay.toISOString().split("T")[0]);
    if (!existing) {
      const randomAccount = createdAccounts[Math.floor(Math.random() * createdAccounts.length)];
      await db.dailyActivity.create({
        data: {
          userId: user.userId,
          accountId: randomAccount?.id || null,
          date: startOfDay,
          action: "NO_POST",
          notes: "Sem postagem hoje",
        },
      });
    }
  }

  // Create metric snapshot
  const totals = {
    totalAccounts: createdAccounts.length,
    totalPosts: results.postsCreated,
    totalViews: mockData.posts.reduce((s, p) => s + p.views, 0),
    totalSpend: mockData.posts.reduce((s, p) => s + p.spend, 0),
    totalRevenue: mockData.posts.reduce((s, p) => s + p.revenue, 0),
    totalLikes: mockData.posts.reduce((s, p) => s + p.likes, 0),
    totalComments: mockData.posts.reduce((s, p) => s + p.comments, 0),
    totalShares: mockData.posts.reduce((s, p) => s + p.shares, 0),
  };

  await db.metricSnapshot.create({
    data: {
      userId: user.userId,
      totalAccounts: totals.totalAccounts,
      totalPosts: totals.totalPosts,
      totalViews: totals.totalViews,
      totalSpend: totals.totalSpend,
      totalRevenue: totals.totalRevenue,
      totalLikes: totals.totalLikes,
      totalComments: totals.totalComments,
      totalShares: totals.totalShares,
    },
  });

  return NextResponse.json({
    message: "Dados de teste criados com sucesso",
    results,
    totals,
  });
}
