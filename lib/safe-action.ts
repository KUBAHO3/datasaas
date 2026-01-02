import { createSafeActionClient } from "next-safe-action";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "./constants";
import { SessionAccountService } from "./services/core/base-account";
import { checkCompanyAccess } from "./access-control/company-access";
import { isValidRBACRole } from "./constants/rbac-roles";
import { hasPermission, getPermissionDescription } from "./utils/permission-checker";
import { isValidJobTitle, getPermissionLevel } from "./constants/company-roles";

export const action = createSafeActionClient({
  handleServerError: (error) => {
    console.error("Action error:", error);

    // Handle Appwrite errors
    if (error && typeof error === 'object' && 'response' in error) {
      try {
        const response = typeof error.response === 'string'
          ? JSON.parse(error.response)
          : error.response;
        if (response?.message) {
          return response.message;
        }
      } catch (e) {
        // Failed to parse response, fall through to default
      }
    }

    // Handle standard Error instances
    if (error instanceof Error) {
      return error.message;
    }

    return "An unexpected error occurred";
  },
});

export const authAction = createSafeActionClient({
  handleServerError: (error) => {
    console.error("Auth action error:", error);

    // Handle Appwrite errors
    if (error && typeof error === 'object' && 'response' in error) {
      try {
        const response = typeof error.response === 'string'
          ? JSON.parse(error.response)
          : error.response;
        if (response?.message) {
          return response.message;
        }
      } catch (e) {
        // Failed to parse response, fall through to default
      }
    }

    // Handle standard Error instances
    if (error instanceof Error) {
      return error.message;
    }

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

  const isSuperAdmin = user.labels?.includes("superadmin") ?? false;

  const accessResult = await checkCompanyAccess(user.$id, isSuperAdmin);

  if (!accessResult.hasAccess) {
    if (accessResult.reason === "suspended") {
      throw new Error(
        `Your company account (${accessResult.companyName}) has been suspended. Please contact support for assistance.`
      );
    }
  }

  return next({
    ctx: {
      userId: user.$id,
      email: user.email,
      name: user.name,
      isSuperAdmin,
      labels: user.labels ?? [],
      companyAccess: accessResult,
    },
  });
});

export const superAdminAction = createSafeActionClient({
  handleServerError: (error) => {
    console.error("Super admin action error:", error);

    // Handle Appwrite errors
    if (error && typeof error === 'object' && 'response' in error) {
      try {
        const response = typeof error.response === 'string'
          ? JSON.parse(error.response)
          : error.response;
        if (response?.message) {
          return response.message;
        }
      } catch (e) {
        // Failed to parse response, fall through to default
      }
    }

    // Handle standard Error instances
    if (error instanceof Error) {
      return error.message;
    }

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

      // Handle Appwrite errors
      if (error && typeof error === 'object' && 'response' in error) {
        try {
          const response = typeof error.response === 'string'
            ? JSON.parse(error.response)
            : error.response;
          if (response?.message) {
            return response.message;
          }
        } catch (e) {
          // Failed to parse response, fall through to default
        }
      }

      // Handle standard Error instances
      if (error instanceof Error) {
        return error.message;
      }

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
      
      const accessResult = await checkCompanyAccess(user.$id, isSuperAdmin);
      
      if (!accessResult.hasAccess) {
        if (accessResult.reason === "suspended") {
          throw new Error(
            `Your company account (${accessResult.companyName}) has been suspended. Please contact support for assistance.`
          );
        }
      }

      if (isSuperAdmin) {
        return next({
          ctx: {
            userId: user.$id,
            email: user.email,
            name: user.name,
            isSuperAdmin: true,
            labels: user.labels || [],
            companyAccess: accessResult,
          },
        });
      }

      const { UserDataAdminModel } = await import(
        "./services/models/users.model"
      );
      const userDataModel = new UserDataAdminModel();
      const userData = await userDataModel.findByUserId(user.$id);

      // Validate user has either a role or jobTitle assigned
      if (!userData?.role && !userData?.jobTitle) {
        throw new Error(
          "Your account does not have permissions assigned. Please contact your company administrator."
        );
      }

      // Handle case where role field contains a job title (legacy data)
      let actualRole = userData.role;
      let actualJobTitle = userData.jobTitle;

      if (userData.role && !isValidRBACRole(userData.role)) {
        // Check if it's actually a job title stored in the role field
        if (isValidJobTitle(userData.role)) {
          console.warn(`Job title "${userData.role}" found in role field for user ${user.$id}. Converting to RBAC role.`);
          // Move it to jobTitle and get the corresponding RBAC role
          actualJobTitle = userData.role;
          actualRole = getPermissionLevel(userData.role) || undefined;
        } else {
          console.error(`Invalid role detected: ${userData.role} for user ${user.$id}`);
          throw new Error(
            "Your account has an invalid role. Please contact support."
          );
        }
      }

      // Check if user has permission via role OR job title
      const permissionContext = {
        role: actualRole,
        jobTitle: actualJobTitle,
      };

      if (!hasPermission(permissionContext, allowedRoles)) {
        const userPermissions = getPermissionDescription(permissionContext);
        throw new Error(
          `Insufficient permissions. This action requires one of the following roles: ${allowedRoles.join(", ")}.\n\nYour permissions: ${userPermissions}`
        );
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
          companyAccess: accessResult,
        },
      });
    } catch (error) {
      console.error("Role action authentication error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Authentication failed");
    }
  });
}
