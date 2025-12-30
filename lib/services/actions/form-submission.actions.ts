"use server";

import { authAction, action } from "@/lib/safe-action";
import {
  createSubmissionSchema,
  getSubmissionSchema,
  listSubmissionsSchema,
  updateSubmissionSchema,
} from "@/lib/schemas/form-schemas";
import { FormAdminModel } from "../models/form.model";
import {
  FormSubmissionAdminModel,
  FormSubmissionSessionModel,
} from "../models/form-submission.model";
import { SubmissionValueAdminModel } from "../models/submission-value.model";
import { SubmissionValueHelpers } from "@/lib/utils/submission-utils";
import { revalidatePath } from "next/cache";
import { CompanyAdminModel } from "../models/company.model";
import { canAcceptSubmissions } from "@/lib/utils/form-validation";

export const createSubmissionAction = authAction
  .inputSchema(createSubmissionSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { formId, data, status, submittedByEmail, isAnonymous } =
        parsedInput;

      const formModel = new FormAdminModel();
      const form = await formModel.findById(formId);

      if (!form) {
        return { error: "Form not found" };
      }

      // Parse form data if needed
      const parsedForm = {
        ...form,
        settings: typeof form.settings === "string" ? JSON.parse(form.settings) : form.settings,
        accessControl: typeof form.accessControl === "string" ? JSON.parse(form.accessControl) : form.accessControl,
      };

      // Check if form can accept submissions (status, expiry, max submissions)
      const submissionModel = new FormSubmissionAdminModel();
      const currentStats = await submissionModel.getFormStats(formId);
      const validationResult = canAcceptSubmissions(parsedForm, currentStats.totalSubmissions);

      if (!validationResult.canAccept) {
        return { error: validationResult.reason || "Form cannot accept submissions" };
      }

      const submission = await submissionModel.create({
        formId,
        formVersion: form.version || 1, // Default to version 1 if not set
        companyId: form.companyId,
        data,
        status,
        submittedBy: isAnonymous ? undefined : ctx.userId,
        submittedByEmail,
        isAnonymous,
        startedAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
        submittedAt:
          status === "completed" ? new Date().toISOString() : undefined,
      });

      // Create individual submission values for each field
      const valueModel = new SubmissionValueAdminModel();
      const submissionValues = form.fields
        .map((field) => {
          const value = data[field.id];
          // Only create values for fields that have data
          if (value !== undefined && value !== null && value !== '') {
            return SubmissionValueHelpers.fromFieldValue(
              submission.$id,
              formId,
              form.companyId,
              field,
              value
            );
          }
          return null;
        })
        .filter((v) => v !== null);

      if (submissionValues.length > 0) {
        await valueModel.bulkCreate(submissionValues as any);
      }

      const stats = await submissionModel.getFormStats(formId);
      // Parse metadata if it's a string, or use as object
      const currentMetadata =
        typeof form.metadata === "string"
          ? JSON.parse(form.metadata)
          : form.metadata || {};

      await formModel.updateById(formId, {
        metadata: {
          ...currentMetadata,
          responseCount: stats.totalSubmissions,
          lastSubmittedAt: stats.lastSubmissionAt,
        },
      });

      revalidatePath(`/org/${form.companyId}/data-collection`);
      revalidatePath(`/org/${form.companyId}/forms/${formId}`);

      return {
        success: true,
        submissionId: submission.$id,
        submission,
      };
    } catch (error) {
      console.error("Create submission error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create submission",
      };
    }
  });

// Public submission action - no authentication required for public forms
export const createPublicSubmissionAction = action
  .inputSchema(createSubmissionSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { formId, data, status, submittedByEmail, isAnonymous } =
        parsedInput;

      const formModel = new FormAdminModel();
      const form = await formModel.findById(formId);

      if (!form) {
        return { error: "Form not found" };
      }

      // Check if form allows public/anonymous submissions
      const settings =
        typeof form.settings === "string"
          ? JSON.parse(form.settings)
          : form.settings || {};
      const accessControl =
        typeof form.accessControl === "string"
          ? JSON.parse(form.accessControl)
          : form.accessControl || {};

      const parsedForm = {
        ...form,
        settings,
        accessControl,
      };

      const isPublicForm =
        settings.isPublic ||
        settings.allowAnonymous ||
        accessControl.isPublic ||
        accessControl.visibility === "public";

      if (!isPublicForm) {
        return {
          error:
            "This form requires authentication. Please sign in to submit.",
        };
      }

      // Check if form can accept submissions (status, expiry, max submissions)
      const submissionModel = new FormSubmissionAdminModel();
      const currentStats = await submissionModel.getFormStats(formId);
      const validationResult = canAcceptSubmissions(parsedForm, currentStats.totalSubmissions);

      if (!validationResult.canAccept) {
        return { error: validationResult.reason || "Form cannot accept submissions" };
      }
      const submission = await submissionModel.create({
        formId,
        formVersion: form.version || 1, // Default to version 1 if not set
        companyId: form.companyId,
        data,
        status,
        submittedBy: undefined, // No user ID for public submissions
        submittedByEmail,
        isAnonymous: true, // Always anonymous for public forms
        startedAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
        submittedAt:
          status === "completed" ? new Date().toISOString() : undefined,
      });

      // Create individual submission values for each field
      const valueModel = new SubmissionValueAdminModel();
      const submissionValues = form.fields
        .map((field) => {
          const value = data[field.id];
          // Only create values for fields that have data
          if (value !== undefined && value !== null && value !== '') {
            return SubmissionValueHelpers.fromFieldValue(
              submission.$id,
              formId,
              form.companyId,
              field,
              value
            );
          }
          return null;
        })
        .filter((v) => v !== null);

      if (submissionValues.length > 0) {
        await valueModel.bulkCreate(submissionValues as any);
      }

      const stats = await submissionModel.getFormStats(formId);
      // Parse metadata if it's a string, or use as object
      const currentMetadata =
        typeof form.metadata === "string"
          ? JSON.parse(form.metadata)
          : form.metadata || {};

      await formModel.updateById(formId, {
        metadata: {
          ...currentMetadata,
          responseCount: stats.totalSubmissions,
          lastSubmittedAt: stats.lastSubmissionAt,
        },
      });

      revalidatePath(`/org/${form.companyId}/data-collection`);
      revalidatePath(`/org/${form.companyId}/forms/${formId}`);

      return {
        success: true,
        submissionId: submission.$id,
        submission,
      };
    } catch (error) {
      console.error("Create public submission error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create submission",
      };
    }
  });

export const updateSubmissionAction = authAction
  .inputSchema(updateSubmissionSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { submissionId, data, status } = parsedInput;

      const submissionModel = new FormSubmissionAdminModel();
      const existingSubmission = await submissionModel.findById(submissionId);

      if (!existingSubmission) {
        return { error: "Submission not found" };
      }

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company || company.$id !== existingSubmission.companyId) {
        if (existingSubmission.submittedBy !== ctx.userId) {
          return { error: "Unauthorized to update this submission" };
        }
      }

      const updateData: any = {
        lastSavedAt: new Date().toISOString(),
      };

      if (data) updateData.data = { ...existingSubmission.data, ...data };
      if (status) {
        updateData.status = status;
        if (status === "completed" && !existingSubmission.submittedAt) {
          updateData.submittedAt = new Date().toISOString();
        }
      }

      const updatedSubmission = await submissionModel.updateById(
        submissionId,
        updateData
      );

      // Update submission values if data is provided
      if (data) {
        const formModel = new FormAdminModel();
        const form = await formModel.findById(existingSubmission.formId);

        if (form) {
          const valueModel = new SubmissionValueAdminModel();

          // Update or create values for each changed field
          for (const [fieldId, value] of Object.entries(data)) {
            const field = form.fields.find((f) => f.id === fieldId);
            if (!field) continue;

            // Check if value already exists
            const existingValue = await valueModel.findOne({
              where: [
                {
                  field: "submissionId",
                  operator: "equals",
                  value: submissionId,
                },
                { field: "fieldId", operator: "equals", value: fieldId },
              ],
            });

            const valueData = SubmissionValueHelpers.fromFieldValue(
              submissionId,
              existingSubmission.formId,
              existingSubmission.companyId,
              field,
              value
            );

            if (existingValue) {
              // Update existing value
              await valueModel.updateById(existingValue.$id, valueData);
            } else {
              // Create new value
              await valueModel.create(valueData);
            }
          }
        }
      }

      revalidatePath(`/org/${existingSubmission.companyId}/data-collection`);

      return {
        success: true,
        submission: updatedSubmission,
      };
    } catch (error) {
      console.error("Update submission error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update submission",
      };
    }
  });

export const getSubmissionByIdAction = authAction
  .inputSchema(getSubmissionSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { submissionId } = parsedInput;

      const submissionModel = new FormSubmissionSessionModel();
      const submission = await submissionModel.findById(submissionId);

      if (!submission) {
        return { error: "Submission not found" };
      }

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company || company.$id !== submission.companyId) {
        if (submission.submittedBy !== ctx.userId) {
          return { error: "Unauthorized to view this submission" };
        }
      }

      return {
        success: true,
        submission,
      };
    } catch (error) {
      console.error("Get submission error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to get submission",
      };
    }
  });

export const listSubmissionsAction = authAction
  .schema(listSubmissionsSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { formId, status, limit } = parsedInput;

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company) {
        return { error: "Company not found" };
      }

      const submissionModel = new FormSubmissionSessionModel();

      let submissions;
      if (formId) {
        submissions = await submissionModel.listByForm(formId, status);
      } else {
        submissions = await submissionModel.findMany({
          where: [
            { field: "companyId", operator: "equals", value: company.$id },
            ...(status
              ? [{ field: "status", operator: "equals", value: status }]
              : []),
          ],
          orderBy: [{ field: "submittedAt", direction: "desc" }],
          limit: limit || 50,
        });
      }

      return {
        success: true,
        submissions,
        total: submissions.length,
      };
    } catch (error) {
      console.error("List submissions error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to list submissions",
      };
    }
  });

export const deleteSubmissionAction = authAction
  .schema(getSubmissionSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { submissionId } = parsedInput;

      const submissionModel = new FormSubmissionAdminModel();
      const submission = await submissionModel.findById(submissionId);

      if (!submission) {
        return { error: "Submission not found" };
      }

      const companyModel = new CompanyAdminModel();
      const company = await companyModel.findByUserId(ctx.userId);

      if (!company || company.$id !== submission.companyId) {
        return { error: "Unauthorized to delete this submission" };
      }

      await submissionModel.deleteById(submissionId);

      revalidatePath(`/org/${company.$id}/data-collection`);

      return {
        success: true,
        message: "Submission deleted successfully!",
      };
    } catch (error) {
      console.error("Delete submission error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete submission",
      };
    }
  });
