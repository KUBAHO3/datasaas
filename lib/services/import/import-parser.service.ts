import "server-only";
import * as XLSX from "xlsx";
import type { ParsedFileData } from "@/lib/types/import-types";

/**
 * Import Parser Service
 * Handles parsing of Excel and CSV files using xlsx library
 */
export class ImportParserService {
  /**
   * Parse uploaded Excel or CSV file
   * @param buffer File buffer
   * @param filename Original filename
   * @returns Parsed data with columns and rows
   */
  static async parseFile(buffer: Buffer, filename: string): Promise<ParsedFileData> {
    try {
      // Read workbook from buffer
      const workbook = XLSX.read(buffer, {
        type: "buffer",
        cellDates: true, // Parse dates as Date objects
        cellText: false, // Get actual values, not formatted text
      });

      // Get first sheet (most imports will have single sheet)
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error("File contains no sheets");
      }

      const worksheet = workbook.Sheets[firstSheetName];
      if (!worksheet) {
        throw new Error("Could not read worksheet");
      }

      // Convert sheet to JSON
      // header: 1 means use first row as headers
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
        header: 1,
        defval: "", // Default value for empty cells
        blankrows: false, // Skip completely empty rows
        raw: false, // Get formatted strings instead of raw values
      });

      if (jsonData.length === 0) {
        throw new Error("File is empty");
      }

      // First row is headers
      const headerRow = jsonData[0] as any[];
      const columns = headerRow.map((col, index) => {
        // Handle empty column headers
        if (!col || col.toString().trim() === "") {
          return `Column_${index + 1}`;
        }
        return col.toString().trim();
      });

      // Check for duplicate column names
      const duplicates = columns.filter(
        (col, index) => columns.indexOf(col) !== index
      );
      if (duplicates.length > 0) {
        throw new Error(
          `Duplicate column names found: ${duplicates.join(", ")}. Please ensure all column headers are unique.`
        );
      }

      // Rest are data rows
      const dataRows = jsonData.slice(1);

      // Convert array rows to objects with column names as keys
      const rows = dataRows.map((row: any[], rowIndex) => {
        const rowObj: Record<string, any> = {};
        columns.forEach((col, colIndex) => {
          const value = row[colIndex];

          // Handle different value types
          if (value === undefined || value === null || value === "") {
            rowObj[col] = null;
          } else if (value instanceof Date) {
            // Format dates as ISO strings
            rowObj[col] = value.toISOString();
          } else {
            rowObj[col] = value;
          }
        });
        return rowObj;
      });

      // Filter out completely empty rows
      const nonEmptyRows = rows.filter((row) => {
        return Object.values(row).some((val) => val !== null && val !== "");
      });

      const rowCount = nonEmptyRows.length;

      // Get preview (first 5 rows)
      const preview = nonEmptyRows.slice(0, 5);

      return {
        columns,
        rows: nonEmptyRows,
        rowCount,
        preview,
      };
    } catch (error) {
      console.error("Error parsing file:", error);

      if (error instanceof Error) {
        throw new Error(`Failed to parse file: ${error.message}`);
      }

      throw new Error("Failed to parse file: Unknown error");
    }
  }

  /**
   * Validate file format before parsing
   * @param filename File name to check extension
   * @param mimeType MIME type from upload
   * @returns True if valid format
   */
  static isValidFileFormat(filename: string, mimeType: string): boolean {
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const validMimeTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    const extension = filename.toLowerCase().substring(filename.lastIndexOf("."));

    return (
      validExtensions.includes(extension) || validMimeTypes.includes(mimeType)
    );
  }

  /**
   * Estimate memory usage for file
   * @param fileSize File size in bytes
   * @returns Estimated memory usage in MB
   */
  static estimateMemoryUsage(fileSize: number): number {
    // Rule of thumb: Excel files expand 3-5x in memory when parsed
    // CSV files expand 2-3x
    const expansionFactor = 4;
    const estimatedBytes = fileSize * expansionFactor;
    return estimatedBytes / (1024 * 1024); // Convert to MB
  }

  /**
   * Get file stats without parsing full file
   * @param buffer File buffer
   * @returns Quick stats
   */
  static async getFileStats(buffer: Buffer): Promise<{
    sheetCount: number;
    estimatedRows: number;
  }> {
    try {
      const workbook = XLSX.read(buffer, {
        type: "buffer",
        bookSheets: true, // Only read sheet names, not content
      });

      const sheetCount = workbook.SheetNames.length;

      // For row estimation, we'd need to parse, so return 0 for now
      // This is more for future optimization
      return {
        sheetCount,
        estimatedRows: 0,
      };
    } catch (error) {
      console.error("Error getting file stats:", error);
      return {
        sheetCount: 0,
        estimatedRows: 0,
      };
    }
  }

  /**
   * Normalize column name for matching
   * @param columnName Original column name
   * @returns Normalized name
   */
  static normalizeColumnName(columnName: string): string {
    return columnName
      .toLowerCase()
      .trim()
      .replace(/[_\s-]+/g, " ") // Replace underscores, spaces, dashes with single space
      .replace(/[^\w\s]/g, ""); // Remove special characters
  }

  /**
   * Detect date format in column
   * @param values Sample values from column
   * @returns Detected format or null
   */
  static detectDateFormat(values: any[]): string | null {
    const dateFormats = [
      /^\d{4}-\d{2}-\d{2}$/, // ISO: 2024-01-15
      /^\d{2}\/\d{2}\/\d{4}$/, // US: 01/15/2024
      /^\d{2}-\d{2}-\d{4}$/, // EU: 15-01-2024
      /^\d{2}\.\d{2}\.\d{4}$/, // German: 15.01.2024
    ];

    const formatNames = ["ISO", "US", "EU", "DE"];

    for (let i = 0; i < dateFormats.length; i++) {
      const format = dateFormats[i];
      const matchCount = values.filter((val) => {
        return typeof val === "string" && format.test(val);
      }).length;

      // If more than 70% match, assume this format
      if (matchCount / values.length > 0.7) {
        return formatNames[i];
      }
    }

    return null;
  }
}
