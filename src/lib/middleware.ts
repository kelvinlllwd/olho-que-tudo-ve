import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";
import { JWTPayload } from "@/lib/auth";

export async function authMiddleware(request: NextRequest): Promise<{ user: JWTPayload | null; response: NextResponse }> {
  const cookieHeader = request.headers.get("cookie");
  const user = getSessionFromCookie(cookieHeader);
  const response = NextResponse.next();
  return { user, response };
}

export async function requireAuth(request: NextRequest): Promise<{ user: JWTPayload; response: NextResponse | null }> {
  const cookieHeader = request.headers.get("cookie");
  const user = getSessionFromCookie(cookieHeader);
  if (!user) {
    return { user: null as any, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}
