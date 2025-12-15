import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { AUTH_COOKIE } from "../constants";
import { SessionAccountService } from "../services/core/base-account";
import { UserDataAdminModel } from "../services/models/users.model";
import { UserData } from "../types/user-types";
import { redirect } from "next/navigation";
import { checkCompanyAccess } from "./company-access";

export interface UserContext {
  userId: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  companyId?: string;
  role?: string;
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
    if (userContext.companyId) {
      redirect(`/org/${userContext.companyId}`);
    }
    redirect("/onboarding");
  }

  return userContext;
}

export async function requireCompany(): Promise<UserContext> {
  const userContext = await requireAuth();

  if (!userContext.companyId) {
    redirect("/onboarding");
  }

  // Check if company is suspended (super admins bypass this check)
  if (!userContext.isSuperAdmin) {
    const accessResult = await checkCompanyAccess(
      userContext.userId,
      userContext.isSuperAdmin
    );

    if (!accessResult.hasAccess && accessResult.reason === "suspended") {
      redirect("/suspended");
    }
  }

  return userContext;
}

export async function requireCompanyAccess(orgId: string) {
  const userContext = await requireAuth();

  if (userContext.isSuperAdmin) return userContext;

  if (!userContext.companyId) redirect("/onboarding");

  if (userContext.companyId !== orgId) {
    redirect(`/org/${userContext.companyId}`);
  }

  const accessResult = await checkCompanyAccess(
    userContext.userId,
    userContext.isSuperAdmin
  );

  if (!accessResult.hasAccess && accessResult.reason === "suspended") {
    redirect("/suspended");
  }

  return userContext;
}

export async function requireRole(
  allowedRoles: string[],
  orgId?: string
): Promise<UserContext> {
  const userContext = orgId
    ? await requireCompanyAccess(orgId)
    : await requireCompany();

  if (userContext.isSuperAdmin) {
    return userContext;
  }

  if (!userContext.role || !allowedRoles.includes(userContext.role)) {
    redirect(`/org/${userContext.companyId}`);
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
