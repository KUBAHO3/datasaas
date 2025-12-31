"use server";

import { authAction } from "@/lib/safe-action";
import {
  parseFileInputSchema,
  validateImportInputSchema,
  importOptionsSchema,
  getImportProgressInputSchema,
  cancelImportInputSchema,
} from "@/lib/schemas/import-schemas";
import { FormAdminModel } from "../models/form.model";
import { ImportJobAdminModel } from "../models/import-job.model";
import { FormSubmissionAdminModel } from "../models/form-submission.model";
import { SubmissionValueAdminModel } from "../models/submission-value.model";
import { ImportParserService } from "../import/import-parser.service";
import { ImportValidatorService } from "../import/import-validator.service";
import { ImportService } from "../import/import.service";
import { SubmissionValueHelpers } from "@/lib/utils/submission-utils";
import { canAcceptSubmissions } from "@/lib/utils/form-validation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "../core/appwrite";
import { IMPORT_TEMP_BUCKET_ID } from "@/lib/env-config";
import { ID } from "node-appwrite";
import type { RowError, ErrorReportRow } from "@/lib/types/import-types";

/**
 * Upload import file to Appwrite Storage
 * Step 1: Upload file and return fileId for subsequent operations
 */
export const uploadImportFileAction = authAction
  .inputSchema(parseFileInputSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { formId } = parsedInput;

      // Verify user has access to this form
      const formModel = new FormAdminModel();
      const form = await formModel.findById(formId);

      if (!form) {
        return { error: "Form not found" };
      }

      if (form.companyId !== ctx.user.companyId) {
        return { error: "Unauthorized access to this form" };
      }

      return {
        success: true,
        message: "Upload file using storage API directly",
      };
    } catch (error) {
      console.error("Upload import file error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload import file",
      };
    }
  });

/**
 * Parse uploaded import file and return columns + preview
 * Step 2: Parse file, detect columns, auto-map to fields
 */
export const parseImportFileAction = authAction
  .inputSchema(parseFileInputSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { formId, fileId } = parsedInput;

      // Verify user has access to this form
      const formModel = new FormAdminModel();
      const form = await formModel.findById(formId);

      if (!form) {
        return { error: "Form not found" };
      }

      if (form.companyId !== ctx.user.companyId) {
        return { error: "Unauthorized access to this form" };
      }

      // Download file from Appwrite Storage
      const adminClient = await createAdminClient();
      const fileBuffer = await adminClient.storage.getFileDownload(
        IMPORT_TEMP_BUCKET_ID,
        fileId
      );

      // Parse file
      const parsedData = await ImportParserService.parseFile(
        Buffer.from(await fileBuffer.arrayBuffer()),
        "import.xlsx"
      );

      // Parse form fields if needed
      const parsedForm = {
        ...form,
        fields:
          typeof form.fields === "string"
            ? JSON.parse(form.fields)
            : form.fields,
      };

      // Auto-map columns to form fields
      const autoMappingResult = ImportService.autoMapColumns(
        parsedData.columns,
        parsedForm.fields
      );

      return {
        success: true,
        data: {
          columns: parsedData.columns,
          rowCount: parsedData.rowCount,
          preview: parsedData.preview,
          autoMapping: autoMappingResult.mapping,
          suggestions: autoMappingResult.suggestions,
          unmappedColumns: autoMappingResult.unmappedColumns,
          unmappedFields: autoMappingResult.unmappedFields,
        },
      };
    } catch (error) {
      console.error("Parse import file error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to parse import file",
      };
    }
  });

/**
 * Validate import data before actual import
 * Step 3: Quick validation of all rows
 */
export const validateImportDataAction = authAction
  .inputSchema(validateImportInputSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { formId, fileId, columnMapping } = parsedInput;

      // Verify user has access to this form
      const formModel = new FormAdminModel();
      const form = await formModel.findById(formId);

      if (!form) {
        return { error: "Form not found" };
      }

      if (form.companyId !== ctx.user.companyId) {
        return { error: "Unauthorized access to this form" };
      }

      // Validate column mapping
      const parsedForm = {
        ...form,
        fields:
          typeof form.fields === "string"
            ? JSON.parse(form.fields)
            : form.fields,
      };

      const mappingValidation = ImportService.validateMapping(
        columnMapping,
        parsedForm
      );

      if (!mappingValidation.isValid) {
        return {
          error: `Invalid column mapping: ${mappingValidation.errors.join(", ")}`,
        };
      }

      // Download and parse file
      const adminClient = await createAdminClient();
      const fileBuffer = await adminClient.storage.getFileDownload(
        IMPORT_TEMP_BUCKET_ID,
        fileId
      );

      const parsedData = await ImportParserService.parseFile(
        Buffer.from(await fileBuffer.arrayBuffer()),
        "import.xlsx"
      );

      // Quick validation
      const validationResults = await ImportValidatorService.quickValidation(
        parsedData.rows,
        parsedForm,
        columnMapping
      );

      return {
        success: true,
        data: validationResults,
      };
    } catch (error) {
      console.error("Validate import data error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to validate import data",
      };
    }
  });

/**
 * Execute import - create submissions from validated data
 * Step 4: Import valid rows in batches
 */
export const executeImportAction = authAction
  .inputSchema(importOptionsSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { formId, fileId, columnMapping, skipEmptyRows } = parsedInput;

      // Verify user has access to this form
      const formModel = new FormAdminModel();
      const form = await formModel.findById(formId);

      if (!form) {
        return { error: "Form not found" };
      }

      if (form.companyId !== ctx.user.companyId) {
        return { error: "Unauthorized access to this form" };
      }

      // Parse form data
      const parsedForm = {
        ...form,
        fields:
          typeof form.fields === "string"
            ? JSON.parse(form.fields)
            : form.fields,
        settings:
          typeof form.settings === "string"
            ? JSON.parse(form.settings)
            : form.settings,
        accessControl:
          typeof form.accessControl === "string"
            ? JSON.parse(form.accessControl)
            : form.accessControl,
      };

      // Check if form can accept submissions
      const submissionModel = new FormSubmissionAdminModel();
      const currentStats = await submissionModel.getFormStats(formId);
      const validationResult = canAcceptSubmissions(
        parsedForm,
        currentStats.totalSubmissions
      );

      if (!validationResult.canAccept) {
        return {
          error:
            validationResult.reason || "Form cannot accept submissions at this time",
        };
      }

      // Download and parse file
      const adminClient = await createAdminClient();
      const fileBuffer = await adminClient.storage.getFileDownload(
        IMPORT_TEMP_BUCKET_ID,
        fileId
      );

      const parsedData = await ImportParserService.parseFile(
        Buffer.from(await fileBuffer.arrayBuffer()),
        "import.xlsx"
      );

      // Create import job for tracking
      const importJobModel = new ImportJobAdminModel();
      const importJob = await importJobModel.create({
        companyId: ctx.user.companyId!,
        formId,
        fileId,
        fileName: "import.xlsx",
        fileSize: 0,
        status: "importing",
        totalRows: parsedData.rowCount,
        processedRows: 0,
        successCount: 0,
        errorCount: 0,
        createdBy: ctx.userId,
        startedAt: new Date().toISOString(),
      });

      const valueModel = new SubmissionValueAdminModel();
      const errors: RowError[] = [];
      let importedCount = 0;

      // Import rows in batches
      const batches = ImportService.chunkArray(parsedData.rows, 100);

      for (const batch of batches) {
        for (let i = 0; i < batch.length; i++) {
          const row = batch[i];
          const rowIndex = parsedData.rows.indexOf(row);
          const rowNumber = rowIndex + 1;

          try {
            // Transform row data to submission format
            const submissionData: Record<string, any> = {};
            const fieldValues: any[] = [];

            for (const [csvColumn, fieldId] of Object.entries(columnMapping)) {
              const field = parsedForm.fields.find((f: any) => f.id === fieldId);
              if (!field) continue;

              const rawValue = row[csvColumn];

              // Skip empty values for non-required fields
              if (
                (rawValue === null ||
                  rawValue === undefined ||
                  rawValue === "") &&
                !field.required
              ) {
                continue;
              }

              // Transform value
              const transformResult = ImportValidatorService.transformValue(
                field,
                rawValue
              );

              if (!transformResult.success) {
                errors.push({
                  row: rowNumber,
                  field: field.label,
                  fieldId: field.id,
                  value: rawValue,
                  error: transformResult.error || "Transformation failed",
                });
                throw new Error("Validation failed");
              }

              submissionData[field.id] = transformResult.value;
            }

            // Create submission
            const submission = await submissionModel.create({
              formId,
              formVersion: parsedForm.version || 1,
              companyId: ctx.user.companyId!,
              data: submissionData,
              status: "completed",
              submittedBy: ctx.userId,
              submittedByEmail: ctx.user.email,
              isAnonymous: false,
              startedAt: new Date().toISOString(),
              lastSavedAt: new Date().toISOString(),
              submittedAt: new Date().toISOString(),
            });

            // Create submission values
            for (const [csvColumn, fieldId] of Object.entries(columnMapping)) {
              const field = parsedForm.fields.find((f: any) => f.id === fieldId);
              if (!field || !submissionData[fieldId]) continue;

              const value = SubmissionValueHelpers.fromFieldValue(
                submission.$id,
                formId,
                ctx.user.companyId!,
                field,
                submissionData[fieldId]
              );

              if (value) {
                fieldValues.push(value);
              }
            }

            // Bulk create values
            if (fieldValues.length > 0) {
              await valueModel.bulkCreate(fieldValues);
            }

            importedCount++;
          } catch (error) {
            // Row failed, continue with next
            console.error(`Failed to import row ${rowNumber}:`, error);
          }
        }

        // Update progress
        await importJobModel.updateProgress(
          importJob.$id,
          importedCount + errors.length,
          importedCount,
          errors.length
        );
      }

      // Mark job as completed
      await importJobModel.markAsCompleted(
        importJob.$id,
        importedCount,
        errors.length
      );

      // Update form metadata
      const updatedStats = await submissionModel.getFormStats(formId);
      await formModel.updateById(formId, {
        responseCount: updatedStats.totalSubmissions,
        lastSubmittedAt: new Date().toISOString(),
      } as any);

      // Generate error report if there are errors
      let errorReportData: string | undefined;
      let errorReportFilename: string | undefined;

      if (errors.length > 0) {
        const errorReportRows: ErrorReportRow[] = errors.map((err) => ({
          rowNumber: err.row,
          fieldName: err.field,
          fieldType:
            parsedForm.fields.find((f: any) => f.id === err.fieldId)?.type ||
            "unknown",
          value: ImportService.formatValueForDisplay(err.value),
          errorMessage: err.error,
          suggestion: err.suggestion || "",
        }));

        const errorCsv = ImportService.generateErrorReport(errorReportRows);
        errorReportData = ImportService.encodeErrorReport(errorCsv);
        errorReportFilename = ImportService.generateErrorReportFilename(
          parsedForm.name
        );
      }

      // Revalidate paths
      revalidatePath(`/org/${ctx.user.companyId}/data-collection`);
      revalidatePath(`/org/${ctx.user.companyId}/forms/${formId}`);

      return {
        success: true,
        data: {
          jobId: importJob.$id,
          imported: importedCount,
          failed: errors.length,
          errors: errors.slice(0, 100), // Return first 100 errors
          errorReportData,
          errorReportFilename,
          message: `Successfully imported ${importedCount} of ${parsedData.rowCount} rows`,
        },
      };
    } catch (error) {
      console.error("Execute import error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to execute import",
      };
    }
  });

/**
 * Get import job progress
 * For polling during import
 */
export const getImportProgressAction = authAction
  .inputSchema(getImportProgressInputSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { jobId } = parsedInput;

      const importJobModel = new ImportJobAdminModel();
      const job = await importJobModel.findById(jobId);

      if (!job) {
        return { error: "Import job not found" };
      }

      if (job.companyId !== ctx.user.companyId) {
        return { error: "Unauthorized access to this import job" };
      }

      const percentage =
        job.totalRows > 0
          ? Math.round((job.processedRows / job.totalRows) * 100)
          : 0;

      return {
        success: true,
        data: {
          jobId: job.$id,
          status: job.status,
          totalRows: job.totalRows,
          processedRows: job.processedRows,
          successCount: job.successCount,
          errorCount: job.errorCount,
          percentage,
        },
      };
    } catch (error) {
      console.error("Get import progress error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get import progress",
      };
    }
  });

/**
 * Cancel import job
 */
export const cancelImportAction = authAction
  .inputSchema(cancelImportInputSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { jobId } = parsedInput;

      const importJobModel = new ImportJobAdminModel();
      const job = await importJobModel.findById(jobId);

      if (!job) {
        return { error: "Import job not found" };
      }

      if (job.companyId !== ctx.user.companyId) {
        return { error: "Unauthorized access to this import job" };
      }

      // Can only cancel pending/in-progress jobs
      if (
        !["pending", "parsing", "validating", "importing"].includes(job.status)
      ) {
        return { error: "Import job cannot be cancelled in current state" };
      }

      await importJobModel.markAsCancelled(jobId);

      return {
        success: true,
        message: "Import job cancelled successfully",
      };
    } catch (error) {
      console.error("Cancel import error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to cancel import",
      };
    }
  });
