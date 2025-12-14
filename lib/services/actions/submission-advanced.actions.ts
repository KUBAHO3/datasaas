"use server";

import { authAction } from "@/lib/safe-action";
import { CompanyAdminModel } from "../models/company.model";
import { FormAdminModel } from "../models/form.model";
import { FormSubmissionAdminModel } from "../models/form-submission.model";
import { revalidatePath } from "next/cache";
import { ExportService } from "../export/export.service";
import {
  submissionFilterQuerySchema,
  exportOptionsSchema,
  bulkDeleteSubmissionsSchema,
  bulkUpdateStatusSchema,
} from "@/lib/schemas/submission-filter-schemas";
import { SubmissionAdvancedModel } from "../models/submission-advanced.model";
import { SubmissionValueAdminModel } from "../models/submission-value.model";

export const querySubmissionsAction = authAction
  .schema(submissionFilterQuerySchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company) {
        return { error: "Company not found" };
      }

      const submissionModel = new SubmissionAdvancedModel();
      const result = await submissionModel.querySubmissions(
        company.$id,
        parsedInput
      );

      return {
        success: true,
        rows: result.rows,
        total: result.total,
      };
    } catch (error) {
      console.error("Query submissions error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to query submissions",
      };
    }
  });

/**
 * Export submissions to Excel/CSV/JSON/PDF
 */
export const exportSubmissionsAction = authAction
  .schema(exportOptionsSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { format, formId, filters, includeMetadata, selectedFields } =
        parsedInput;

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company) {
        return { error: "Company not found" };
      }

      // Get form details
      const formModel = new FormAdminModel();
      const form = await formModel.findById(formId);

      if (!form || form.companyId !== company.$id) {
        return { error: "Form not found or unauthorized" };
      }

      // Get submissions with filtering
      const submissionModel = new SubmissionAdvancedModel();
      const query = filters || { formId, limit: 1000 };
      const result = await submissionModel.querySubmissions(company.$id, query);

      // Generate export
      const exportService = new ExportService();
      const exportData = await exportService.exportSubmissions({
        format,
        form,
        rows: result.rows,
        includeMetadata: includeMetadata || false,
        selectedFields,
      });

      return {
        success: true,
        data: exportData.data,
        filename: exportData.filename,
        mimeType: exportData.mimeType,
      };
    } catch (error) {
      console.error("Export submissions error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to export submissions",
      };
    }
  });

export const bulkDeleteSubmissionsAction = authAction
  .schema(bulkDeleteSubmissionsSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { submissionIds } = parsedInput;

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company) {
        return { error: "Company not found" };
      }

      const submissionModel = new FormSubmissionAdminModel();
      const valueModel = new SubmissionValueAdminModel();

      // Verify all submissions belong to company
      for (const id of submissionIds) {
        const submission = await submissionModel.findById(id);
        if (!submission || submission.companyId !== company.$id) {
          return {
            error: `Unauthorized to delete submission: ${id}`,
          };
        }
      }

      // Delete all field values and submissions
      for (const id of submissionIds) {
        await valueModel.deleteBySubmissionId(id);
        await submissionModel.deleteById(id);
      }

      revalidatePath(`/org/${company.$id}/data-collection`);

      return {
        success: true,
        message: `Successfully deleted ${submissionIds.length} submission(s)`,
      };
    } catch (error) {
      console.error("Bulk delete error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete submissions",
      };
    }
  });

/**
 * Bulk update submission status
 */
export const bulkUpdateStatusAction = authAction
  .schema(bulkUpdateStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { submissionIds, status } = parsedInput;

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company) {
        return { error: "Company not found" };
      }

      const submissionModel = new FormSubmissionAdminModel();

      // Verify ownership and update
      for (const id of submissionIds) {
        const submission = await submissionModel.findById(id);
        if (!submission || submission.companyId !== company.$id) {
          return {
            error: `Unauthorized to update submission: ${id}`,
          };
        }

        const updateData: any = { status };
        if (status === "completed" && !submission.submittedAt) {
          updateData.submittedAt = new Date().toISOString();
        }

        await submissionModel.updateById(id, updateData);
      }

      revalidatePath(`/org/${company.$id}/data-collection`);

      return {
        success: true,
        message: `Successfully updated ${submissionIds.length} submission(s)`,
      };
    } catch (error) {
      console.error("Bulk update error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update submissions",
      };
    }
  });

/**
 * Get grouped data for analytics
 */
export const getGroupedDataAction = authAction
  .schema(submissionFilterQuerySchema.pick({ formId: true, groupBy: true }))
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { formId, groupBy } = parsedInput;

      if (!groupBy || !formId) {
        return { error: "Form ID and group by field are required" };
      }

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company) {
        return { error: "Company not found" };
      }

      const submissionModel = new SubmissionAdvancedModel();
      const data = await submissionModel.getGroupedData(
        company.$id,
        formId,
        groupBy.fieldId
      );

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Get grouped data error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to get grouped data",
      };
    }
  });
