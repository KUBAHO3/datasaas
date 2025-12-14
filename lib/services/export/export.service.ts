import "server-only";

import { Form } from "@/lib/types/form-types";
import { SubmissionRow } from "@/lib/types/submission-types";
import {
  SubmissionHelpers,
  sanitizeColumnName,
} from "@/lib/utils/submission-utils";
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

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
   * Export to PDF using pdfkit
   */
  private async exportToPDF(
    form: Form,
    rows: SubmissionRow[],
    fields: any[],
    includeMetadata?: boolean
  ): Promise<ExportResult> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          layout: "landscape",
          margin: 50,
        });

        const chunks: Buffer[] = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(chunks);
          const base64 = pdfBuffer.toString("base64");

          resolve({
            data: base64,
            filename: `${sanitizeColumnName(form.name)}_submissions_${
              new Date().toISOString().split("T")[0]
            }.pdf`,
            mimeType: "application/pdf",
          });
        });

        doc.on("error", reject);

        // Header
        doc.fontSize(20).font("Helvetica-Bold").text(form.name, {
          align: "center",
        });

        doc.moveDown(0.5);
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`Submissions Report`, { align: "center" });
        doc.text(`Generated on: ${new Date().toLocaleString()}`, {
          align: "center",
        });
        doc.text(`Total Submissions: ${rows.length}`, { align: "center" });

        doc.moveDown(1);

        // Table configuration
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const headers = ["ID", "Status", "Submitted At", "Submitted By"];

        fields.forEach((field) => {
          headers.push(field.label.substring(0, 20)); // Truncate long labels
        });

        if (includeMetadata) {
          headers.push("Started", "Last Saved");
        }

        const columnWidth = pageWidth / headers.length;
        const tableTop = doc.y;
        let currentY = tableTop;

        // Draw table headers
        doc.fontSize(8).font("Helvetica-Bold");
        headers.forEach((header, i) => {
          doc.text(
            header,
            doc.page.margins.left + i * columnWidth,
            currentY,
            {
              width: columnWidth - 5,
              align: "left",
            }
          );
        });

        currentY += 20;
        doc
          .moveTo(doc.page.margins.left, currentY)
          .lineTo(doc.page.width - doc.page.margins.right, currentY)
          .stroke();

        currentY += 5;

        // Draw table rows
        doc.font("Helvetica").fontSize(7);

        rows.forEach((row, rowIndex) => {
          // Check if we need a new page
          if (currentY > doc.page.height - doc.page.margins.bottom - 50) {
            doc.addPage({ size: "A4", layout: "landscape", margin: 50 });
            currentY = doc.page.margins.top;

            // Redraw headers on new page
            doc.fontSize(8).font("Helvetica-Bold");
            headers.forEach((header, i) => {
              doc.text(
                header,
                doc.page.margins.left + i * columnWidth,
                currentY,
                {
                  width: columnWidth - 5,
                  align: "left",
                }
              );
            });
            currentY += 20;
            doc
              .moveTo(doc.page.margins.left, currentY)
              .lineTo(doc.page.width - doc.page.margins.right, currentY)
              .stroke();
            currentY += 5;
            doc.font("Helvetica").fontSize(7);
          }

          const rowData: string[] = [
            row.submission.$id.substring(0, 8) + "...",
            row.submission.status,
            row.submission.submittedAt
              ? new Date(row.submission.submittedAt).toLocaleDateString()
              : "—",
            (row.submission.submittedByEmail ||
              row.submission.submittedBy ||
              "Anon").substring(0, 15),
          ];

          fields.forEach((field) => {
            const value = row.fieldValues[field.id];
            const formatted = SubmissionHelpers.formatFieldValue(
              value,
              field.type
            );
            rowData.push(
              formatted.toString().substring(0, 30) // Truncate long values
            );
          });

          if (includeMetadata) {
            rowData.push(
              new Date(row.submission.startedAt).toLocaleDateString(),
              new Date(row.submission.lastSavedAt).toLocaleDateString()
            );
          }

          const rowHeight = 15;

          // Alternate row background
          if (rowIndex % 2 === 0) {
            doc
              .rect(
                doc.page.margins.left,
                currentY - 2,
                pageWidth,
                rowHeight
              )
              .fill("#f9f9f9");
          }

          doc.fillColor("#000000");

          rowData.forEach((cell, i) => {
            doc.text(
              cell || "—",
              doc.page.margins.left + i * columnWidth,
              currentY,
              {
                width: columnWidth - 5,
                height: rowHeight,
                align: "left",
                ellipsis: true,
              }
            );
          });

          currentY += rowHeight;
        });

        // Footer
        const pageCount = (doc as any).bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          doc
            .fontSize(8)
            .text(
              `Page ${i + 1} of ${pageCount}`,
              doc.page.margins.left,
              doc.page.height - doc.page.margins.bottom + 10,
              { align: "center" }
            );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
