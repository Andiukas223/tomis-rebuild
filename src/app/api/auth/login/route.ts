import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isSecureAuthCookie } from "@/lib/auth-cookie";
import { verifyPassword } from "@/lib/password";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";
import {
  createSessionToken,
  encodeSessionToken,
  toSessionUser,
} from "@/lib/session";

type LoginRequestBody = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginRequestBody;
  const username = body.username?.trim() ?? "";
  const password = body.password?.trim() ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { message: "Username and password are required." },
      { status: 400 },
    );
  }

  const user = await db.user.findFirst({
    where: {
      isActive: true,
      OR: [{ username }, { email: username }],
    },
    include: {
      organization: true,
    },
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { message: "Invalid username or password." },
      { status: 401 },
    );
  }

  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8);

  await db.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
      userAgent: request.headers.get("user-agent"),
      ipAddress:
        request.headers.get("x-forwarded-for") ??
        request.headers.get("x-real-ip") ??
        null,
    },
  });

  const sessionUser = toSessionUser({
    fullName: user.fullName,
    role: user.role,
    organizationId: user.organizationId,
    organizationName: user.organization.name,
  });

  const response = NextResponse.json({ user: sessionUser }, { status: 200 });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: encodeSessionToken(token),
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureAuthCookie(),
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
