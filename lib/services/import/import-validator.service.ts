import "server-only";
import type { Form, FormField } from "@/lib/types/import-types";
import type {
  ColumnMapping,
  RowError,
  ValidationResults,
  TransformResult,
} from "@/lib/types/import-types";

/**
 * Import Validator Service
 * Handles two-phase validation of import data
 */
export class ImportValidatorService {
  /**
   * Quick validation - check data types and required fields
   * @param rows Data rows
   * @param form Form definition
   * @param columnMapping CSV column -> Field ID mapping
   * @returns Validation results with errors
   */
  static async quickValidation(
    rows: Record<string, any>[],
    form: Form,
    columnMapping: ColumnMapping
  ): Promise<ValidationResults> {
    const errors: RowError[] = [];
    const warnings: string[] = [];
    const skippedFields: string[] = [];

    // Get importable fields (exclude file upload fields)
    const importableFields = form.fields.filter(
      (field) =>
        !["file_upload", "image_upload", "signature"].includes(field.type)
    );

    // Check for unmapped required fields
    const unmappedRequired = importableFields.filter((field) => {
      const isMapped = Object.values(columnMapping).includes(field.id);
      return field.required && !isMapped;
    });

    if (unmappedRequired.length > 0) {
      unmappedRequired.forEach((field) => {
        warnings.push(
          `Required field "${field.label}" is not mapped and will cause import errors`
        );
      });
    }

    // Identify skipped fields (file uploads)
    const fileUploadFields = form.fields.filter((field) =>
      ["file_upload", "image_upload", "signature"].includes(field.type)
    );

    if (fileUploadFields.length > 0) {
      fileUploadFields.forEach((field) => {
        skippedFields.push(field.label);
      });
      warnings.push(
        `File upload fields (${fileUploadFields.map((f) => f.label).join(", ")}) will be skipped during import`
      );
    }

    // Validate each row
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const rowNumber = rowIndex + 1; // 1-indexed for user display

      // Check each mapped field
      for (const [csvColumn, fieldId] of Object.entries(columnMapping)) {
        const field = form.fields.find((f) => f.id === fieldId);
        if (!field) continue;

        const value = row[csvColumn];

        // Check required fields
        if (field.required && (value === null || value === undefined || value === "")) {
          errors.push({
            row: rowNumber,
            field: field.label,
            fieldId: field.id,
            value: value,
            error: `${field.label} is required`,
            suggestion: "Provide a value for this field",
          });
          continue;
        }

        // Skip if value is empty (and not required)
        if (value === null || value === undefined || value === "") {
          continue;
        }

        // Type-specific validation
        const validationError = this.validateFieldType(field, value);
        if (validationError) {
          errors.push({
            row: rowNumber,
            field: field.label,
            fieldId: field.id,
            value: value,
            error: validationError.error,
            suggestion: validationError.suggestion,
          });
        }
      }
    }

    const validRowCount = rows.length - new Set(errors.map(e => e.row)).size;
    const invalidRowCount = new Set(errors.map(e => e.row)).size;

    return {
      validRowCount,
      invalidRowCount,
      errors: errors.slice(0, 100), // Limit to first 100 errors for preview
      warnings,
      skippedFields,
    };
  }

  /**
   * Validate field type and format
   * @param field Form field definition
   * @param value Value to validate
   * @returns Error object or null if valid
   */
  private static validateFieldType(
    field: FormField,
    value: any
  ): { error: string; suggestion?: string } | null {
    switch (field.type) {
      case "number":
      case "currency":
        const numValue = this.parseNumber(value);
        if (isNaN(numValue)) {
          return {
            error: "Must be a valid number",
            suggestion: `Enter a numeric value (e.g., 123 or 45.99)`,
          };
        }

        // Check min/max validation rules
        const minRule = field.validation?.find((r) => r.type === "min_value");
        if (minRule && numValue < minRule.value) {
          return {
            error: minRule.message || `Must be at least ${minRule.value}`,
          };
        }

        const maxRule = field.validation?.find((r) => r.type === "max_value");
        if (maxRule && numValue > maxRule.value) {
          return {
            error: maxRule.message || `Must be at most ${maxRule.value}`,
          };
        }
        break;

      case "email":
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!emailRegex.test(String(value))) {
          return {
            error: "Must be a valid email address",
            suggestion: "Format: user@example.com",
          };
        }
        break;

      case "phone":
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
        if (!phoneRegex.test(String(value))) {
          return {
            error: "Must be a valid phone number",
            suggestion: "Format: +1-555-1234 or (555) 123-4567",
          };
        }
        break;

      case "url":
        try {
          new URL(String(value));
        } catch {
          return {
            error: "Must be a valid URL",
            suggestion: "Format: https://example.com",
          };
        }
        break;

      case "date":
      case "datetime":
        const dateValue = this.parseDate(value);
        if (!dateValue) {
          return {
            error: "Must be a valid date",
            suggestion: "Format: YYYY-MM-DD or MM/DD/YYYY",
          };
        }
        break;

      case "checkbox":
        if (typeof value !== "boolean" && !this.isBooleanValue(value)) {
          return {
            error: "Must be a boolean value",
            suggestion: "Use: true/false, yes/no, 1/0",
          };
        }
        break;

      case "dropdown":
      case "radio":
        // Check if value exists in options
        if (field.options && field.options.length > 0) {
          const validOptions = field.options.map((opt) =>
            opt.value.toLowerCase()
          );
          if (!validOptions.includes(String(value).toLowerCase())) {
            return {
              error: `Must be one of: ${field.options.map((o) => o.value).join(", ")}`,
              suggestion: `Valid values: ${field.options.map((o) => o.value).join(", ")}`,
            };
          }
        }
        break;

      case "multi_select":
        // Value should be comma-separated list
        const values = String(value)
          .split(/[,;]/)
          .map((v) => v.trim())
          .filter((v) => v);

        if (field.options && field.options.length > 0) {
          const validOptions = field.options.map((opt) =>
            opt.value.toLowerCase()
          );
          const invalidValues = values.filter(
            (v) => !validOptions.includes(v.toLowerCase())
          );

          if (invalidValues.length > 0) {
            return {
              error: `Invalid options: ${invalidValues.join(", ")}`,
              suggestion: `Valid values: ${field.options.map((o) => o.value).join(", ")}`,
            };
          }
        }
        break;

      case "rating":
        const rating = Number(value);
        if (isNaN(rating) || rating < 1 || rating > (field.maxRating || 5)) {
          return {
            error: `Must be a number between 1 and ${field.maxRating || 5}`,
          };
        }
        break;

      case "scale":
        const scale = Number(value);
        const min = field.minValue || 1;
        const max = field.maxValue || 10;
        if (isNaN(scale) || scale < min || scale > max) {
          return {
            error: `Must be a number between ${min} and ${max}`,
          };
        }
        break;
    }

    // Check length validation rules
    const minLengthRule = field.validation?.find((r) => r.type === "min_length");
    if (minLengthRule && String(value).length < minLengthRule.value) {
      return {
        error:
          minLengthRule.message ||
          `Must be at least ${minLengthRule.value} characters`,
      };
    }

    const maxLengthRule = field.validation?.find((r) => r.type === "max_length");
    if (maxLengthRule && String(value).length > maxLengthRule.value) {
      return {
        error:
          maxLengthRule.message ||
          `Must be at most ${maxLengthRule.value} characters`,
      };
    }

    return null;
  }

  /**
   * Transform CSV value to proper type for submission
   * @param field Form field
   * @param value CSV value
   * @returns Transformed value
   */
  static transformValue(field: FormField, value: any): TransformResult {
    // Handle null/empty values
    if (value === null || value === undefined || value === "") {
      return { success: true, value: null };
    }

    try {
      switch (field.type) {
        case "number":
        case "currency":
        case "rating":
        case "scale":
          const numValue = this.parseNumber(value);
          if (isNaN(numValue)) {
            return {
              success: false,
              error: "Invalid number format",
            };
          }
          return { success: true, value: numValue };

        case "checkbox":
          return {
            success: true,
            value: this.parseBoolean(value),
          };

        case "date":
        case "datetime":
          const dateValue = this.parseDate(value);
          if (!dateValue) {
            return {
              success: false,
              error: "Invalid date format",
            };
          }
          return { success: true, value: dateValue.toISOString() };

        case "multi_select":
          // Split by comma or semicolon and trim
          const values = String(value)
            .split(/[,;]/)
            .map((v) => v.trim())
            .filter((v) => v);
          return { success: true, value: values };

        default:
          // String fields: short_text, long_text, email, phone, url, etc.
          return { success: true, value: String(value).trim() };
      }
    } catch (error) {
      return {
        success: false,
        error: `Transformation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Parse number from various formats
   * Handles: 123, 123.45, $123.45, 1,234.56, 1.234,56 (EU format)
   */
  private static parseNumber(value: any): number {
    if (typeof value === "number") return value;

    const str = String(value).trim();

    // Remove currency symbols and spaces
    let cleaned = str.replace(/[$€£¥\s]/g, "");

    // Handle EU format (1.234,56 -> 1234.56)
    if (cleaned.includes(",") && cleaned.includes(".")) {
      // If comma is after dot, it's EU format
      if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
        cleaned = cleaned.replace(/\./g, "").replace(/,/, ".");
      } else {
        // US format - remove commas
        cleaned = cleaned.replace(/,/g, "");
      }
    } else if (cleaned.includes(",")) {
      // Check if it's a decimal separator or thousands separator
      const parts = cleaned.split(",");
      if (parts.length === 2 && parts[1].length <= 2) {
        // Likely decimal (e.g., 45,99)
        cleaned = cleaned.replace(/,/, ".");
      } else {
        // Likely thousands separator (e.g., 1,234)
        cleaned = cleaned.replace(/,/g, "");
      }
    }

    return parseFloat(cleaned);
  }

  /**
   * Parse date from various formats
   */
  private static parseDate(value: any): Date | null {
    if (value instanceof Date) return value;

    const str = String(value).trim();

    // Try ISO format first (YYYY-MM-DD)
    const isoDate = new Date(str);
    if (!isNaN(isoDate.getTime())) return isoDate;

    // Try common formats
    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
      /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
      /^(\d{2})\.(\d{2})\.(\d{4})$/, // DD.MM.YYYY
    ];

    for (const format of formats) {
      const match = str.match(format);
      if (match) {
        const date = new Date(str);
        if (!isNaN(date.getTime())) return date;
      }
    }

    return null;
  }

  /**
   * Check if value can be converted to boolean
   */
  private static isBooleanValue(value: any): boolean {
    const truthyValues = ["true", "yes", "1", "y", "on"];
    const falsyValues = ["false", "no", "0", "n", "off", ""];

    const str = String(value).toLowerCase().trim();
    return truthyValues.includes(str) || falsyValues.includes(str);
  }

  /**
   * Parse boolean from various formats
   */
  private static parseBoolean(value: any): boolean {
    if (typeof value === "boolean") return value;

    const truthyValues = ["true", "yes", "1", "y", "on"];
    const str = String(value).toLowerCase().trim();

    return truthyValues.includes(str);
  }
}
