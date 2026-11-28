import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return session;
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
  });

  if (!user || user.deletedAt || !user.isActive || !allowedRoles.includes(user.role)) {
    return null;
  }

  return user;
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

export async function getCurrentUser() {
  const session = await requireAuth();
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email.toLowerCase() },
  });
}

export async function canAccessResource(resourceUserId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.deletedAt || !currentUser.isActive) return false;
  if (currentUser.role === "ADMIN") return true;
  return currentUser.id === resourceUserId;
}
