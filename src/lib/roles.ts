import { UserRole } from "@/generated/prisma/enums";

/** Business staff: can moderate properties, realtors, inquiries, etc. */
export function isStaff(role: UserRole): boolean {
  return role === UserRole.DEVELOPER || role === UserRole.ADMIN;
}

/** Platform owner: can manage admin accounts. */
export function isDeveloper(role: UserRole): boolean {
  return role === UserRole.DEVELOPER;
}

export const STAFF_ROLES: UserRole[] = [UserRole.DEVELOPER, UserRole.ADMIN];
