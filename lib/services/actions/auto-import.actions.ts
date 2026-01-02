"use server";

import { ID, Permission, Role } from "node-appwrite";
import { authAction } from "@/lib/safe-action";
import {
  analyzeImportFileSchema,
  createFormFromImportSchema,
} from "@/lib/schemas/auto-import-schemas";
import { CompanyDocumentsStorageModel } from "../models/storage.model";
import { ImportParserService } from "../import/import-parser.service";
import { FieldDetectorService } from "../import/field-detector.service";
import { FormAdminModel } from "../models/form.model";
import { FormSubmissionAdminModel } from "../models/form-submission.model";
import { SubmissionValueAdminModel } from "../models/submission-value.model";
import { ImportService } from "../import/import.service";
import { SubmissionValueHelpers } from "@/lib/utils/submission-utils";
import { revalidatePath } from "next/cache";

/**
 * Step 1: Analyze uploaded file and detect field types
 */
export const analyzeImportFileAction = authAction
  .inputSchema(analyzeImportFileSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { fileId, fileName, companyId } = parsedInput;

      // Download file from storage
      const storageModel = new CompanyDocumentsStorageModel();
      const fileBuffer = await storageModel.downloadImportFile(fileId);

      // Parse file (fileBuffer is already an ArrayBuffer)
      // Note: parseFile throws on error, no need to check success
      const parsedData = await ImportParserService.parseFile(
        Buffer.from(fileBuffer),
        fileName
      );

      // Detect field types
      const detection = FieldDetectorService.detectFields(
        parsedData.columns,
        parsedData.rows
      );

      // Suggest form name
      const suggestedFormName = FieldDetectorService.suggestFormName(
        fileName,
        parsedData.columns
      );

      return {
        success: true,
        data: {
          columns: parsedData.columns,
          rowCount: parsedData.rowCount,
          preview: parsedData.preview,
          detectedFields: detection.fields,
          warnings: detection.warnings,
          suggestedFormName,
        },
      };
    } catch (error) {
      console.error("Analyze import file error:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to analyze file",
      };
    }
  });

/**
 * Step 2: Create form from detected fields and import data
 */
export const createFormFromImportAction = authAction
  .inputSchema(createFormFromImportSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      console.log("=== CREATE FORM FROM IMPORT ACTION START ===");
      console.log("Parsed input:", JSON.stringify(parsedInput, null, 2));

      const {
        fileId,
        formName,
        formDescription,
        fields,
        columnMapping,
        importData,
        companyId,
      } = parsedInput;

      console.log("Extracted values:");
      console.log("- fileId:", fileId);
      console.log("- formName:", formName);
      console.log("- fields count:", fields.length);
      console.log("- importData:", importData);
      console.log("- columnMapping:", columnMapping);

      // Create form
      const formModel = new FormAdminModel();

      // Build form fields from detected fields
      // Using 'as any' for type flexibility with dynamic field creation
      const formFields = fields.map((field, index) => {
        // Map schema types to FormField types
        let mappedType: any = field.type;
        if (field.type === "text") mappedType = "short_text";
        if (field.type === "textarea") mappedType = "long_text";

        const baseField: any = {
          id: ID.unique(),
          name: field.name, // Keep name for column mapping
          type: mappedType,
          label: field.label,
          description: field.helpText || "",
          placeholder: field.placeholder || "",
          required: field.required,
          validation: [],
          layout: {
            width: "full" as const,
          },
          order: index,
        };

        // Add type-specific properties
        if (["dropdown", "radio", "checkbox"].includes(field.type) && field.options) {
          baseField.options = field.options.map((opt: string) => ({
            value: opt,
            label: opt,
          }));
        }

        return baseField;
      });

      // Set up permissions for multi-tenant isolation
      const permissions = [
        Permission.read(Role.team(companyId)),
        Permission.update(Role.user(ctx.userId)),
        Permission.update(Role.team(companyId, "owner")),
        Permission.update(Role.team(companyId, "admin")),
        Permission.delete(Role.user(ctx.userId)),
        Permission.delete(Role.team(companyId, "owner")),
      ];

      const form = await formModel.create(
        {
          name: formName,
          description: formDescription || "",
          companyId,
          status: "published", // Auto-publish
          fields: formFields,
          settings: {
            isPublic: false,
            allowAnonymous: false,
            requireLogin: false,
            allowEdit: false,
            allowMultipleSubmissions: true,
            showProgressBar: true,
            showQuestionNumbers: false,
            shuffleQuestions: false,
            confirmationMessage: "Thank you for your submission!",
            redirectUrl: undefined,
            enableNotifications: false,
            notificationEmails: [],
            enableAutoSave: false,
            autoSaveInterval: 30,
            collectEmail: true,
            collectIpAddress: false,
            enableRecaptcha: false,
          },
          metadata: {
            totalFields: formFields.length,
            totalSteps: 1,
            estimatedTime: Math.ceil(formFields.length / 3),
            responseCount: 0,
            lastSubmittedAt: undefined,
          },
          createdBy: ctx.userId,
        },
        ID.unique(),
        permissions
      );

      // Import data if requested
      let importResults = null;
      console.log("=== IMPORT DATA CHECK ===");
      console.log("importData flag:", importData);

      if (importData) {
        console.log("Starting data import...");

        // Download and parse file again
        const storageModel = new CompanyDocumentsStorageModel();
        const fileBuffer = await storageModel.downloadImportFile(fileId);

        const parsedData = await ImportParserService.parseFile(
          Buffer.from(fileBuffer),
          "import.xlsx"
        );

        console.log(`Parsed ${parsedData.rows.length} rows`);
        console.log("Columns:", parsedData.columns);

        // Import submissions
        const submissionModel = new FormSubmissionAdminModel();
        const valueModel = new SubmissionValueAdminModel();

        let successCount = 0;
        let errorCount = 0;
        const errors: any[] = [];

        console.log(`Starting to process ${parsedData.rows.length} rows...`);

        for (let i = 0; i < parsedData.rows.length; i++) {
          try {
            const row = parsedData.rows[i];

            // Create submission
            const now = new Date().toISOString();
            const submission = await submissionModel.create({
              formId: form.$id,
              companyId,
              status: "completed",
              submittedBy: ctx.userId,
              submittedAt: now,
              data: {}, // Required field, but we use normalized SubmissionValue docs
              formVersion: 1,
              isAnonymous: false,
              startedAt: now,
              lastSavedAt: now,
            });

            // Create values for each field
            console.log("=== DEBUG: Starting field value creation ===");
            console.log("Column mapping:", columnMapping);
            console.log("Form fields:", formFields.map(f => ({ name: f.name, type: f.type })));
            console.log("Row data:", row);

            for (const field of formFields) {
              // Find the column that maps to this field
              const columnName = Object.keys(columnMapping).find(
                (col) => columnMapping[col] === field.name
              );

              console.log(`Field ${field.name}: mapped to column "${columnName}"`);

              if (columnName && row[columnName] !== undefined) {
                const rawValue = row[columnName];
                console.log(`  Raw value:`, rawValue);

                // Use helper to properly map value to correct typed field
                const submissionValue = SubmissionValueHelpers.fromFieldValue(
                  submission.$id,
                  form.$id,
                  companyId,
                  field as any, // Field structure is compatible
                  rawValue
                );

                console.log(`  Submission value created:`, submissionValue);

                if (submissionValue) {
                  // Add status field required by Appwrite collection
                  await valueModel.create({
                    ...submissionValue,
                    status: "completed", // Match submission status
                  } as any);
                  console.log(`  ✓ Value saved`);
                } else {
                  console.log(`  ✗ No submission value created`);
                }
              } else {
                console.log(`  ✗ Column not found or value undefined`);
              }
            }
            console.log("=== DEBUG: End field value creation ===");

            successCount++;
          } catch (error) {
            console.error(`Error processing row ${i + 1}:`, error);
            errorCount++;
            errors.push({
              row: i + 1,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        console.log(`Import complete: ${successCount} success, ${errorCount} failed`);

        importResults = {
          total: parsedData.rows.length,
          success: successCount,
          failed: errorCount,
          errors: errors.slice(0, 10), // Return first 10 errors
        };

        // Update form metadata with actual response count
        if (successCount > 0) {
          await formModel.updateById(form.$id, {
            metadata: {
              ...form.metadata,
              responseCount: successCount,
              lastSubmittedAt: new Date().toISOString(),
            },
          });
        }
      }

      // Revalidate paths
      revalidatePath(`/org/${companyId}/forms`);
      revalidatePath(`/org/${companyId}/data-collection`);

      return {
        success: true,
        data: {
          formId: form.$id,
          formName: form.name,
          importResults,
        },
        message: `Form "${formName}" created successfully${importData ? ` with ${importResults?.success || 0} submissions imported` : ""}`,
      };
    } catch (error) {
      console.error("Create form from import error:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create form from import",
      };
    }
  });
