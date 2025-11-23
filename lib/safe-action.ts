import { createSafeActionClient } from "next-safe-action";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "./constants";
import { SessionAccountService } from "./services/core/base-account";

export const action = createSafeActionClient({
  handleServerError: (error) => {
    console.error("Action error:", error);
    return "An unexpected error occurred";
  },
});

export const authAction = createSafeActionClient({
  handleServerError: (error) => {
    console.error("Auth action error:", error);
    return error instanceof Error
      ? error.message
      : "An unexpected error occurred";
  },
}).use(async ({ next }) => {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE);

  if (!session) {
    throw new Error("You must be signed in to perform this action");
  }

  const sessionAccountService = new SessionAccountService();
  const user = await sessionAccountService.get();

  if (!user) {
    throw new Error("Invalid session");
  }

  const isSuperAdmin = user.labels?.includes("superadmin") ?? false;

  return next({
    ctx: {
      userId: user.$id,
      email: user.email,
      name: user.name,
      isSuperAdmin,
      labels: user.labels ?? [],
    },
  });
});

export const superAdminAction = createSafeActionClient({
  handleServerError: (error) => {
    console.error("Super admin action error:", error);
    return "An unexpected error occurred";
  },
}).use(async ({ next }) => {
  const cookieStore = await cookies();
  const session = cookieStore.get(AUTH_COOKIE);

  if (!session) {
    throw new Error("You must be signed in to perform this action");
  }

  const sessionAccountService = new SessionAccountService();
  const user = await sessionAccountService.get();

  if (!user) {
    throw new Error("Invalid session");
  }

  const isSuperAdmin = user.labels?.includes("superadmin") || false;

  if (!isSuperAdmin) {
    throw new Error("You do not have permission to perform this action");
  }

  return next({
    ctx: {
      userId: user.$id,
      email: user.email,
      name: user.name,
      isSuperAdmin: true,
      labels: user.labels || [],
    },
  });
});

export function createRoleAction(allowedRoles: string[]) {
  return createSafeActionClient({
    handleServerError: (error) => {
      console.error("Role action error:", error);
      return "An unexpected error occurred";
    },
  }).use(async ({ next }) => {
    const cookieStore = await cookies();
    const session = cookieStore.get(AUTH_COOKIE);

    if (!session) {
      throw new Error("You must be signed in to perform this action");
    }

    try {
      const sessionAccountService = new SessionAccountService();
      const user = await sessionAccountService.get();

      if (!user) {
        throw new Error("Invalid session");
      }

      const isSuperAdmin = user.labels?.includes("superadmin") || false;

      if (isSuperAdmin) {
        return next({
          ctx: {
            userId: user.$id,
            email: user.email,
            name: user.name,
            isSuperAdmin: true,
            labels: user.labels || [],
          },
        });
      }

      const { UserDataAdminModel } = await import(
        "./services/models/users.model"
      );
      const userDataModel = new UserDataAdminModel();
      const userData = await userDataModel.findByUserId(user.$id);

      if (!userData?.role || !allowedRoles.includes(userData.role)) {
        throw new Error("You do not have permission to perform this action");
      }

      return next({
        ctx: {
          userId: user.$id,
          email: user.email,
          name: user.name,
          isSuperAdmin,
          labels: user.labels || [],
          role: userData.role,
          companyId: userData.companyId,
          teamId: userData.teamId,
        },
      });
    } catch (error) {
      throw new Error("Authentication failed");
    }
  });
}
