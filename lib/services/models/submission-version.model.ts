import { BaseModel } from "./base.model";
import { SubmissionVersion } from "@/lib/types/submission-types";
import {
  DATABASE_ID,
  SUBMISSION_VERSIONS_TABLE_ID,
} from "@/lib/env-config";
import { ID, Permission, Role, Query } from "node-appwrite";

export class SubmissionVersionAdminModel extends BaseModel<SubmissionVersion> {
  constructor() {
    super(DATABASE_ID, SUBMISSION_VERSIONS_TABLE_ID);
  }

  async create(data: Omit<SubmissionVersion, keyof import("node-appwrite").Models.Document>): Promise<SubmissionVersion> {
    const now = new Date().toISOString();

    // Create permissions: team can read, admin can manage
    const permissions = [
      Permission.read(Role.team(data.companyId)),
      Permission.update(Role.team(data.companyId, "owner")),
      Permission.update(Role.team(data.companyId, "admin")),
      Permission.delete(Role.team(data.companyId, "owner")),
      Permission.delete(Role.team(data.companyId, "admin")),
    ];

    return await this.databases.createDocument<SubmissionVersion>(
      this.databaseId,
      this.collectionId,
      ID.unique(),
      {
        ...data,
        fieldValues: JSON.stringify(data.fieldValues),
      },
      permissions
    );
  }

  async listBySubmission(submissionId: string, limit: number = 50): Promise<SubmissionVersion[]> {
    const response = await this.databases.listDocuments<SubmissionVersion>(
      this.databaseId,
      this.collectionId,
      [
        Query.equal("submissionId", submissionId),
        Query.orderDesc("version"),
        Query.limit(limit),
      ]
    );

    return response.documents.map((doc) => ({
      ...doc,
      fieldValues: typeof doc.fieldValues === "string"
        ? JSON.parse(doc.fieldValues)
        : doc.fieldValues,
    }));
  }

  async getLatestVersion(submissionId: string): Promise<number> {
    const versions = await this.listBySubmission(submissionId, 1);
    return versions.length > 0 ? versions[0].version : 0;
  }

  async getVersionByNumber(
    submissionId: string,
    version: number
  ): Promise<SubmissionVersion | null> {
    const response = await this.databases.listDocuments<SubmissionVersion>(
      this.databaseId,
      this.collectionId,
      [
        Query.equal("submissionId", submissionId),
        Query.equal("version", version),
        Query.limit(1),
      ]
    );

    if (response.documents.length === 0) return null;

    const doc = response.documents[0];
    return {
      ...doc,
      fieldValues: typeof doc.fieldValues === "string"
        ? JSON.parse(doc.fieldValues)
        : doc.fieldValues,
    };
  }
}

export class SubmissionVersionSessionModel extends BaseModel<SubmissionVersion> {
  constructor() {
    super(DATABASE_ID, SUBMISSION_VERSIONS_TABLE_ID);
  }

  async listBySubmission(submissionId: string, limit: number = 50): Promise<SubmissionVersion[]> {
    const response = await this.databases.listDocuments<SubmissionVersion>(
      this.databaseId,
      this.collectionId,
      [
        Query.equal("submissionId", submissionId),
        Query.orderDesc("version"),
        Query.limit(limit),
      ]
    );

    return response.documents.map((doc) => ({
      ...doc,
      fieldValues: typeof doc.fieldValues === "string"
        ? JSON.parse(doc.fieldValues)
        : doc.fieldValues,
    }));
  }
}
