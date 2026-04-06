import { NextResponse } from "next/server";
import { isSecureAuthCookie } from "@/lib/auth-cookie";
import { db } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";
import { decodeSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  const rawCookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  const token = decodeSessionToken(rawCookie);

  if (token) {
    await db.session.updateMany({
      where: {
        token,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  const response = NextResponse.json({ success: true }, { status: 200 });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureAuthCookie(),
    path: "/",
    maxAge: 0,
  });

  return response;
}
