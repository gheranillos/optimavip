import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { UserRole, RealtorStatus } from "@/generated/prisma/enums";

/**
 * Returns the current session, or null. Use in server components / actions.
 */
export async function getSession() {
  return auth();
}

/**
 * Loads the full current user from the DB (fresh role/status), or null.
 */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
  });
}

/**
 * Requires an authenticated user. Redirects to /login otherwise.
 * (Locale prefix is added automatically by the proxy.)
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
}

/**
 * Requires the user to have one of the allowed roles. Redirects otherwise.
 */
export async function requireRole(roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/");
  }
  return user;
}

export async function requireAdmin() {
  return requireRole([UserRole.ADMIN]);
}

/**
 * Requires an APPROVED realtor (or admin). Pending realtors are redirected to a
 * "pending approval" screen.
 */
export async function requireApprovedRealtor() {
  const user = await requireUser();

  if (user.role === UserRole.ADMIN) return user;

  if (user.role !== UserRole.REALTOR) {
    redirect("/");
  }
  if (user.realtorStatus !== RealtorStatus.APPROVED) {
    redirect("/dashboard/pending");
  }
  return user;
}
