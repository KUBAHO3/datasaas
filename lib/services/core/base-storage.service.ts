import "server-only";

import { ID, ImageFormat, ImageGravity, Models } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { createSessionClient, createAdminClient } from "./appwrite";
import { AppwriteErrorHandler } from "@/lib/errors/appwrite-errors";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "@/lib/env-config";

export interface CacheOptions {
  key?: string;
  ttl?: number; // seconds
}

export interface UploadFileOptions {
  file: File;
  permissions?: string[];
}

export interface FilePreviewOptions {
  width?: number;
  height?: number;
  gravity?: ImageGravity;
  quality?: number;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  opacity?: number;
  rotation?: number;
  background?: string;
  output?: ImageFormat;
}

export abstract class BaseStorageService {
  protected cache = new Map<string, { data: any; expiry: number }>();

  constructor(protected bucketId: string) {}

  async uploadFile(options: UploadFileOptions): Promise<Models.File> {
    try {
      const { storage } = await createSessionClient();
      const fileId = ID.unique();

      // ✅ Convert File to InputFile for Node.js
      const arrayBuffer = await options.file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const inputFile = InputFile.fromBuffer(buffer, options.file.name);

      const uploadedFile = await storage.createFile(
        this.bucketId,
        fileId,
        inputFile,
        options.permissions
      );

      this.invalidateCache(["listFiles"]);

      return uploadedFile;
    } catch (error) {
      throw AppwriteErrorHandler.handle(error);
    }
  }

  async uploadMultipleFiles(
    files: File[],
    permissions?: string[]
  ): Promise<Models.File[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile({ file, permissions })
    );

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw AppwriteErrorHandler.handle(error);
    }
  }

  async getFile(
    fileId: string,
    options: { cache?: CacheOptions } = {}
  ): Promise<Models.File | null> {
    try {
      if (options.cache) {
        const cached = this.getFromCache(`getFile:${fileId}`);
        if (cached) return cached;
      }

      const { storage } = await createSessionClient();
      const file = await storage.getFile(this.bucketId, fileId);

      if (options.cache) {
        this.setCache(`getFile:${fileId}`, file, options.cache);
      }

      return file;
    } catch (error) {
      const appwriteError = AppwriteErrorHandler.handle(error);
      if (appwriteError.status === 404) return null;
      throw appwriteError;
    }
  }

  async getFilePreview(
    fileId: string,
    options: FilePreviewOptions = {}
  ): Promise<ArrayBuffer> {
    try {
      const { storage } = await createSessionClient();
      return await storage.getFilePreview(
        this.bucketId,
        fileId,
        options.width,
        options.height,
        options.gravity,
        options.quality,
        options.borderWidth,
        options.borderColor,
        options.borderRadius,
        options.opacity,
        options.rotation,
        options.background,
        options.output
      );
    } catch (error) {
      throw AppwriteErrorHandler.handle(error);
    }
  }

  async getFileDownload(fileId: string): Promise<ArrayBuffer> {
    try {
      const { storage } = await createSessionClient();
      return await storage.getFileDownload(this.bucketId, fileId);
    } catch (error) {
      throw AppwriteErrorHandler.handle(error);
    }
  }

  async getFileView(fileId: string): Promise<ArrayBuffer> {
    try {
      const { storage } = await createSessionClient();
      return await storage.getFileView(this.bucketId, fileId);
    } catch (error) {
      throw AppwriteErrorHandler.handle(error);
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      const { storage } = await createSessionClient();
      await storage.deleteFile(this.bucketId, fileId);

      this.invalidateCache([`getFile:${fileId}`, "listFiles"]);
    } catch (error) {
      throw AppwriteErrorHandler.handle(error);
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultipleFiles(fileIds: string[]): Promise<void> {
    const deletePromises = fileIds.map((fileId) => this.deleteFile(fileId));

    try {
      await Promise.all(deletePromises);
    } catch (error) {
      throw AppwriteErrorHandler.handle(error);
    }
  }

  /**
   * Get file URL for different purposes
   */
  getFileUrl(
    fileId: string,
    type: "view" | "download" | "preview" = "view"
  ): string {
    switch (type) {
      case "view":
        return `${APPWRITE_ENDPOINT}/storage/buckets/${this.bucketId}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
      case "download":
        return `${APPWRITE_ENDPOINT}/storage/buckets/${this.bucketId}/files/${fileId}/download?project=${APPWRITE_PROJECT_ID}`;
      case "preview":
        return `${APPWRITE_ENDPOINT}/storage/buckets/${this.bucketId}/files/${fileId}/preview?project=${APPWRITE_PROJECT_ID}`;
      default:
        return `${APPWRITE_ENDPOINT}/storage/buckets/${this.bucketId}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
    }
  }

  /**
   * List files with queries
   */
  async listFiles(queries?: string[]): Promise<Models.FileList> {
    try {
      const { storage } = await createSessionClient();
      return await storage.listFiles(this.bucketId, queries);
    } catch (error) {
      throw AppwriteErrorHandler.handle(error);
    }
  }

  // Cache management
  protected getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  protected setCache(key: string, data: any, options: CacheOptions): void {
    const expiry = Date.now() + (options.ttl || 300) * 1000;
    this.cache.set(options.key || key, { data, expiry });
  }

  protected invalidateCache(patterns: string[]): void {
    for (const pattern of patterns) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    }
  }
}

/**
 * Admin Storage Service - For server-side operations
 * Use this when you need to bypass team permissions (admin operations)
 */
export abstract class AdminStorageService {
  constructor(protected bucketId: string) {}

  /**
   * Upload a file with optional permissions
   * @param options - Upload options containing file and optional permissions
   */
  async uploadFile(options: UploadFileOptions): Promise<Models.File> {
    try {
      const { storage } = await createAdminClient();
      const fileId = ID.unique();

      // ✅ Convert File to InputFile for Node.js
      const arrayBuffer = await options.file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const inputFile = InputFile.fromBuffer(buffer, options.file.name);

      return await storage.createFile(
        this.bucketId,
        fileId,
        inputFile,
        options.permissions
      );
    } catch (error) {
      throw AppwriteErrorHandler.handle(error);
    }
  }

  /**
   * Upload multiple files with optional permissions
   * @param files - Array of files to upload
   * @param permissions - Optional permissions to apply to all files
   */
  async uploadMultipleFiles(
    files: File[],
    permissions?: string[]
  ): Promise<Models.File[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile({ file, permissions })
    );

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw AppwriteErrorHandler.handle(error);
    }
  }

  async getFile(fileId: string): Promise<Models.File | null> {
    try {
      const { storage } = await createAdminClient();
      return await storage.getFile(this.bucketId, fileId);
    } catch (error) {
      const appwriteError = AppwriteErrorHandler.handle(error);
      if (appwriteError.status === 404) return null;
      throw appwriteError;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      const { storage } = await createAdminClient();
      await storage.deleteFile(this.bucketId, fileId);
    } catch (error) {
      throw AppwriteErrorHandler.handle(error);
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultipleFiles(fileIds: string[]): Promise<void> {
    const deletePromises = fileIds.map((fileId) => this.deleteFile(fileId));

    try {
      await Promise.all(deletePromises);
    } catch (error) {
      throw AppwriteErrorHandler.handle(error);
    }
  }

  async listFiles(queries?: string[]): Promise<Models.FileList> {
    try {
      const { storage } = await createAdminClient();
      return await storage.listFiles(this.bucketId, queries);
    } catch (error) {
      throw AppwriteErrorHandler.handle(error);
    }
  }

  getFileUrl(
    fileId: string,
    type: "view" | "download" | "preview" = "view"
  ): string {
    switch (type) {
      case "view":
        return `${APPWRITE_ENDPOINT}/storage/buckets/${this.bucketId}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
      case "download":
        return `${APPWRITE_ENDPOINT}/storage/buckets/${this.bucketId}/files/${fileId}/download?project=${APPWRITE_PROJECT_ID}`;
      case "preview":
        return `${APPWRITE_ENDPOINT}/storage/buckets/${this.bucketId}/files/${fileId}/preview?project=${APPWRITE_PROJECT_ID}`;
      default:
        return `${APPWRITE_ENDPOINT}/storage/buckets/${this.bucketId}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
    }
  }
}