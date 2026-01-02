"use server";

import { authAction } from "@/lib/safe-action";
import {
  bulkDeleteSubmissionsSchema,
  bulkDeleteFormsSchema,
} from "@/lib/schemas/bulk-operations-schemas";
import { SubmissionAdvancedModel } from "../models/submission-advanced.model";
import { SubmissionValueAdminModel } from "../models/submission-value.model";
import { FormAdminModel } from "../models/form.model";
import { CompanyAdminModel } from "../models/company.model";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "../core/appwrite";
import { DATABASE_ID, FORM_SUBMISSIONS_TABLE_ID } from "@/lib/env-config";
import { Query } from "node-appwrite";

export const bulkDeleteSubmissionsAction = authAction
  .inputSchema(bulkDeleteSubmissionsSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { submissionIds } = parsedInput;

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company) {
        return { error: "Company not found" };
      }

      const submissionModel = new SubmissionAdvancedModel();
      const valueModel = new SubmissionValueAdminModel();

      let deletedCount = 0;
      const errors: string[] = [];

      for (const submissionId of submissionIds) {
        try {
          const submission = await submissionModel.findById(submissionId);

          if (!submission) {
            errors.push(`Submission ${submissionId} not found`);
            continue;
          }

          if (submission.companyId !== company.$id) {
            errors.push(`Submission ${submissionId} does not belong to your company`);
            continue;
          }

          await valueModel.deleteBySubmissionId(submissionId);
          await submissionModel.deleteById(submissionId);

          deletedCount++;
        } catch (error) {
          console.error(`Error deleting submission ${submissionId}:`, error);
          errors.push(`Failed to delete submission ${submissionId}`);
        }
      }

      revalidatePath(`/org/${company.$id}/data-collection`);

      return {
        success: true,
        message: `Successfully deleted ${deletedCount} submission(s)`,
        deletedCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error("Bulk delete submissions error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete submissions",
      };
    }
  });

export const bulkDeleteFormsAction = authAction
  .inputSchema(bulkDeleteFormsSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { formIds } = parsedInput;

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company) {
        return { error: "Company not found" };
      }

      const formModel = new FormAdminModel();
      const submissionModel = new SubmissionAdvancedModel();
      const valueModel = new SubmissionValueAdminModel();

      let deletedCount = 0;
      const errors: string[] = [];

      // Delete each form and its submissions
      for (const formId of formIds) {
        try {
          const form = await formModel.findById(formId);

          if (!form) {
            errors.push(`Form ${formId} not found`);
            continue;
          }

          if (form.companyId !== company.$id) {
            errors.push(`Form ${formId} does not belong to your company`);
            continue;
          }

          const client = await createAdminClient();
          const submissionsResult = await client.databases.listDocuments(
            DATABASE_ID,
            FORM_SUBMISSIONS_TABLE_ID,
            [Query.equal("formId", formId), Query.limit(5000)]
          );

          for (const submission of submissionsResult.documents) {
            await valueModel.deleteBySubmissionId(submission.$id);
            await submissionModel.deleteById(submission.$id);
          }

          await formModel.deleteById(formId);

          deletedCount++;
        } catch (error) {
          console.error(`Error deleting form ${formId}:`, error);
          errors.push(`Failed to delete form ${formId}`);
        }
      }

      revalidatePath(`/org/${company.$id}/forms`);

      return {
        success: true,
        message: `Successfully deleted ${deletedCount} form(s) and their submissions`,
        deletedCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error("Bulk delete forms error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to delete forms",
      };
    }
  });
