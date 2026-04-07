import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";
import { decodeSessionToken, toSessionUser } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const token = decodeSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const session = await db.session.findFirst({
    where: {
      token,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!session || !session.user.isActive) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json(
    {
      user: toSessionUser({
        fullName: session.user.fullName,
        role: session.user.role,
        organizationId: session.user.organizationId,
        organizationName: session.user.organization.name,
      }),
    },
    { status: 200 },
  );
}
