import { AdminStorageModel, SessionStorageModel } from "../core/base-storage-model";
import { DOCUMENTS_BUCKET_ID } from "@/lib/env-config";

/**
 * Company Documents Storage Model
 * Stores company-specific files like imports, exports, documents
 */
export class CompanyDocumentsStorageModel extends AdminStorageModel {
  constructor() {
    super(DOCUMENTS_BUCKET_ID);
  }

  /**
   * Upload import file for a company
   * Files are organized by company ID in the path
   */
  async uploadImportFile(
    file: Blob | File,
    companyId: string,
    fileName: string
  ) {
    // Create file with company-specific permissions
    const permissions = [
      `read("team:${companyId}")`,
      `update("team:${companyId}")`,
      `delete("team:${companyId}")`,
    ];

    const uploadedFile = await this.createFile(file, undefined, permissions);

    return {
      fileId: uploadedFile.$id,
      fileName: fileName,
      companyId,
      bucketId: this.bucketId,
    };
  }

  /**
   * Download import file
   */
  async downloadImportFile(fileId: string) {
    return await this.getFileDownload(fileId);
  }

  /**
   * Delete import file
   */
  async deleteImportFile(fileId: string) {
    return await this.deleteFile(fileId);
  }

  /**
   * Upload export file for a company
   */
  async uploadExportFile(
    file: Blob | File,
    companyId: string,
    fileName: string
  ) {
    const permissions = [
      `read("team:${companyId}")`,
      `update("team:${companyId}")`,
      `delete("team:${companyId}")`,
    ];

    const uploadedFile = await this.createFile(file, undefined, permissions);

    return {
      fileId: uploadedFile.$id,
      fileName: fileName,
      companyId,
      bucketId: this.bucketId,
    };
  }

  /**
   * Upload form attachment
   */
  async uploadFormAttachment(
    file: Blob | File,
    companyId: string,
    fileName: string
  ) {
    const permissions = [
      `read("team:${companyId}")`,
      `update("team:${companyId}")`,
      `delete("team:${companyId}")`,
    ];

    const uploadedFile = await this.createFile(file, undefined, permissions);

    return {
      fileId: uploadedFile.$id,
      fileName: fileName,
      companyId,
      bucketId: this.bucketId,
    };
  }
}

/**
 * Session-based Company Documents Storage
 * For client-side operations with user session
 */
export class CompanyDocumentsSessionStorageModel extends SessionStorageModel {
  constructor() {
    super(DOCUMENTS_BUCKET_ID);
  }
}
