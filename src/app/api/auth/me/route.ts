import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });
  response.cookies.set("auth-token", "", { maxAge: 0, path: "/" });
  return response;
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const user = cookieHeader ? getSessionFromCookie(cookieHeader) : null;
  return NextResponse.json({ user });
}
