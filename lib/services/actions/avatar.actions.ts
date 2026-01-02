"use server";

import { authAction } from "@/lib/safe-action";
import { z } from "zod";
import { ImageStorageAdminService } from "../storage/image-storage.service";
import { UserDataAdminModel } from "../models/users.model";
import { revalidatePath } from "next/cache";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

const uploadAvatarSchema = z.object({
  file: z.any(),
});

export const uploadAvatarAction = authAction
  .schema(uploadAvatarSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { file } = parsedInput;

      if (!file) {
        return { error: "No file provided" };
      }

      const fileSize = file.size;
      const fileType = file.type;

      if (fileSize > MAX_FILE_SIZE) {
        return { error: "File size must be less than 5MB" };
      }

      if (!ALLOWED_FILE_TYPES.includes(fileType)) {
        return { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed" };
      }

      const userDataModel = new UserDataAdminModel();
      const userData = await userDataModel.findByUserId(ctx.userId);

      if (!userData) {
        return { error: "User data not found" };
      }

      const storageService = new ImageStorageAdminService();

      if (userData.avatar) {
        try {
          const oldFileId = extractFileIdFromUrl(userData.avatar);
          if (oldFileId) {
            await storageService.deleteFile(oldFileId);
          }
        } catch (error) {
          console.error("Failed to delete old avatar:", error);
        }
      }

      const uploadedFile = await storageService.uploadFile({
        file,
        permissions: [
          "read(\"any\")",
          `update(\"user:${ctx.userId}\")`,
          `delete(\"user:${ctx.userId}\")`,
        ],
      });

      const fileUrl = storageService.getFileUrl(uploadedFile.$id, "view");

      await userDataModel.updateById(userData.$id, {
        avatar: fileUrl,
      });

      revalidatePath("/dashboard/profile");

      return {
        success: true,
        avatarUrl: fileUrl,
        message: "Avatar uploaded successfully",
      };
    } catch (error) {
      console.error("Upload avatar error:", error);
      return {
        error: error instanceof Error ? error.message : "Failed to upload avatar",
      };
    }
  });

export const deleteAvatarAction = authAction.action(async ({ ctx }) => {
  try {
    const userDataModel = new UserDataAdminModel();
    const userData = await userDataModel.findByUserId(ctx.userId);

    if (!userData) {
      return { error: "User data not found" };
    }

    if (!userData.avatar) {
      return { error: "No avatar to delete" };
    }

    const fileId = extractFileIdFromUrl(userData.avatar);

    await userDataModel.updateById(userData.$id, {
      avatar: null,
    });

    if (fileId) {
      try {
        const storageService = new ImageStorageAdminService();
        await storageService.deleteFile(fileId);
      } catch (error) {
        console.error("Failed to delete avatar file:", error);
      }
    }

    revalidatePath("/dashboard/profile");

    return {
      success: true,
      message: "Avatar deleted successfully",
    };
  } catch (error) {
    console.error("Delete avatar error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to delete avatar",
    };
  }
});

function extractFileIdFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/files\/([^/?]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
