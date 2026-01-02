"use server";

import { z } from "zod";
import { createRoleAction, authAction } from "@/lib/safe-action";
import { UserDataAdminModel } from "@/lib/services/models/users.model";
import { RBAC_ROLES, getRoleArray, isValidRBACRole } from "@/lib/constants/rbac-roles";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { unstable_cache } from "next/cache";

/**
 * Get user profile by userId - cached
 */
export const getUserProfileById = cache(async (userId: string, viewerId: string) => {
  return unstable_cache(
    async () => {
      try {
        const userDataModel = new UserDataAdminModel();
        const userData = await userDataModel.findByUserId(userId);
        return userData;
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        return null;
      }
    },
    [`user-profile-${userId}-viewer-${viewerId}`],
    {
      revalidate: 60,
      tags: [`user-profile-${userId}`],
    }
  )();
});

/**
 * Schema for updating another user's role
 */
const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum([RBAC_ROLES.OWNER, RBAC_ROLES.ADMIN, RBAC_ROLES.EDITOR, RBAC_ROLES.VIEWER]),
});

/**
 * Update a user's role - Owner/Admin only
 */
export const updateUserRoleAction = createRoleAction(
  getRoleArray("OWNER_AND_ADMIN")
)
  .schema(updateUserRoleSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { userId, role } = parsedInput;

    // Prevent users from changing their own role
    if (userId === ctx.userId) {
      return {
        error: "You cannot change your own role",
      };
    }

    try {
      const userDataModel = new UserDataAdminModel();

      // Get the user to update
      const targetUser = await userDataModel.findByUserId(userId);

      if (!targetUser) {
        return {
          error: "User not found",
        };
      }

      // Verify same company
      if (targetUser.companyId !== ctx.companyId) {
        return {
          error: "You can only manage users in your company",
        };
      }

      // Prevent non-owners from changing owner roles
      if (targetUser.role === RBAC_ROLES.OWNER && ctx.role !== RBAC_ROLES.OWNER) {
        return {
          error: "Only owners can change other owners' roles",
        };
      }

      // Update the role
      await userDataModel.updateById(targetUser.$id, {
        role: role,
      });

      revalidatePath(`/dashboard/profile/${userId}`);
      revalidatePath("/dashboard/team");

      return {
        success: true,
        message: "User role updated successfully",
      };
    } catch (error) {
      console.error("Error updating user role:", error);
      return {
        error: "Failed to update user role",
      };
    }
  });

/**
 * Schema for suspending a user
 */
const suspendUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  reason: z.string().optional(),
});

/**
 * Suspend a user - Owner/Admin only
 */
export const suspendUserAction = createRoleAction(
  getRoleArray("OWNER_AND_ADMIN")
)
  .schema(suspendUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { userId, reason } = parsedInput;

    // Prevent users from suspending themselves
    if (userId === ctx.userId) {
      return {
        error: "You cannot suspend yourself",
      };
    }

    try {
      const userDataModel = new UserDataAdminModel();

      const targetUser = await userDataModel.findByUserId(userId);

      if (!targetUser) {
        return {
          error: "User not found",
        };
      }

      // Verify same company
      if (targetUser.companyId !== ctx.companyId) {
        return {
          error: "You can only suspend users in your company",
        };
      }

      // Prevent non-owners from suspending owners
      if (targetUser.role === RBAC_ROLES.OWNER && ctx.role !== RBAC_ROLES.OWNER) {
        return {
          error: "Only owners can suspend other owners",
        };
      }

      // Check if already suspended
      if (targetUser.suspended) {
        return {
          error: "User is already suspended",
        };
      }

      await userDataModel.updateById(targetUser.$id, {
        suspended: true,
        suspendedAt: new Date().toISOString(),
        suspendedBy: ctx.userId,
        suspendedReason: reason,
      });

      revalidatePath(`/dashboard/profile/${userId}`);
      revalidatePath("/dashboard/team");

      return {
        success: true,
        message: "User suspended successfully",
      };
    } catch (error) {
      console.error("Error suspending user:", error);
      return {
        error: "Failed to suspend user",
      };
    }
  });

/**
 * Unsuspend a user - Owner/Admin only
 */
export const unsuspendUserAction = createRoleAction(
  getRoleArray("OWNER_AND_ADMIN")
)
  .schema(z.object({ userId: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    const { userId } = parsedInput;

    try {
      const userDataModel = new UserDataAdminModel();

      const targetUser = await userDataModel.findByUserId(userId);

      if (!targetUser) {
        return {
          error: "User not found",
        };
      }

      // Verify same company
      if (targetUser.companyId !== ctx.companyId) {
        return {
          error: "You can only unsuspend users in your company",
        };
      }

      // Check if actually suspended
      if (!targetUser.suspended) {
        return {
          error: "User is not suspended",
        };
      }

      await userDataModel.updateById(targetUser.$id, {
        suspended: false,
        suspendedAt: undefined,
        suspendedBy: undefined,
        suspendedReason: undefined,
      });

      revalidatePath(`/dashboard/profile/${userId}`);
      revalidatePath("/dashboard/team");

      return {
        success: true,
        message: "User unsuspended successfully",
      };
    } catch (error) {
      console.error("Error unsuspending user:", error);
      return {
        error: "Failed to unsuspend user",
      };
    }
  });

/**
 * Schema for updating user details (admin action)
 */
const updateUserDetailsSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1).optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
});

/**
 * Update another user's details - Owner/Admin only
 */
export const updateUserDetailsAction = createRoleAction(
  getRoleArray("OWNER_AND_ADMIN")
)
  .schema(updateUserDetailsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { userId, ...updates } = parsedInput;

    try {
      const userDataModel = new UserDataAdminModel();

      const targetUser = await userDataModel.findByUserId(userId);

      if (!targetUser) {
        return {
          error: "User not found",
        };
      }

      // Verify same company
      if (targetUser.companyId !== ctx.companyId) {
        return {
          error: "You can only update users in your company",
        };
      }

      await userDataModel.updateById(targetUser.$id, updates);

      revalidatePath(`/dashboard/profile/${userId}`);
      revalidatePath("/dashboard/team");

      return {
        success: true,
        message: "User details updated successfully",
      };
    } catch (error) {
      console.error("Error updating user details:", error);
      return {
        error: "Failed to update user details",
      };
    }
  });
