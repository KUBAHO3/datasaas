import { z } from "zod";

/**
 * Import job status schema
 */
export const importJobStatusSchema = z.enum([
  "pending",
  "parsing",
  "validating",
  "importing",
  "completed",
  "failed",
  "cancelled",
]);

/**
 * Column mapping schema: CSV column -> Form field ID
 */
export const columnMappingSchema = z.record(
  z.string().min(1, "Column name cannot be empty"),
  z.string().min(1, "Field ID cannot be empty")
);

/**
 * Upload file input schema (for FormData)
 */
export const uploadFileInputSchema = z.object({
  formId: z.string().min(1, "Form ID is required"),
  // File will be extracted from FormData
});

/**
 * Parse file input schema
 */
export const parseFileInputSchema = z.object({
  formId: z.string().min(1, "Form ID is required"),
  fileId: z.string().min(1, "File ID is required"),
});

/**
 * Validate import data input schema
 */
export const validateImportInputSchema = z.object({
  formId: z.string().min(1, "Form ID is required"),
  fileId: z.string().min(1, "File ID is required"),
  columnMapping: columnMappingSchema,
});

/**
 * Import options schema
 */
export const importOptionsSchema = z.object({
  formId: z.string().min(1, "Form ID is required"),
  fileId: z.string().min(1, "File ID is required"),
  columnMapping: columnMappingSchema,
  skipEmptyRows: z.boolean().default(true),
  updateExisting: z.boolean().default(false),
  createMissingFields: z.boolean().default(false),
});

/**
 * Get import progress input schema
 */
export const getImportProgressInputSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
});

/**
 * Upload file metadata schema
 */
export const uploadFileMetadataSchema = z.object({
  formId: z.string().min(1, "Form ID is required"),
  fileName: z.string().min(1, "File name is required"),
  fileSize: z
    .number()
    .min(1, "File size must be greater than 0")
    .max(10 * 1024 * 1024, "File size must be under 10MB"),
  fileType: z.enum([
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "text/csv", // .csv
  ], {
    errorMap: () => ({ message: "Only Excel (.xls, .xlsx) and CSV files are supported" }),
  }),
});

/**
 * Cancel import input schema
 */
export const cancelImportInputSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
});

/**
 * Import job creation schema
 */
export const createImportJobSchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
  formId: z.string().min(1, "Form ID is required"),
  fileId: z.string().min(1, "File ID is required"),
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().min(1, "File size must be greater than 0"),
  totalRows: z.number().min(0, "Total rows must be non-negative"),
  createdBy: z.string().min(1, "Creator ID is required"),
});

/**
 * Update import job schema
 */
export const updateImportJobSchema = z.object({
  status: importJobStatusSchema.optional(),
  processedRows: z.number().min(0).optional(),
  successCount: z.number().min(0).optional(),
  errorCount: z.number().min(0).optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  error: z.string().optional(),
});

/**
 * Row error schema
 */
export const rowErrorSchema = z.object({
  row: z.number().min(1, "Row number must be at least 1"),
  field: z.string().min(1, "Field name is required"),
  fieldId: z.string().min(1, "Field ID is required"),
  value: z.any(),
  error: z.string().min(1, "Error message is required"),
  suggestion: z.string().optional(),
});

/**
 * Validation results schema
 */
export const validationResultsSchema = z.object({
  validRowCount: z.number().min(0),
  invalidRowCount: z.number().min(0),
  errors: z.array(rowErrorSchema),
  warnings: z.array(z.string()),
  skippedFields: z.array(z.string()),
});

/**
 * Import result schema
 */
export const importResultSchema = z.object({
  success: z.boolean(),
  jobId: z.string(),
  imported: z.number().min(0),
  failed: z.number().min(0),
  errors: z.array(rowErrorSchema),
  errorReportData: z.string().optional(),
  errorReportFilename: z.string().optional(),
  message: z.string().optional(),
});

/**
 * Import progress schema
 */
export const importProgressSchema = z.object({
  jobId: z.string(),
  status: importJobStatusSchema,
  totalRows: z.number().min(0),
  processedRows: z.number().min(0),
  successCount: z.number().min(0),
  errorCount: z.number().min(0),
  percentage: z.number().min(0).max(100),
  estimatedTimeRemaining: z.number().optional(),
});
