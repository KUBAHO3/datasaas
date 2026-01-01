/**
 * Field Type Detection Service
 *
 * Analyzes CSV/Excel column data and automatically detects appropriate field types
 * for form creation.
 */

// Import field type for auto-import (matches the schema)
export type DetectedFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "url"
  | "date"
  | "time"
  | "datetime"
  | "checkbox"
  | "radio"
  | "dropdown"
  | "file";

export interface DetectedField {
  name: string;
  label: string;
  type: DetectedFieldType;
  required: boolean;
  options?: string[];
  confidence: number; // 0-1 score of detection confidence
  suggestions?: {
    type: DetectedFieldType;
    reason: string;
  }[];
}

export interface FieldDetectionResult {
  fields: DetectedField[];
  totalRows: number;
  warnings: string[];
}

export class FieldDetectorService {
  /**
   * Analyze columns and data to detect field types
   */
  static detectFields(
    columns: string[],
    rows: Record<string, any>[],
    sampleSize: number = 100
  ): FieldDetectionResult {
    const warnings: string[] = [];
    const sampleRows = rows.slice(0, Math.min(sampleSize, rows.length));

    const fields: DetectedField[] = columns.map((columnName) => {
      const values = sampleRows
        .map((row) => row[columnName])
        .filter((v) => v !== null && v !== undefined && v !== "");

      const detection = this.detectFieldType(columnName, values);

      // Check if field should be required
      const nullCount = sampleRows.length - values.length;
      const required = nullCount === 0;

      if (nullCount > sampleRows.length * 0.5) {
        warnings.push(
          `Column "${columnName}" has ${nullCount} empty values out of ${sampleRows.length}`
        );
      }

      return {
        name: this.sanitizeFieldName(columnName),
        label: columnName,
        type: detection.type,
        required,
        options: detection.options,
        confidence: detection.confidence,
        suggestions: detection.suggestions,
      };
    });

    return {
      fields,
      totalRows: rows.length,
      warnings,
    };
  }

  /**
   * Detect field type based on column name and sample values
   */
  private static detectFieldType(
    columnName: string,
    values: any[]
  ): {
    type: DetectedFieldType;
    options?: string[];
    confidence: number;
    suggestions: { type: DetectedFieldType; reason: string }[];
  } {
    const suggestions: { type: DetectedFieldType; reason: string }[] = [];

    // Empty data - default to text
    if (values.length === 0) {
      return {
        type: "text",
        confidence: 0.3,
        suggestions: [{ type: "text", reason: "No data to analyze" }],
      };
    }

    // Check column name patterns
    const nameLower = columnName.toLowerCase();

    // Email detection
    if (
      nameLower.includes("email") ||
      nameLower.includes("e-mail") ||
      nameLower === "mail"
    ) {
      const emailCount = values.filter((v) =>
        this.isEmail(String(v))
      ).length;
      if (emailCount / values.length > 0.8) {
        suggestions.push({
          type: "email",
          reason: "Column name and data suggest email",
        });
        return {
          type: "email",
          confidence: 0.9,
          suggestions,
        };
      }
    }

    // Phone detection
    if (
      nameLower.includes("phone") ||
      nameLower.includes("tel") ||
      nameLower.includes("mobile") ||
      nameLower.includes("contact")
    ) {
      suggestions.push({
        type: "text",
        reason: "Column name suggests phone number",
      });
      return {
        type: "text",
        confidence: 0.7,
        suggestions,
      };
    }

    // URL detection
    if (
      nameLower.includes("url") ||
      nameLower.includes("website") ||
      nameLower.includes("link")
    ) {
      suggestions.push({ type: "text", reason: "Column name suggests URL" });
      return {
        type: "text",
        confidence: 0.7,
        suggestions,
      };
    }

    // Date detection
    if (
      nameLower.includes("date") ||
      nameLower.includes("time") ||
      nameLower.includes("created") ||
      nameLower.includes("updated") ||
      nameLower.includes("birthday") ||
      nameLower.includes("dob")
    ) {
      const dateCount = values.filter((v) => this.isDate(v)).length;
      if (dateCount / values.length > 0.7) {
        suggestions.push({
          type: "date",
          reason: "Column name and data suggest date",
        });
        return {
          type: "date",
          confidence: 0.85,
          suggestions,
        };
      }
    }

    // Analyze actual data
    const uniqueValues = [...new Set(values.map((v) => String(v)))];
    const uniqueRatio = uniqueValues.length / values.length;

    // Boolean/Checkbox detection
    if (uniqueValues.length <= 2) {
      const booleanValues = ["true", "false", "yes", "no", "1", "0", "y", "n"];
      const matchCount = uniqueValues.filter((v) =>
        booleanValues.includes(v.toLowerCase())
      ).length;

      if (matchCount === uniqueValues.length) {
        suggestions.push({
          type: "checkbox",
          reason: "Only 2 boolean-like values found",
        });
        return {
          type: "checkbox",
          confidence: 0.9,
          suggestions,
        };
      }
    }

    // Dropdown/Select detection (3-20 unique values)
    if (uniqueValues.length >= 3 && uniqueValues.length <= 20) {
      const avgLength =
        uniqueValues.reduce((sum, v) => sum + v.length, 0) /
        uniqueValues.length;

      // Short text values suggest dropdown
      if (avgLength < 30 && uniqueRatio < 0.3) {
        suggestions.push({
          type: "dropdown",
          reason: `${uniqueValues.length} unique values found (suggest categories)`,
        });
        return {
          type: "dropdown",
          options: uniqueValues.sort(),
          confidence: 0.8,
          suggestions,
        };
      }
    }

    // Number detection
    const numberCount = values.filter((v) => this.isNumber(v)).length;
    if (numberCount / values.length > 0.9) {
      suggestions.push({
        type: "number",
        reason: "Values are numeric",
      });
      return {
        type: "number",
        confidence: 0.85,
        suggestions,
      };
    }

    // Long text detection
    const avgLength =
      values.reduce((sum, v) => sum + String(v).length, 0) / values.length;
    if (avgLength > 100) {
      suggestions.push({
        type: "textarea",
        reason: "Long text values detected",
      });
      return {
        type: "textarea",
        confidence: 0.7,
        suggestions,
      };
    }

    // Default to text
    suggestions.push({
      type: "text",
      reason: "Default text field",
    });
    return {
      type: "text",
      confidence: 0.6,
      suggestions,
    };
  }

  /**
   * Helper: Check if value is a valid email
   */
  private static isEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  /**
   * Helper: Check if value is a number
   */
  private static isNumber(value: any): boolean {
    if (typeof value === "number") return true;
    if (typeof value !== "string") return false;
    const num = parseFloat(value.replace(/,/g, ""));
    return !isNaN(num) && isFinite(num);
  }

  /**
   * Helper: Check if value is a date
   */
  private static isDate(value: any): boolean {
    if (value instanceof Date) return !isNaN(value.getTime());
    if (typeof value !== "string") return false;

    // Try parsing common date formats
    const date = new Date(value);
    if (!isNaN(date.getTime())) return true;

    // Check for common date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    ];

    return datePatterns.some((pattern) => pattern.test(value));
  }

  /**
   * Helper: Sanitize field name for database
   */
  private static sanitizeFieldName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }

  /**
   * Generate form name suggestion based on filename or columns
   */
  static suggestFormName(
    fileName: string,
    columns: string[]
  ): string {
    // Clean filename
    let name = fileName
      .replace(/\.(csv|xlsx|xls)$/i, "")
      .replace(/[-_]/g, " ")
      .trim();

    // Capitalize words
    name = name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // If filename is generic, try to infer from columns
    if (
      name.toLowerCase().includes("import") ||
      name.toLowerCase().includes("data") ||
      name.toLowerCase().includes("export")
    ) {
      // Look for descriptive column names
      const descriptiveColumns = columns.filter(
        (col) =>
          !col.toLowerCase().includes("id") &&
          !col.toLowerCase().includes("created") &&
          !col.toLowerCase().includes("updated")
      );

      if (descriptiveColumns.length > 0) {
        const firstCol = descriptiveColumns[0]
          .split(/[_\s]+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        name = `${firstCol} Form`;
      }
    }

    return name || "Imported Form";
  }
}
