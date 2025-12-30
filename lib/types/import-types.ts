import type { FormField } from "./form-types";

/**
 * Import job status enum
 */
export type ImportJobStatus =
  | "pending" // Job created, waiting to start
  | "parsing" // Parsing uploaded file
  | "validating" // Validating rows
  | "importing" // Creating submissions
  | "completed" // Successfully completed
  | "failed" // Failed with error
  | "cancelled"; // User cancelled

/**
 * Import job document stored in Appwrite
 */
export interface ImportJob {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  companyId: string;
  formId: string;
  fileId: string; // Reference to uploaded file in Appwrite Storage
  fileName: string;
  fileSize: number;
  status: ImportJobStatus;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  startedAt?: string;
  completedAt?: string;
  error?: string; // Error message if failed
  createdBy: string; // User ID who initiated import
}

/**
 * Parsed file data from Excel/CSV
 */
export interface ParsedFileData {
  columns: string[]; // Column headers from first row
  rows: Record<string, any>[]; // Array of row objects
  rowCount: number;
  preview: Record<string, any>[]; // First 5 rows for preview
}

/**
 * Column mapping: CSV column name -> Form field ID
 */
export type ColumnMapping = Record<string, string>;

/**
 * Auto-mapping result with confidence scores
 */
export interface AutoMappingResult {
  mapping: ColumnMapping;
  suggestions: Array<{
    csvColumn: string;
    fieldId: string;
    fieldLabel: string;
    confidence: "high" | "medium" | "low";
  }>;
  unmappedColumns: string[]; // CSV columns with no match
  unmappedFields: FormField[]; // Required form fields with no mapping
}

/**
 * Row validation error
 */
export interface RowError {
  row: number; // Row number (1-indexed)
  field: string; // Field label
  fieldId: string; // Field ID
  value: any; // Invalid value
  error: string; // Error message
  suggestion?: string; // Suggested fix
}

/**
 * Validation results for entire dataset
 */
export interface ValidationResults {
  validRowCount: number;
  invalidRowCount: number;
  errors: RowError[];
  warnings: string[]; // Non-blocking warnings
  skippedFields: string[]; // Fields skipped (e.g., file uploads)
}

/**
 * Import execution options
 */
export interface ImportOptions {
  formId: string;
  fileId: string;
  columnMapping: ColumnMapping;
  skipEmptyRows: boolean;
  updateExisting: boolean; // Future: update vs create
  createMissingFields: boolean; // Future: auto-create fields
}

/**
 * Import execution result
 */
export interface ImportResult {
  success: boolean;
  jobId: string;
  imported: number;
  failed: number;
  errors: RowError[];
  errorReportData?: string; // Base64 CSV for download
  errorReportFilename?: string;
  message?: string;
}

/**
 * Import progress update (for polling)
 */
export interface ImportProgress {
  jobId: string;
  status: ImportJobStatus;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  percentage: number; // 0-100
  estimatedTimeRemaining?: number; // Seconds
}

/**
 * Error report row (for CSV generation)
 */
export interface ErrorReportRow {
  rowNumber: number;
  fieldName: string;
  fieldType: string;
  value: string;
  errorMessage: string;
  suggestion: string;
}

/**
 * Field value transformation result
 */
export interface TransformResult {
  success: boolean;
  value?: any;
  error?: string;
}

/**
 * Import statistics for display
 */
export interface ImportStats {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  skippedRows: number;
  importedRows: number;
  failedRows: number;
  processingTime: number; // Milliseconds
}
