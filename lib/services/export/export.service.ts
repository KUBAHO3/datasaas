import "server-only";

import { Form } from "@/lib/types/form-types";
import { SubmissionRow } from "@/lib/types/submission-types";
import {
  SubmissionHelpers,
  sanitizeColumnName,
} from "@/lib/utils/submission-utils";
import * as XLSX from "xlsx";

interface ExportParams {
  format: "excel" | "csv" | "json" | "pdf";
  form: Form;
  rows: SubmissionRow[];
  includeMetadata?: boolean;
  selectedFields?: string[];
}

interface ExportResult {
  data: string;
  filename: string;
  mimeType: string;
}

export class ExportService {
  async exportSubmissions(params: ExportParams): Promise<ExportResult> {
    const { format, form, rows, includeMetadata, selectedFields } = params;

    const fields = selectedFields
      ? form.fields.filter((f) => selectedFields.includes(f.id))
      : form.fields;

    switch (format) {
      case "excel":
        return this.exportToExcel(form, rows, fields, includeMetadata);
      case "csv":
        return this.exportToCSV(form, rows, fields, includeMetadata);
      case "json":
        return this.exportToJSON(form, rows, fields, includeMetadata);
      case "pdf":
        return this.exportToPDF(form, rows, fields, includeMetadata);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async exportToExcel(
    form: Form,
    rows: SubmissionRow[],
    fields: any[],
    includeMetadata?: boolean
  ): Promise<ExportResult> {
    const workbook = XLSX.utils.book_new();

    const headers: string[] = ["ID", "Status", "Submitted At", "Submitted By"];
    fields.forEach((field) => {
      headers.push(sanitizeColumnName(field.label));
    });

    if (includeMetadata) {
      headers.push("Started At", "Last Saved");
    }

    const dataRows: any[][] = [headers];

    rows.forEach((row) => {
      const dataRow: any[] = [
        row.submission.$id,
        row.submission.status,
        row.submission.submittedAt || "—",
        row.submission.submittedByEmail ||
          row.submission.submittedBy ||
          "Anonymous",
      ];

      fields.forEach((field) => {
        const value = row.fieldValues[field.id];
        dataRow.push(SubmissionHelpers.formatFieldValue(value, field.type));
      });

      if (includeMetadata) {
        dataRow.push(row.submission.startedAt, row.submission.lastSavedAt);
      }

      dataRows.push(dataRow);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(dataRows);

    // Set column widths
    const columnWidths = headers.map((header) => ({
      wch: Math.max(header.length, 15),
    }));
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Convert to base64
    const base64 = excelBuffer.toString("base64");

    return {
      data: base64,
      filename: `${sanitizeColumnName(form.name)}_submissions_${
        new Date().toISOString().split("T")[0]
      }.xlsx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  /**
   * Export to CSV
   */
  private async exportToCSV(
    form: Form,
    rows: SubmissionRow[],
    fields: any[],
    includeMetadata?: boolean
  ): Promise<ExportResult> {
    const csvRows: string[] = [];

    // Headers
    const headers: string[] = ["ID", "Status", "Submitted At", "Submitted By"];
    fields.forEach((field) => {
      headers.push(sanitizeColumnName(field.label));
    });
    if (includeMetadata) {
      headers.push("Started At", "Last Saved");
    }
    csvRows.push(headers.map((h) => `"${h}"`).join(","));

    // Data rows
    rows.forEach((row) => {
      const dataRow: string[] = [
        row.submission.$id,
        row.submission.status,
        row.submission.submittedAt || "—",
        row.submission.submittedByEmail ||
          row.submission.submittedBy ||
          "Anonymous",
      ];

      fields.forEach((field) => {
        const value = row.fieldValues[field.id];
        const formatted = SubmissionHelpers.formatFieldValue(value, field.type);
        dataRow.push(formatted.replace(/"/g, '""')); // Escape quotes
      });

      if (includeMetadata) {
        dataRow.push(row.submission.startedAt, row.submission.lastSavedAt);
      }

      csvRows.push(dataRow.map((r) => `"${r}"`).join(","));
    });

    const csv = csvRows.join("\n");
    const base64 = Buffer.from(csv, "utf-8").toString("base64");

    return {
      data: base64,
      filename: `${sanitizeColumnName(form.name)}_submissions_${
        new Date().toISOString().split("T")[0]
      }.csv`,
      mimeType: "text/csv",
    };
  }

  /**
   * Export to JSON
   */
  private async exportToJSON(
    form: Form,
    rows: SubmissionRow[],
    fields: any[],
    includeMetadata?: boolean
  ): Promise<ExportResult> {
    const data = rows.map((row) => {
      const jsonRow: any = {
        id: row.submission.$id,
        status: row.submission.status,
        submittedAt: row.submission.submittedAt,
        submittedBy:
          row.submission.submittedByEmail || row.submission.submittedBy,
      };

      fields.forEach((field) => {
        jsonRow[field.id] = row.fieldValues[field.id];
      });

      if (includeMetadata) {
        jsonRow.metadata = {
          startedAt: row.submission.startedAt,
          lastSavedAt: row.submission.lastSavedAt,
        };
      }

      return jsonRow;
    });

    const json = JSON.stringify(data, null, 2);
    const base64 = Buffer.from(json, "utf-8").toString("base64");

    return {
      data: base64,
      filename: `${sanitizeColumnName(form.name)}_submissions_${
        new Date().toISOString().split("T")[0]
      }.json`,
      mimeType: "application/json",
    };
  }

  /**
   * Export to PDF (basic HTML template)
   */
  private async exportToPDF(
    form: Form,
    rows: SubmissionRow[],
    fields: any[],
    includeMetadata?: boolean
  ): Promise<ExportResult> {
    const html = this.generatePDFHTML(form, rows, fields, includeMetadata);
    const base64 = Buffer.from(html, "utf-8").toString("base64");

    return {
      data: base64,
      filename: `${sanitizeColumnName(form.name)}_submissions_${
        new Date().toISOString().split("T")[0]
      }.html`,
      mimeType: "text/html",
    };
  }

  /**
   * Generate HTML for PDF export
   */
  private generatePDFHTML(
    form: Form,
    rows: SubmissionRow[],
    fields: any[],
    includeMetadata?: boolean
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${form.name} - Submissions</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
    th { background-color: #f2f2f2; font-weight: bold; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>${form.name} - Submissions Report</h1>
  <p>Generated on: ${new Date().toLocaleString()}</p>
  <p>Total Submissions: ${rows.length}</p>
  
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Status</th>
        <th>Submitted At</th>
        <th>Submitted By</th>
        ${fields.map((f) => `<th>${f.label}</th>`).join("")}
        ${includeMetadata ? "<th>Started At</th><th>Last Saved</th>" : ""}
      </tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (row) => `
        <tr>
          <td>${row.submission.$id}</td>
          <td>${row.submission.status}</td>
          <td>${row.submission.submittedAt || "—"}</td>
          <td>${
            row.submission.submittedByEmail ||
            row.submission.submittedBy ||
            "Anonymous"
          }</td>
          ${fields
            .map((field) => {
              const value = row.fieldValues[field.id];
              return `<td>${SubmissionHelpers.formatFieldValue(
                value,
                field.type
              )}</td>`;
            })
            .join("")}
          ${
            includeMetadata
              ? `<td>${row.submission.startedAt}</td><td>${row.submission.lastSavedAt}</td>`
              : ""
          }
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>
    `;
  }
}
