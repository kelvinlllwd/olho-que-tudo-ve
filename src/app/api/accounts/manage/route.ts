import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function PUT(request: Request) {
  const user = getServerSession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { accountId, ...data } = body;

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  const account = await db.socialAccount.update({
    where: { id: accountId, userId: user.userId },
    data,
  });

  return NextResponse.json({ account });
}

export async function DELETE(request: Request) {
  const user = getServerSession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");

  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  await db.socialAccount.delete({
    where: { id: parseInt(accountId), userId: user.userId },
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const user = getServerSession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { accountId, action } = body;

  if (!accountId || !action) {
    return NextResponse.json({ error: "accountId and action are required" }, { status: 400 });
  }

  if (action === "sync") {
    const account = await db.socialAccount.update({
      where: { id: accountId, userId: user.userId },
      data: { lastSynced: new Date() },
    });
    return NextResponse.json({ account, synced: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
