"use server";

import { authAction } from "@/lib/safe-action";
import { updateUserProfileSchema } from "@/lib/schemas/user-profile-schemas";
import { UserDataAdminModel } from "../models/users.model";
import { AdminUsersService } from "../models/users.model";
import { revalidatePath } from "next/cache";

export const updateUserProfileAction = authAction
  .inputSchema(updateUserProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { name, jobTitle, phone, bio, avatar } = parsedInput;

      // Update user name in Appwrite Auth
      if (name && name !== ctx.name) {
        const adminUsersService = new AdminUsersService();
        await adminUsersService.updateName(ctx.userId, name);
      }

      // Update user data in database
      const userDataModel = new UserDataAdminModel();
      const userData = await userDataModel.findByUserId(ctx.userId);

      if (!userData) {
        return { error: "User data not found" };
      }

      const updateData: any = {};
      if (jobTitle !== undefined) updateData.jobTitle = jobTitle || undefined;
      if (phone !== undefined) updateData.phone = phone || undefined;
      if (bio !== undefined) updateData.bio = bio || undefined;
      // Only set avatar if it's a valid URL, otherwise set to undefined
      if (avatar !== undefined) {
        updateData.avatar = avatar && avatar.trim() !== "" ? avatar : undefined;
      }

      await userDataModel.updateById(userData.$id, updateData);

      // Revalidate cache
      revalidatePath("/dashboard/profile");
      if (ctx.userData?.companyId) {
        revalidatePath(`/org/${ctx.userData.companyId}`);
      }

      // Revalidate user profile cache tag
      const { revalidateTag } = await import("next/cache");
      revalidateTag(`user-profile-${ctx.userId}`);

      return {
        success: true,
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("Update user profile error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update profile",
      };
    }
  });
