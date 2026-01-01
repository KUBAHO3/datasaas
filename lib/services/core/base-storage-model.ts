import { ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { createAdminClient, createSessionClient } from "./appwrite";

/**
 * Base Storage Model for Appwrite Storage operations
 * Follows the same pattern as BaseDBModel
 */
abstract class BaseStorageModel {
  protected bucketId: string;

  constructor(bucketId: string) {
    this.bucketId = bucketId;
  }

  protected abstract getClient(): Promise<any>;

  protected async getStorage() {
    const client = await this.getClient();
    return client.storage;
  }

  /**
   * Create/upload a file
   */
  async createFile(
    file: Blob | File,
    fileId?: string,
    permissions?: string[]
  ) {
    const storage = await this.getStorage();

    // ✅ Convert File/Blob to InputFile for Node.js Appwrite SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file instanceof File ? file.name : 'file';
    const inputFile = InputFile.fromBuffer(buffer, fileName);

    return await storage.createFile(
      this.bucketId,
      fileId || ID.unique(),
      inputFile,
      permissions
    );
  }

  /**
   * Get file for download
   */
  async getFile(fileId: string) {
    const storage = await this.getStorage();
    return await storage.getFile(this.bucketId, fileId);
  }

  /**
   * Get file download buffer
   */
  async getFileDownload(fileId: string) {
    const storage = await this.getStorage();
    return await storage.getFileDownload(this.bucketId, fileId);
  }

  /**
   * Get file preview
   */
  async getFilePreview(fileId: string, width?: number, height?: number) {
    const storage = await this.getStorage();
    return await storage.getFilePreview(this.bucketId, fileId, width, height);
  }

  /**
   * Get file view URL
   */
  async getFileView(fileId: string) {
    const storage = await this.getStorage();
    return await storage.getFileView(this.bucketId, fileId);
  }

  /**
   * Update file
   */
  async updateFile(fileId: string, permissions?: string[]) {
    const storage = await this.getStorage();
    return await storage.updateFile(this.bucketId, fileId, permissions);
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string) {
    const storage = await this.getStorage();
    return await storage.deleteFile(this.bucketId, fileId);
  }

  /**
   * List files
   */
  async listFiles(queries?: string[], search?: string) {
    const storage = await this.getStorage();
    return await storage.listFiles(this.bucketId, queries, search);
  }
}

/**
 * Session Storage Model - uses user session for permissions
 */
export class SessionStorageModel extends BaseStorageModel {
  constructor(bucketId: string) {
    super(bucketId);
  }

  protected async getClient() {
    return await createSessionClient();
  }
}

/**
 * Admin Storage Model - uses admin client with full access
 */
export class AdminStorageModel extends BaseStorageModel {
  constructor(bucketId: string) {
    super(bucketId);
  }

  protected async getClient() {
    return await createAdminClient();
  }
}
