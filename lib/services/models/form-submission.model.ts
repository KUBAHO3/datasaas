import { FormSubmission } from "@/lib/types/form-types";
import { AdminDBModel, SessionDBModel } from "../core/base-db-model";
import { DATABASE_ID, FORM_SUBMISSIONS_TABLE_ID } from "@/lib/env-config";
import { SubmissionHelpers } from "@/lib/utils/forms-utils";
import { ID } from "node-appwrite";

export class FormSubmissionSessionModel extends SessionDBModel<FormSubmission> {
  constructor() {
    super(DATABASE_ID, FORM_SUBMISSIONS_TABLE_ID);
  }

  async create(data: Partial<FormSubmission>): Promise<FormSubmission> {
    const dbData = SubmissionHelpers.toDB(data);
    const result = await super.create(dbData, ID.unique());
    return SubmissionHelpers.fromDB(result);
  }

  async updateById(
    id: string,
    data: Partial<FormSubmission>
  ): Promise<FormSubmission> {
    const dbData = SubmissionHelpers.toDB(data);
    const result = await super.updateById(id, dbData);
    return SubmissionHelpers.fromDB(result);
  }

  async findById(id: string): Promise<FormSubmission | null> {
    const result = await super.findById(id);
    return result ? SubmissionHelpers.fromDB(result) : null;
  }

  async findMany(options: any): Promise<FormSubmission[]> {
    const results = await super.findMany(options);
    return results.map(SubmissionHelpers.fromDB);
  }

  async listByForm(
    formId: string,
    status?: "draft" | "completed"
  ): Promise<FormSubmission[]> {
    const where: any[] = [
      { field: "formId", operator: "equals", value: formId },
    ];

    if (status) {
      where.push({ field: "status", operator: "equals", value: status });
    }

    return this.findMany({
      where,
      orderBy: [{ field: "submittedAt", direction: "desc" }],
    });
  }
}

export class FormSubmissionAdminModel extends AdminDBModel<FormSubmission> {
  constructor() {
    super(DATABASE_ID, FORM_SUBMISSIONS_TABLE_ID);
  }

  async create(data: Partial<FormSubmission>): Promise<FormSubmission> {
    const dbData = SubmissionHelpers.toDB(data);
    const result = await super.create(dbData, ID.unique());
    return SubmissionHelpers.fromDB(result);
  }

  async updateById(
    id: string,
    data: Partial<FormSubmission>
  ): Promise<FormSubmission> {
    const dbData = SubmissionHelpers.toDB(data);
    const result = await super.updateById(id, dbData);
    return SubmissionHelpers.fromDB(result);
  }

  async findById(id: string): Promise<FormSubmission | null> {
    const result = await super.findById(id);
    return result ? SubmissionHelpers.fromDB(result) : null;
  }

  async findMany(options: any): Promise<FormSubmission[]> {
    const results = await super.findMany(options);
    return results.map(SubmissionHelpers.fromDB);
  }

  async listByForm(
    formId: string,
    status?: "draft" | "completed"
  ): Promise<FormSubmission[]> {
    const where: any[] = [
      { field: "formId", operator: "equals", value: formId },
    ];

    if (status) {
      where.push({ field: "status", operator: "equals", value: status });
    }

    return this.findMany({
      where,
      orderBy: [{ field: "submittedAt", direction: "desc" }],
    });
  }

  async listByCompany(
    companyId: string,
    limit?: number
  ): Promise<FormSubmission[]> {
    return this.findMany({
      where: [{ field: "companyId", operator: "equals", value: companyId }],
      orderBy: [{ field: "submittedAt", direction: "desc" }],
      limit: limit || 50,
    });
  }

  async countByForm(
    formId: string,
    status?: "draft" | "completed"
  ): Promise<number> {
    const submissions = await this.listByForm(formId, status);
    return submissions.length;
  }

  async getFormStats(formId: string) {
    const submissions = await this.listByForm(formId);
    const completed = submissions.filter((s) => s.status === "completed");
    const drafts = submissions.filter((s) => s.status === "draft");

    return {
      totalSubmissions: submissions.length,
      completedSubmissions: completed.length,
      draftSubmissions: drafts.length,
      lastSubmissionAt: completed[0]?.submittedAt,
    };
  }
}
