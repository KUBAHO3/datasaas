"use server";

import { authAction } from "@/lib/safe-action";
import { Permission, Role } from "node-appwrite";
import z from "zod";
import { DocumentStorageService } from "../storage/document-storage.service";
import { ImageStorageService } from "../storage/image-storage.service";

const uploadDocumentSchema = z.object({
  file: z.instanceof(File),
  companyId: z.string().optional(),
});

const uploadImageSchema = z.object({
  file: z.instanceof(File),
  companyId: z.string().optional(),
});

const uploadMultipleDocumentsSchema = z.object({
  files: z.array(z.instanceof(File)),
  companyId: z.string().optional(),
});

const uploadMultipleImagesSchema = z.object({
  files: z.array(z.instanceof(File)),
  companyId: z.string().optional(),
});

const deleteFileSchema = z.object({
  fileId: z.string(),
  bucketType: z.enum(["document", "image"]),
});

export const uploadDocument = authAction
  .inputSchema(uploadDocumentSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { file, companyId } = parsedInput;
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        return {
          error: "Invalid file type. Only PDF and DOCX files are allowed.",
        };
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return { error: "File size must be less than 10MB" };
      }

      const permissions: string[] = [];

      if (companyId) {
        permissions.push(
          Permission.read(Role.team(companyId)),
          Permission.update(Role.team(companyId, "owner")),
          Permission.delete(Role.team(companyId, "owner"))
        );
      } else {
        permissions.push(
          Permission.read(Role.user(ctx.userId)),
          Permission.update(Role.user(ctx.userId)),
          Permission.delete(Role.user(ctx.userId))
        );
      }

      const documentStorage = new DocumentStorageService();
      const uploadedFile = await documentStorage.uploadFile({
        file,
        permissions,
      });

      return {
        success: true,
        fileId: uploadedFile.$id,
        fileName: uploadedFile.name,
        fileSize: uploadedFile.sizeOriginal,
        mimeType: uploadedFile.mimeType,
      };
    } catch (error) {
      console.error("Upload document error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to upload document",
      };
    }
  });

export const uploadImage = authAction
  .inputSchema(uploadImageSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { file, companyId } = parsedInput;

      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/svg+xml",
      ];

      if (!allowedTypes.includes(file.type)) {
        return {
          error:
            "Invalid file type. Only PNG, JPG, GIF, and SVG images are allowed.",
        };
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return { error: "Image size must be less than 5MB" };
      }

      const permissions: string[] = [];

      if (companyId) {
        permissions.push(
          Permission.read(Role.team(companyId)),
          Permission.update(Role.team(companyId, "owner")),
          Permission.delete(Role.team(companyId, "owner"))
        );
      } else {
        permissions.push(
          Permission.read(Role.user(ctx.userId)),
          Permission.update(Role.user(ctx.userId)),
          Permission.delete(Role.user(ctx.userId))
        );
      }

      const imageStorage = new ImageStorageService();
      const uploadedFile = await imageStorage.uploadFile({
        file,
        permissions,
      });

      return {
        success: true,
        fileId: uploadedFile.$id,
        fileName: uploadedFile.name,
        fileSize: uploadedFile.sizeOriginal,
        mimeType: uploadedFile.mimeType,
      };
    } catch (error) {
      console.error("Upload image error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to upload image",
      };
    }
  });

export const uploadMultipleDocuments = authAction
  .inputSchema(uploadMultipleDocumentsSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { files, companyId } = parsedInput;
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      const maxSize = 10 * 1024 * 1024;

      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          return { error: `Invalid file type: ${file.name}` };
        }
        if (file.size > maxSize) {
          return { error: `File too large: ${file.name}` };
        }
      }

      const permissions: string[] = [];

      if (companyId) {
        permissions.push(
          Permission.read(Role.team(companyId)),
          Permission.update(Role.team(companyId, "owner")),
          Permission.delete(Role.team(companyId, "owner"))
        );
      } else {
        permissions.push(
          Permission.read(Role.user(ctx.userId)),
          Permission.update(Role.user(ctx.userId)),
          Permission.delete(Role.user(ctx.userId))
        );
      }

      const documentStorage = new DocumentStorageService();
      const uploadedFiles = await documentStorage.uploadMultipleFiles(
        files,
        permissions
      );

      return {
        success: true,
        files: uploadedFiles.map((file) => ({
          fileId: file.$id,
          fileName: file.name,
          fileSize: file.sizeOriginal,
          mimeType: file.mimeType,
        })),
      };
    } catch (error) {
      console.error("Upload multiple documents error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to upload documents",
      };
    }
  });

export const uploadMultipleImages = authAction
  .inputSchema(uploadMultipleImagesSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { files, companyId } = parsedInput;

      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/svg+xml",
      ];
      const maxSize = 5 * 1024 * 1024;

      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          return { error: `Invalid file type: ${file.name}` };
        }
        if (file.size > maxSize) {
          return { error: `Image too large: ${file.name}` };
        }
      }

      const permissions: string[] = [];

      if (companyId) {
        permissions.push(
          Permission.read(Role.team(companyId)),
          Permission.update(Role.team(companyId, "owner")),
          Permission.delete(Role.team(companyId, "owner"))
        );
      } else {
        permissions.push(
          Permission.read(Role.user(ctx.userId)),
          Permission.update(Role.user(ctx.userId)),
          Permission.delete(Role.user(ctx.userId))
        );
      }

      const imageStorage = new ImageStorageService();
      const uploadedFiles = await imageStorage.uploadMultipleFiles(
        files,
        permissions
      );

      return {
        success: true,
        files: uploadedFiles.map((file) => ({
          fileId: file.$id,
          fileName: file.name,
          fileSize: file.sizeOriginal,
          mimeType: file.mimeType,
        })),
      };
    } catch (error) {
      console.error("Upload multiple images error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to upload images",
      };
    }
  });

export const deleteFile = authAction
  .inputSchema(deleteFileSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { fileId, bucketType } = parsedInput;

      if (bucketType === "document") {
        const documentStorage = new DocumentStorageService();
        await documentStorage.deleteFile(fileId);
      } else {
        const imageStorage = new ImageStorageService();
        await imageStorage.deleteFile(fileId);
      }

      return { success: true };
    } catch (error) {
      console.error("Delete file error:", error);
      return {
        error: error instanceof Error ? error.message : "Failed to delete file",
      };
    }
  });
