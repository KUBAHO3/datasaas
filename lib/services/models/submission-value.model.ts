import "server-only";

import { SubmissionValue } from "@/lib/types/submission-types";
import { AdminDBModel, SessionDBModel } from "../core/base-db-model";
import { DATABASE_ID, SUBMISSION_VALUES_TABLE_ID } from "@/lib/env-config";
import { SubmissionValueHelpers } from "@/lib/utils/submission-utils";
import { ID, Query, Permission, Role } from "node-appwrite";

export class SubmissionValueSessionModel extends SessionDBModel<SubmissionValue> {
  constructor() {
    super(DATABASE_ID, SUBMISSION_VALUES_TABLE_ID);
  }

  async create(data: Partial<SubmissionValue>): Promise<SubmissionValue> {
    const dbData = SubmissionValueHelpers.toDB(data);
    const result = await super.create(dbData, ID.unique());
    return SubmissionValueHelpers.fromDB(result);
  }

  async updateById(
    id: string,
    data: Partial<SubmissionValue>
  ): Promise<SubmissionValue> {
    const dbData = SubmissionValueHelpers.toDB(data);
    const result = await super.updateById(id, dbData);
    return SubmissionValueHelpers.fromDB(result);
  }

  async findById(id: string): Promise<SubmissionValue | null> {
    const result = await super.findById(id);
    return result ? SubmissionValueHelpers.fromDB(result) : null;
  }

  async findMany(options: any): Promise<SubmissionValue[]> {
    const results = await super.findMany(options);
    return results.map(SubmissionValueHelpers.fromDB);
  }

  async getBySubmissionId(submissionId: string): Promise<SubmissionValue[]> {
    return this.findMany({
      where: [
        { field: "submissionId", operator: "equals", value: submissionId },
      ],
      orderBy: [{ field: "fieldId", direction: "asc" }],
    });
  }

  async getFieldValue(
    submissionId: string,
    fieldId: string
  ): Promise<SubmissionValue | null> {
    return this.findOne({
      where: [
        { field: "submissionId", operator: "equals", value: submissionId },
        { field: "fieldId", operator: "equals", value: fieldId },
      ],
    });
  }
}

export class SubmissionValueAdminModel extends AdminDBModel<SubmissionValue> {
  constructor() {
    super(DATABASE_ID, SUBMISSION_VALUES_TABLE_ID);
  }

  async create(data: Partial<SubmissionValue>): Promise<SubmissionValue> {
    const dbData = SubmissionValueHelpers.toDB(data);

    const permissions: string[] = [
      Permission.read(Role.team(data.companyId!)),
      Permission.update(Role.team(data.companyId!, "owner")),
      Permission.update(Role.team(data.companyId!, "admin")),
      Permission.delete(Role.team(data.companyId!, "owner")),
      Permission.delete(Role.team(data.companyId!, "admin")),
    ];
    

    const result = await super.create(dbData, ID.unique(), permissions);
    return SubmissionValueHelpers.fromDB(result);
  }

  async updateById(
    id: string,
    data: Partial<SubmissionValue>
  ): Promise<SubmissionValue> {
    const dbData = SubmissionValueHelpers.toDB(data);
    const result = await super.updateById(id, dbData);
    return SubmissionValueHelpers.fromDB(result);
  }

  async findById(id: string): Promise<SubmissionValue | null> {
    const result = await super.findById(id);
    return result ? SubmissionValueHelpers.fromDB(result) : null;
  }

  async findMany(options: any): Promise<SubmissionValue[]> {
    const results = await super.findMany(options);
    return results.map(SubmissionValueHelpers.fromDB);
  }

  /**
   * Get all values for a submission
   */
  async getBySubmissionId(submissionId: string): Promise<SubmissionValue[]> {
    const client = await this.getClient();
    const result = await client.databases.listDocuments(
      this.databaseId,
      this.collectionId,
      [Query.equal("submissionId", submissionId), Query.limit(100)]
    );

    return result.documents.map(SubmissionValueHelpers.fromDB);
  }

  /**
   * Bulk create values for a submission
   */
  async bulkCreate(
    values: Partial<SubmissionValue>[]
  ): Promise<SubmissionValue[]> {
    const promises = values.map((value) => this.create(value));
    return Promise.all(promises);
  }

  /**
   * Delete all values for a submission
   */
  async deleteBySubmissionId(submissionId: string): Promise<void> {
    const values = await this.getBySubmissionId(submissionId);
    await Promise.all(values.map((value) => this.deleteById(value.$id)));
  }

  /**
   * Query values with filters (for advanced filtering)
   */
  async queryValues(queries: string[]): Promise<SubmissionValue[]> {
    const client = await this.getClient();
    const result = await client.databases.listDocuments(
      this.databaseId,
      this.collectionId,
      queries
    );

    return result.documents.map(SubmissionValueHelpers.fromDB);
  }
}
