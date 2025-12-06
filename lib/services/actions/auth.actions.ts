"use server";

import {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInFormSchema,
} from "@/lib/schemas/user-schema";
import {
  AdminAccountService,
  SessionAccountService,
} from "../core/base-account";
import { AdminUsersService, UserDataAdminModel } from "../models/users.model";
import { redirect } from "next/navigation";
import { action, authAction } from "@/lib/safe-action";
import { APP_URL } from "@/lib/env-config";
import {
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
} from "../email/resend";
import { revalidatePath } from "next/cache";

const resetAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const MAX_ATTEMPTS = 100;

export const signInAction = action
  .inputSchema(signInFormSchema)
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
          companyId: userData?.companyId ?? null
        },
      };
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        error: error instanceof Error ? error.message : "Invalid credentials",
      };
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

export const signOutAction = authAction.action(async ({ ctx }) => {
  try {
    const sessionAccountService = new SessionAccountService();
    await sessionAccountService.deleteSession("current");

    console.log(`Loggin Out user: `, ctx.email);
    return { success: true };
  } catch (error: any) {
    console.error("Sign out error:", error);
    return { error: "Failed to sign out" };
  }
});

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
    console.log(`User ${user?.email} is not super admin`);
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

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const attempt = resetAttempts.get(email);

  if (!attempt) {
    resetAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  if (now - attempt.lastAttempt > RATE_LIMIT_WINDOW) {
    resetAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  if (attempt.count >= MAX_ATTEMPTS) {
    return false;
  }

  attempt.count += 1;
  attempt.lastAttempt = now;
  resetAttempts.set(email, attempt);
  return true;
}

export const forgotPasswordAction = action
  .schema(forgotPasswordSchema)
  .action(async ({ parsedInput: { email } }) => {
    try {
      if (!checkRateLimit(email)) {
        return {
          error:
            "Too many password reset attempts. Please try again in 1 hour.",
        };
      }

      const adminUsersService = new AdminUsersService();
      const userExists = await adminUsersService.existsByEmail(email);

      if (!userExists) {
        return {
          success: true,
          message:
            "If an account with that email exists, we've sent a password reset link.",
        };
      }

      const sessionAccountService = new SessionAccountService();
      const resetUrl = `${APP_URL}/auth/reset-password`;

      try {
        await sessionAccountService.createRecovery(email, resetUrl);
      } catch (error) {
        console.error("Appwrite recovery error:", error);
        return {
          success: true,
          message:
            "If an account with that email exists, we've sent a password reset link.",
        };
      }

      return {
        success: true,
        message:
          "If an account with that email exists, we've sent a password reset link.",
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        error: "An error occurred. Please try again later.",
      };
    }
  });

export const resetPasswordAction = action
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput: { userId, secret, password } }) => {
    try {
      const sessionAccountService = new SessionAccountService();

      try {
        await sessionAccountService.updateRecovery(userId, secret, password);
      } catch (error: any) {
        console.error("Reset password error:", error);
        if (error?.code === 401) {
          return {
            error: "Invalid or expired reset link. Please request a new one.",
          };
        }
        throw error;
      }

      const adminUsersService = new AdminUsersService();
      const user = await adminUsersService.get(userId);

      try {
        await adminUsersService.deleteSessions(userId);
      } catch (error) {
        console.error("Failed to delete sessions:", error);
      }

      try {
        await sendPasswordChangedEmail(user.email, user.name);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      resetAttempts.delete(user.email);

      revalidatePath("/auth/sign-in");

      return {
        success: true,
        message:
          "Password reset successful! You can now sign in with your new password.",
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to reset password. Please try again.",
      };
    }
  });

export const changePasswordAction = authAction
  .schema(changePasswordSchema)
  .action(async ({ parsedInput: { currentPassword, newPassword }, ctx }) => {
    try {
      const { AdminAccountService } = await import("../core/base-account");
      const adminAccountService = new AdminAccountService();

      try {
        await adminAccountService.createSession(ctx.email, currentPassword);

        const sessionAccountService = new SessionAccountService();
        await sessionAccountService.deleteSession("current");
      } catch (error) {
        return {
          error: "Current password is incorrect",
        };
      }

      const sessionAccountService = new SessionAccountService();
      await sessionAccountService.updatePassword(newPassword, currentPassword);

      const adminUsersService = new AdminUsersService();
      const sessions = await adminUsersService.listSessions(ctx.userId);

      for (const session of sessions.sessions) {
        if (session.current) continue;
        try {
          await adminUsersService.deleteSession(ctx.userId, session.$id);
        } catch (error) {
          console.error("Failed to delete session:", error);
        }
      }

      try {
        await sendPasswordChangedEmail(ctx.email, ctx.name);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      revalidatePath("/dashboard/settings/security");

      return {
        success: true,
        message:
          "Password changed successfully! You've been logged out of all other devices.",
      };
    } catch (error) {
      console.error("Change password error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to change password. Please try again.",
      };
    }
  });
