import "server-only";
import * as XLSX from "xlsx";
import type { Form, FormField } from "@/lib/types/form-types";
import type {
  AutoMappingResult,
  ColumnMapping,
  ErrorReportRow,
} from "@/lib/types/import-types";
import { ImportParserService } from "./import-parser.service";

/**
 * Import Service
 * Main orchestration layer for import functionality
 */
export class ImportService {
  /**
   * Auto-map CSV columns to form fields using fuzzy matching
   * @param csvColumns Column names from CSV
   * @param formFields Form field definitions
   * @returns Auto-mapping result with suggestions
   */
  static autoMapColumns(
    csvColumns: string[],
    formFields: FormField[]
  ): AutoMappingResult {
    const mapping: ColumnMapping = {};
    const suggestions: AutoMappingResult["suggestions"] = [];
    const unmappedColumns: string[] = [];

    // Filter out file upload fields (not importable)
    const importableFields = formFields.filter(
      (field) =>
        !["file_upload", "image_upload", "signature"].includes(field.type)
    );

    for (const csvColumn of csvColumns) {
      const normalized = ImportParserService.normalizeColumnName(csvColumn);

      // Try exact match first
      const exactMatch = importableFields.find(
        (field) =>
          ImportParserService.normalizeColumnName(field.label) === normalized
      );

      if (exactMatch) {
        mapping[csvColumn] = exactMatch.id;
        suggestions.push({
          csvColumn,
          fieldId: exactMatch.id,
          fieldLabel: exactMatch.label,
          confidence: "high",
        });
        continue;
      }

      // Try partial match (contains)
      const partialMatch = importableFields.find((field) => {
        const fieldNormalized = ImportParserService.normalizeColumnName(
          field.label
        );
        return (
          fieldNormalized.includes(normalized) ||
          normalized.includes(fieldNormalized)
        );
      });

      if (partialMatch) {
        mapping[csvColumn] = partialMatch.id;
        suggestions.push({
          csvColumn,
          fieldId: partialMatch.id,
          fieldLabel: partialMatch.label,
          confidence: "medium",
        });
        continue;
      }

      // Try word-based matching
      const words = normalized.split(/\s+/);
      const wordMatch = importableFields.find((field) => {
        const fieldWords = ImportParserService.normalizeColumnName(
          field.label
        ).split(/\s+/);
        // Check if any word matches
        return words.some((word) => fieldWords.includes(word));
      });

      if (wordMatch) {
        mapping[csvColumn] = wordMatch.id;
        suggestions.push({
          csvColumn,
          fieldId: wordMatch.id,
          fieldLabel: wordMatch.label,
          confidence: "low",
        });
        continue;
      }

      // No match found
      unmappedColumns.push(csvColumn);
    }

    // Find unmapped required fields
    const mappedFieldIds = Object.values(mapping);
    const unmappedFields = importableFields.filter(
      (field) => field.required && !mappedFieldIds.includes(field.id)
    );

    return {
      mapping,
      suggestions,
      unmappedColumns,
      unmappedFields,
    };
  }

  /**
   * Generate error report as CSV
   * @param errors Array of row errors
   * @returns CSV string
   */
  static generateErrorReport(errors: ErrorReportRow[]): string {
    // CSV headers
    const headers = [
      "Row Number",
      "Field Name",
      "Field Type",
      "Value",
      "Error Message",
      "Suggestion",
    ];

    // Escape CSV value
    const escapeCsvValue = (value: any): string => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      // If contains comma, quote, or newline, wrap in quotes and escape quotes
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV rows
    const csvRows = [
      headers.map(escapeCsvValue).join(","),
      ...errors.map((error) =>
        [
          error.rowNumber,
          error.fieldName,
          error.fieldType,
          error.value,
          error.errorMessage,
          error.suggestion,
        ]
          .map(escapeCsvValue)
          .join(",")
      ),
    ];

    return csvRows.join("\n");
  }

  /**
   * Convert error report CSV to base64 for download
   * @param csvString CSV string
   * @returns Base64 encoded string
   */
  static encodeErrorReport(csvString: string): string {
    return Buffer.from(csvString, "utf-8").toString("base64");
  }

  /**
   * Generate error report filename
   * @param formName Form name
   * @returns Filename with timestamp
   */
  static generateErrorReportFilename(formName: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const sanitizedFormName = formName.replace(/[^a-z0-9]/gi, "_");
    return `import_errors_${sanitizedFormName}_${timestamp}.csv`;
  }

  /**
   * Calculate import statistics
   * @param totalRows Total rows in file
   * @param validRows Valid rows count
   * @param importedRows Successfully imported rows
   * @returns Statistics object
   */
  static calculateStats(
    totalRows: number,
    validRows: number,
    importedRows: number
  ): {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    importedRows: number;
    failedRows: number;
    successRate: number;
  } {
    const invalidRows = totalRows - validRows;
    const failedRows = validRows - importedRows;
    const successRate =
      totalRows > 0 ? Math.round((importedRows / totalRows) * 100) : 0;

    return {
      totalRows,
      validRows,
      invalidRows,
      importedRows,
      failedRows,
      successRate,
    };
  }

  /**
   * Estimate import duration
   * @param rowCount Number of rows
   * @returns Estimated duration in seconds
   */
  static estimateImportDuration(rowCount: number): number {
    // Rough estimate: 100 rows per second
    const rowsPerSecond = 100;
    const estimatedSeconds = Math.ceil(rowCount / rowsPerSecond);

    // Add overhead (parsing, validation, etc.)
    const overhead = 5; // 5 seconds
    return estimatedSeconds + overhead;
  }

  /**
   * Chunk array into smaller batches
   * @param array Array to chunk
   * @param size Batch size
   * @returns Array of batches
   */
  static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Format field value for display in error report
   * @param value Any value
   * @returns Formatted string
   */
  static formatValueForDisplay(value: any): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value instanceof Date) return value.toISOString();
    return String(value);
  }

  /**
   * Detect field type from sample values
   * @param values Sample values from column
   * @returns Detected field type
   */
  static detectFieldType(values: any[]): string {
    const nonEmptyValues = values.filter(
      (v) => v !== null && v !== undefined && v !== ""
    );

    if (nonEmptyValues.length === 0) return "short_text";

    // Check if all are numbers
    const numberCount = nonEmptyValues.filter((v) => !isNaN(Number(v))).length;
    if (numberCount / nonEmptyValues.length > 0.8) {
      return "number";
    }

    // Check if all are dates
    const dateCount = nonEmptyValues.filter((v) => {
      const date = new Date(v);
      return !isNaN(date.getTime());
    }).length;
    if (dateCount / nonEmptyValues.length > 0.8) {
      return "date";
    }

    // Check if all are emails
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const emailCount = nonEmptyValues.filter((v) =>
      emailRegex.test(String(v))
    ).length;
    if (emailCount / nonEmptyValues.length > 0.8) {
      return "email";
    }

    // Check if all are booleans
    const booleanCount = nonEmptyValues.filter((v) => {
      const str = String(v).toLowerCase();
      return ["true", "false", "yes", "no", "1", "0"].includes(str);
    }).length;
    if (booleanCount / nonEmptyValues.length > 0.8) {
      return "checkbox";
    }

    // Default to text
    return "short_text";
  }

  /**
   * Validate column mapping completeness
   * @param mapping Column mapping
   * @param form Form definition
   * @returns Validation result
   */
  static validateMapping(
    mapping: ColumnMapping,
    form: Form
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Get importable required fields
    const requiredFields = form.fields.filter(
      (field) =>
        field.required &&
        !["file_upload", "image_upload", "signature"].includes(field.type)
    );

    // Check if all required fields are mapped
    const mappedFieldIds = Object.values(mapping);
    const unmappedRequired = requiredFields.filter(
      (field) => !mappedFieldIds.includes(field.id)
    );

    if (unmappedRequired.length > 0) {
      errors.push(
        `Required fields not mapped: ${unmappedRequired.map((f) => f.label).join(", ")}`
      );
    }

    // Check for duplicate mappings (multiple columns mapped to same field)
    const fieldIdCounts = mappedFieldIds.reduce(
      (acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const duplicates = Object.entries(fieldIdCounts)
      .filter(([_, count]) => count > 1)
      .map(([fieldId]) => {
        const field = form.fields.find((f) => f.id === fieldId);
        return field?.label || fieldId;
      });

    if (duplicates.length > 0) {
      errors.push(
        `Multiple columns mapped to same field: ${duplicates.join(", ")}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
