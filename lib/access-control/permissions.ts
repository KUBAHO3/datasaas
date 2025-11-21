import { cookies } from "next/headers";
import { cache } from "react";
import "server-only";
import { AUTH_COOKIE } from "../constants";
import { SessionAccountService } from "../services/core/base-account";
import { UserDataAdminModel } from "../services/models/users.model";
import { UserData } from "../types/user-types";
import { redirect } from "next/navigation";

export interface UserContext {
  userId: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  teamId?: string;
  companyId?: string;
  role?: string; // owner, admin, editor, viewer
  labels: string[];
  userData: UserData | null;
}

export const getCurrentUserContext = cache(
  async (): Promise<UserContext | null> => {
    try {
      const cookieStore = await cookies();
      const session = cookieStore.get(AUTH_COOKIE);

      if (!session) {
        return null;
      }

      const sessionAccountService = new SessionAccountService();
      const user = await sessionAccountService.get();

      const isSuperAdmin = user.labels?.includes("superadmin") || false;

      const userDataModel = new UserDataAdminModel();
      const userData = await userDataModel.findByUserId(user.$id);

      return {
        userId: user.$id,
        email: user.email,
        name: user.name,
        isSuperAdmin,
        isAuthenticated: true,
        teamId: userData?.teamId,
        companyId: userData?.companyId,
        role: userData?.role,
        labels: user.labels || [],
        userData,
      };
    } catch (error) {
      console.error("Error getting user context:", error);
      return null;
    }
  }
);

export async function requireAuth(): Promise<UserContext> {
  const userContext = await getCurrentUserContext();

  if (!userContext || !userContext.isAuthenticated) {
    redirect("/auth/sign-in");
  }

  return userContext;
}

export async function requireSuperAdmin(): Promise<UserContext> {
  const userContext = await requireAuth();

  if (!userContext.isSuperAdmin) {
    redirect("/dashboard");
  }

  return userContext;
}

export async function requireCompany(): Promise<UserContext> {
  const userContext = await requireAuth();

  if (!userContext.companyId || !userContext.teamId) {
    redirect("/onboarding");
  }

  return userContext;
}

export async function requireCompanyAccess(
  companyId: string
): Promise<UserContext> {
  const userContext = await requireCompany();

  // Super admins can access any company
  if (userContext.isSuperAdmin) {
    return userContext;
  }

  // Check if user belongs to the requested company
  if (userContext.companyId !== companyId) {
    redirect("/dashboard");
  }

  return userContext;
}

export async function requireRole(
  allowedRoles: string[],
  companyId?: string
): Promise<UserContext> {
  const userContext = companyId
    ? await requireCompanyAccess(companyId)
    : await requireCompany();

  // Super admins bypass role checks
  if (userContext.isSuperAdmin) {
    return userContext;
  }

  if (!userContext.role || !allowedRoles.includes(userContext.role)) {
    redirect("/dashboard");
  }

  return userContext;
}

export const can = {
  beSuperAdmin: async (): Promise<boolean> => {
    const userContext = await getCurrentUserContext();
    return userContext?.isSuperAdmin || false;
  },
  accessCompany: async (companyId: string): Promise<boolean> => {
    const userContext = await getCurrentUserContext();

    if (!userContext) return false;
    if (userContext.isSuperAdmin) return true;

    return userContext.companyId === companyId;
  },
  haveRole: async (roles: string[]): Promise<boolean> => {
    const userContext = await getCurrentUserContext();

    if (!userContext) return false;
    if (userContext.isSuperAdmin) return true;

    return userContext.role ? roles.includes(userContext.role) : false;
  },
  adminCompany: async (): Promise<boolean> => {
    const userContext = await getCurrentUserContext();

    if (!userContext) return false;
    if (userContext.isSuperAdmin) return true;

    return userContext.role === "owner" || userContext.role === "admin";
  },

  editContent: async (): Promise<boolean> => {
    const userContext = await getCurrentUserContext();

    if (!userContext) return false;
    if (userContext.isSuperAdmin) return true;

    return ["owner", "admin", "editor"].includes(userContext.role || "");
  },
};

export async function getTeamMembers(companyId: string) {
  await requireCompanyAccess(companyId);

  const userDataModel = new UserDataAdminModel();
  return userDataModel.findMany({
    where: [{ field: "companyId", operator: "equals", value: companyId }],
    orderBy: [{ field: "$createdAt", direction: "desc" }],
  });
}

export async function validateDataScope(
  resourceCompanyId: string,
  operation: "read" | "write" | "delete" = "read"
): Promise<boolean> {
  const userContext = await getCurrentUserContext();

  if (!userContext) return false;

  if (userContext.isSuperAdmin) return true;

  if (userContext.companyId !== resourceCompanyId) {
    return false;
  }

  switch (operation) {
    case "read":
      return true;
    case "write":
      return ["owner", "admin", "editor"].includes(userContext.role || "");
    case "delete":
      return ["owner", "admin"].includes(userContext.role || "");
    default:
      return false;
  }
}
