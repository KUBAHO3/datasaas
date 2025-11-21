import { createAdminClient, createSessionClient } from "./appwrite";
import { ID, ImageFormat, ImageGravity } from "node-appwrite";

export interface CreateFileOptions {
  file: File;
  permissions?: string[];
}

export class SessionStorageService {
  protected bucketId: string;

  constructor(bucketId: string) {
    this.bucketId = bucketId;
  }

  protected async getClient() {
    return await createSessionClient();
  }

  async listFiles(queries?: string[]) {
    const client = await this.getClient();
    return await client.storage.listFiles(this.bucketId, queries);
  }

  async createFile(options: CreateFileOptions) {
    const client = await this.getClient();
    return await client.storage.createFile(
      this.bucketId,
      ID.unique(),
      options.file,
      options.permissions
    );
  }

  async getFile(fileId: string) {
    const client = await this.getClient();
    return await client.storage.getFile(this.bucketId, fileId);
  }

  async updateFile(fileId: string, permissions?: string[]) {
    const client = await this.getClient();
    return await client.storage.updateFile(
      this.bucketId,
      fileId,
      undefined,
      permissions
    );
  }

  async deleteFile(fileId: string) {
    const client = await this.getClient();
    return await client.storage.deleteFile(this.bucketId, fileId);
  }

  async getFileDownload(fileId: string) {
    const client = await this.getClient();
    return await client.storage.getFileDownload(this.bucketId, fileId);
  }

  async getFilePreview(
    fileId: string,
    width?: number,
    height?: number,
    gravity?: ImageGravity,
    quality?: number,
    borderWidth?: number,
    borderColor?: string,
    borderRadius?: number,
    opacity?: number,
    rotation?: number,
    background?: string,
    output?: ImageFormat
  ) {
    const client = await this.getClient();
    return await client.storage.getFilePreview(
      this.bucketId,
      fileId,
      width,
      height,
      gravity,
      quality,
      borderWidth,
      borderColor,
      borderRadius,
      opacity,
      rotation,
      background,
      output
    );
  }

  async getFileView(fileId: string) {
    const client = await this.getClient();
    return await client.storage.getFileView(this.bucketId, fileId);
  }
}

export class AdminStorageService {
  protected bucketId: string;

  constructor(bucketId: string) {
    this.bucketId = bucketId;
  }

  protected async getClient() {
    return await createAdminClient();
  }

  async listFiles(queries?: string[]) {
    const client = await this.getClient();
    return await client.storage.listFiles(this.bucketId, queries);
  }

  async createFile(options: CreateFileOptions) {
    const client = await this.getClient();
    return await client.storage.createFile(
      this.bucketId,
      ID.unique(),
      options.file,
      options.permissions
    );
  }

  async getFile(fileId: string) {
    const client = await this.getClient();
    return await client.storage.getFile(this.bucketId, fileId);
  }

  async deleteFile(fileId: string) {
    const client = await this.getClient();
    return await client.storage.deleteFile(this.bucketId, fileId);
  }

  async getFileDownload(fileId: string) {
    const client = await this.getClient();
    return await client.storage.getFileDownload(this.bucketId, fileId);
  }
}
