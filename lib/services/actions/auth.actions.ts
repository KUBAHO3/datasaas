"use server";

import { createSafeActionClient } from "next-safe-action";
import { signInFormSchema } from "@/lib/schemas/user-schema";
import {
  AdminAccountService,
  SessionAccountService,
} from "../core/base-account";
import { AdminUsersService, UserDataAdminModel } from "../models/users.model";
import { redirect } from "next/navigation";

const action = createSafeActionClient({
  handleServerError: (error) => {
    return error.message;
  },
});

export const signInAction = action
  .schema(signInFormSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    try {
      const adminAccountService = new AdminAccountService();
      await adminAccountService.createSession(email, password);

      const sessionAccountService = new SessionAccountService();
      const user = await sessionAccountService.get();

      const isSuperAdmin = user.labels?.includes("superadmin") || false;

      const userDataModel = new UserDataAdminModel();
      let userData = await userDataModel.findByUserId(user.$id);

      if (!userData) {
        userData = await userDataModel.createUserData(user.$id, {
          name: user.name,
          email: user.email,
        });
      }

      return {
        success: true,
        user: {
          id: user.$id,
          email: user.email,
          name: user.name,
          isSuperAdmin,
        },
      };
    } catch (error) {
      console.error("Sign in error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Invalid credentials"
      );
    }
  });

export async function getCurrentUser() {
  try {
    const sessionAccountService = new SessionAccountService();
    const user = await sessionAccountService.get();

    const isSuperAdmin = user.labels?.includes("superadmin") || false;

    const userDataModel = new UserDataAdminModel();
    const userData = await userDataModel.findByUserId(user.$id);

    return {
      id: user.$id,
      email: user.email,
      name: user.name,
      isSuperAdmin,
      labels: user.labels || [],
      userData: userData || null,
    };
  } catch (error) {
    return null;
  }
}

export async function signOutAction() {
  try {
    const sessionAccountService = new SessionAccountService();
    await sessionAccountService.deleteSession("current");

    return { success: true };
  } catch (error: any) {
    console.error("Sign out error:", error);
    throw new Error("Failed to sign out");
  }
}

export async function checkIsSuperAdmin(userId: string): Promise<boolean> {
  try {
    const adminUsersService = new AdminUsersService();
    const user = await adminUsersService.get(userId);
    return user.labels?.includes("superadmin") || false;
  } catch (error) {
    console.error("Error checking super admin status:", error);
    return false;
  }
}

export async function verifySuperAdmin() {
  const user = await getCurrentUser();

  if (!user || !user.isSuperAdmin) {
    console.log(`User ${user?.email} is not super admin`)
    redirect("/auth/sign-in");
  }

  return user;
}

export async function listUsers(queries?: string[]) {
  try {
    const adminUsersService = new AdminUsersService();
    return await adminUsersService.list(queries);
  } catch (error) {
    console.error("Error listing users:", error);
    return { users: [], total: 0 };
  }
}

export async function getUserById(userId: string) {
  try {
    const adminUsersService = new AdminUsersService();
    return await adminUsersService.get(userId);
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}