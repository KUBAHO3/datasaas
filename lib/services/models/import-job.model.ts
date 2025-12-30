import { ImportJob, ImportJobStatus } from "@/lib/types/import-types";
import { AdminDBModel } from "../core/base-db-model";
import { DATABASE_ID, IMPORT_JOBS_TABLE_ID } from "@/lib/env-config";
import { ID, Permission, Role, Query } from "node-appwrite";

/**
 * Import Job Model - Admin version
 * Handles CRUD operations for import jobs
 */
export class ImportJobAdminModel extends AdminDBModel<ImportJob> {
  constructor() {
    super(DATABASE_ID, IMPORT_JOBS_TABLE_ID);
  }

  /**
   * Create new import job
   */
  async create(
    data: Omit<ImportJob, "$id" | "$createdAt" | "$updatedAt">,
    documentId?: string,
    permissions?: string[]
  ): Promise<ImportJob> {
    const result = await super.create(
      data as any,
      documentId || ID.unique(),
      permissions || this.getDefaultPermissions(data.companyId, data.createdBy)
    );
    return result as ImportJob;
  }

  /**
   * Update import job
   */
  async updateById(
    id: string,
    data: Partial<Omit<ImportJob, "$id" | "$createdAt" | "$updatedAt">>
  ): Promise<ImportJob> {
    const result = await super.updateById(id, data as any);
    return result as ImportJob;
  }

  /**
   * Find import job by ID
   */
  async findById(id: string): Promise<ImportJob | null> {
    const result = await super.findById(id);
    return result as ImportJob | null;
  }

  /**
   * List import jobs by company
   */
  async listByCompany(
    companyId: string,
    limit: number = 50
  ): Promise<ImportJob[]> {
    const results = await this.databases.listDocuments(
      this.databaseId,
      this.collectionId,
      [Query.equal("companyId", companyId), Query.limit(limit), Query.orderDesc("$createdAt")]
    );

    return results.documents as unknown as ImportJob[];
  }

  /**
   * List import jobs by form
   */
  async listByForm(formId: string, limit: number = 50): Promise<ImportJob[]> {
    const results = await this.databases.listDocuments(
      this.databaseId,
      this.collectionId,
      [Query.equal("formId", formId), Query.limit(limit), Query.orderDesc("$createdAt")]
    );

    return results.documents as unknown as ImportJob[];
  }

  /**
   * Get active/pending jobs for a company
   */
  async getActiveJobs(companyId: string): Promise<ImportJob[]> {
    const results = await this.databases.listDocuments(
      this.databaseId,
      this.collectionId,
      [
        Query.equal("companyId", companyId),
        Query.equal("status", ["pending", "parsing", "validating", "importing"]),
        Query.orderDesc("$createdAt"),
      ]
    );

    return results.documents as unknown as ImportJob[];
  }

  /**
   * Update job progress
   */
  async updateProgress(
    jobId: string,
    processedRows: number,
    successCount: number,
    errorCount: number
  ): Promise<ImportJob> {
    return this.updateById(jobId, {
      processedRows,
      successCount,
      errorCount,
    });
  }

  /**
   * Mark job as started
   */
  async markAsStarted(jobId: string): Promise<ImportJob> {
    return this.updateById(jobId, {
      status: "importing",
      startedAt: new Date().toISOString(),
    });
  }

  /**
   * Mark job as completed
   */
  async markAsCompleted(
    jobId: string,
    successCount: number,
    errorCount: number
  ): Promise<ImportJob> {
    return this.updateById(jobId, {
      status: "completed",
      successCount,
      errorCount,
      processedRows: successCount + errorCount,
      completedAt: new Date().toISOString(),
    });
  }

  /**
   * Mark job as failed
   */
  async markAsFailed(jobId: string, error: string): Promise<ImportJob> {
    return this.updateById(jobId, {
      status: "failed",
      error,
      completedAt: new Date().toISOString(),
    });
  }

  /**
   * Mark job as cancelled
   */
  async markAsCancelled(jobId: string): Promise<ImportJob> {
    return this.updateById(jobId, {
      status: "cancelled",
      completedAt: new Date().toISOString(),
    });
  }

  /**
   * Delete old completed jobs (cleanup)
   * @param olderThanDays Delete jobs older than X days
   */
  async deleteOldJobs(olderThanDays: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const results = await this.databases.listDocuments(
      this.databaseId,
      this.collectionId,
      [
        Query.equal("status", ["completed", "failed", "cancelled"]),
        Query.lessThan("$createdAt", cutoffDate.toISOString()),
        Query.limit(100),
      ]
    );

    let deletedCount = 0;
    for (const doc of results.documents) {
      try {
        await this.deleteById(doc.$id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete import job ${doc.$id}:`, error);
      }
    }

    return deletedCount;
  }

  /**
   * Get default permissions for import job
   */
  private getDefaultPermissions(companyId: string, createdBy: string): string[] {
    return [
      // Team owners and admins can read
      Permission.read(Role.team(companyId, "owner")),
      Permission.read(Role.team(companyId, "admin")),

      // Creator can read
      Permission.read(Role.user(createdBy)),

      // Team owners and admins can update (for cancellation)
      Permission.update(Role.team(companyId, "owner")),
      Permission.update(Role.team(companyId, "admin")),

      // Team owners can delete
      Permission.delete(Role.team(companyId, "owner")),
    ];
  }
}
