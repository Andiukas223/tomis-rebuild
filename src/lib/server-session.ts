import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";
import { decodeSessionToken, toSessionUser } from "@/lib/session";

export async function getServerSessionRecord() {
  const cookieStore = await cookies();
  const token = decodeSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!token) {
    return null;
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
    return null;
  }

  return session;
}

export async function getServerSessionUser() {
  const session = await getServerSessionRecord();

  if (!session) {
    return null;
  }

  return toSessionUser({
    id: session.user.id,
    fullName: session.user.fullName,
    role: session.user.role,
    organizationId: session.user.organizationId,
    organizationName: session.user.organization.name,
  });
}
