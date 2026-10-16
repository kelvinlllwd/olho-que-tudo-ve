import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "olho-que-tudo-ve-secret-change-in-production-2024";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JWTPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
  partnerCode?: string | null;
}

export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

function getCookiesFromHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split("; ").reduce((acc: Record<string, string>, cookie) => {
    const eqIdx = cookie.indexOf("=");
    if (eqIdx > 0) {
      const name = cookie.substring(0, eqIdx);
      const value = cookie.substring(eqIdx + 1);
      acc[name] = value;
    }
    return acc;
  }, {});
}

export function getServerSession(request: Request): JWTPayload | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  const cookieHeader = request.headers.get("cookie");
  const cookies = getCookiesFromHeader(cookieHeader);
  const token = cookies["auth-token"];
  if (token) {
    return verifyToken(token);
  }

  return null;
}

export function getSessionFromCookie(cookieHeader: string | null): JWTPayload | null {
  const cookies = getCookiesFromHeader(cookieHeader);
  const token = cookies["auth-token"];
  if (!token) return null;
  return verifyToken(token);
}
