import type { DefaultSession } from "next-auth";
import type { UserRole, RealtorStatus } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      realtorStatus: RealtorStatus | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    realtorStatus?: RealtorStatus | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    realtorStatus: RealtorStatus | null;
  }
}
