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
import { editSubmissionSchema } from "@/lib/schemas/form-schemas";

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

export const editSubmissionAction = authAction
  .schema(editSubmissionSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { submissionId, fieldValues } = parsedInput;

      // Get submission
      const submissionModel = new FormSubmissionAdminModel();
      const submission = await submissionModel.findById(submissionId);

      if (!submission) {
        return { error: "Submission not found" };
      }

      // Check authorization - must be admin/owner of the company
      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company || company.$id !== submission.companyId) {
        return { error: "Unauthorized to edit this submission" };
      }

      // Get current values
      const valueModel = new SubmissionValueAdminModel();
      const currentValues = await valueModel.getBySubmissionId(submissionId);

      // Update submission values
      for (const [fieldId, newValue] of Object.entries(fieldValues)) {
        // Find existing value
        const existingValue = currentValues.find((v) => v.fieldId === fieldId);

        if (existingValue) {
          // Update existing value
          const updateData: any = {};

          if (typeof newValue === "string") {
            updateData.valueText = newValue;
          } else if (typeof newValue === "number") {
            updateData.valueNumber = newValue;
          } else if (typeof newValue === "boolean") {
            updateData.valueBoolean = newValue;
          } else if (Array.isArray(newValue)) {
            updateData.valueArray = newValue;
          }

          await valueModel.updateById(existingValue.$id, updateData);
        } else {
          // Create new value if it doesn't exist
          const formModel = new FormAdminModel();
          const form = await formModel.findById(submission.formId);
          const field = form?.fields.find((f) => f.id === fieldId);

          if (field) {
            const newValueData: any = {
              submissionId,
              formId: submission.formId,
              companyId: submission.companyId,
              fieldId,
              fieldLabel: field.label,
              fieldType: field.type,
            };

            if (typeof newValue === "string") {
              newValueData.valueText = newValue;
            } else if (typeof newValue === "number") {
              newValueData.valueNumber = newValue;
            } else if (typeof newValue === "boolean") {
              newValueData.valueBoolean = newValue;
            } else if (Array.isArray(newValue)) {
              newValueData.valueArray = newValue;
            }

            await valueModel.create(newValueData);
          }
        }
      }

      // Update submission metadata
      await submissionModel.updateById(submissionId, {
        lastSavedAt: new Date().toISOString(),
      });

      revalidatePath(`/org/${company.$id}/data-collection`);

      return {
        success: true,
        message: "Submission updated successfully",
      };
    } catch (error) {
      console.error("Edit submission error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to edit submission",
      };
    }
  });
