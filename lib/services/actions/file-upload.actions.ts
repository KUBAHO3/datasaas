"use server";

import { authAction } from "@/lib/safe-action";
import { Permission, Role } from "node-appwrite";
import { zfd } from "zod-form-data";
import { DocumentStorageAdminService, DocumentStorageService } from "../storage/document-storage.service";
import { ImageStorageService } from "../storage/image-storage.service";

const uploadDocumentSchema = zfd.formData({
  file: zfd.file(),
  companyId: zfd.text(),
});

const uploadMultipleDocumentsSchema = zfd.formData({
  files: zfd.repeatableOfType(zfd.file()),
  companyId: zfd.text().optional(),
});

const uploadImageSchema = zfd.formData({
  file: zfd.file(),
  companyId: zfd.text().optional(),
});

const deleteFileSchema = zfd.formData({
  fileId: zfd.text(),
  bucketType: zfd.text(),
});

// ✅ Upload Single Document
export const uploadDocument = authAction
  .schema(uploadDocumentSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { file, companyId } = parsedInput;

      // Validate PDF file type
      const allowedTypes = [
        "application/pdf",
        "application/x-pdf",
        "application/acrobat",
        "applications/vnd.pdf",
        "text/pdf",
        "text/x-pdf",
      ];

      const isPdf =
        allowedTypes.includes(file.type) ||
        file.name.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        return {
          success: false,
          error: `Invalid file type. Only PDF files are allowed. (Received: ${file.type})`,
        };
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          error: "File size must be less than 10MB",
        };
      }

      // Set up permissions
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

      // Upload to Appwrite Storage
      const documentStorage = new DocumentStorageAdminService();
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
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to upload document",
      };
    }
  });

// ✅ Upload Multiple Documents
export const uploadMultipleDocuments = authAction
  .schema(uploadMultipleDocumentsSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { files, companyId } = parsedInput;

      // Validate all files
      const allowedTypes = [
        "application/pdf",
        "application/x-pdf",
        "application/acrobat",
        "applications/vnd.pdf",
        "text/pdf",
        "text/x-pdf",
      ];
      const maxSize = 10 * 1024 * 1024;

      for (const file of files) {
        const isPdf =
          allowedTypes.includes(file.type) ||
          file.name.toLowerCase().endsWith(".pdf");

        if (!isPdf) {
          return {
            success: false,
            error: `Invalid file type for ${file.name}. Only PDF files are allowed.`,
          };
        }
        if (file.size > maxSize) {
          return {
            success: false,
            error: `File too large: ${file.name}`,
          };
        }
      }

      // Set up permissions
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

      // Upload all files
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
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to upload documents",
      };
    }
  });

// ✅ Upload Image
export const uploadImage = authAction
  .schema(uploadImageSchema)
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
          success: false,
          error:
            "Invalid file type. Only PNG, JPG, GIF, and SVG images are allowed.",
        };
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          error: "Image size must be less than 5MB",
        };
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
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to upload image",
      };
    }
  });

// ✅ Delete File
export const deleteFile = authAction
  .schema(deleteFileSchema)
  .action(async ({ parsedInput }) => {
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
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete file",
      };
    }
  });
