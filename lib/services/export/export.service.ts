import "server-only";

import { Form } from "@/lib/types/form-types";
import { SubmissionRow } from "@/lib/types/submission-types";
import {
  SubmissionHelpers,
  sanitizeColumnName,
} from "@/lib/utils/submission-utils";
import * as XLSX from "xlsx";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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
   * Export to PDF using pdf-lib
   */
  private async exportToPDF(
    form: Form,
    rows: SubmissionRow[],
    fields: any[],
    includeMetadata?: boolean
  ): Promise<ExportResult> {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();

      // Embed fonts
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Page configuration
      const pageWidth = 842; // A4 landscape width in points
      const pageHeight = 595; // A4 landscape height in points
      const margin = 50;
      const contentWidth = pageWidth - 2 * margin;

      // Create first page
      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Draw header
      page.drawText(form.name, {
        x: margin,
        y: currentY,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      currentY -= 30;

      page.drawText("Submissions Report", {
        x: margin,
        y: currentY,
        size: 12,
        font: normalFont,
        color: rgb(0, 0, 0),
      });
      currentY -= 15;

      page.drawText(`Generated on: ${new Date().toLocaleString()}`, {
        x: margin,
        y: currentY,
        size: 10,
        font: normalFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      currentY -= 15;

      page.drawText(`Total Submissions: ${rows.length}`, {
        x: margin,
        y: currentY,
        size: 10,
        font: normalFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      currentY -= 30;

      // Table headers
      const headers = ["ID", "Status", "Submitted At", "Submitted By"];
      fields.forEach((field) => {
        headers.push(field.label.substring(0, 15)); // Truncate long labels
      });
      if (includeMetadata) {
        headers.push("Started", "Last Saved");
      }

      const columnWidth = contentWidth / headers.length;
      const rowHeight = 18;
      const headerHeight = 25;

      // Draw header row
      page.drawRectangle({
        x: margin,
        y: currentY - headerHeight,
        width: contentWidth,
        height: headerHeight,
        color: rgb(0.9, 0.9, 0.9),
      });

      headers.forEach((header, i) => {
        const text = header.length > 12 ? header.substring(0, 12) + "..." : header;
        page.drawText(text, {
          x: margin + i * columnWidth + 5,
          y: currentY - 17,
          size: 8,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
      });

      currentY -= headerHeight + 5;

      // Draw horizontal line under headers
      page.drawLine({
        start: { x: margin, y: currentY },
        end: { x: pageWidth - margin, y: currentY },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      currentY -= 5;

      // Draw table rows
      rows.forEach((row, rowIndex) => {
        // Check if we need a new page
        if (currentY < margin + 50) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;

          // Redraw headers on new page
          page.drawRectangle({
            x: margin,
            y: currentY - headerHeight,
            width: contentWidth,
            height: headerHeight,
            color: rgb(0.9, 0.9, 0.9),
          });

          headers.forEach((header, i) => {
            const text = header.length > 12 ? header.substring(0, 12) + "..." : header;
            page.drawText(text, {
              x: margin + i * columnWidth + 5,
              y: currentY - 17,
              size: 8,
              font: boldFont,
              color: rgb(0, 0, 0),
            });
          });

          currentY -= headerHeight + 5;

          page.drawLine({
            start: { x: margin, y: currentY },
            end: { x: pageWidth - margin, y: currentY },
            thickness: 1,
            color: rgb(0, 0, 0),
          });

          currentY -= 5;
        }

        // Prepare row data
        const rowData: string[] = [
          row.submission.$id.substring(0, 8) + "...",
          row.submission.status,
          row.submission.submittedAt
            ? new Date(row.submission.submittedAt).toLocaleDateString()
            : "—",
          (row.submission.submittedByEmail ||
            row.submission.submittedBy ||
            "Anon").substring(0, 12),
        ];

        fields.forEach((field) => {
          const value = row.fieldValues[field.id];
          const formatted = SubmissionHelpers.formatFieldValue(value, field.type);
          const truncated = formatted.toString().substring(0, 20);
          rowData.push(truncated);
        });

        if (includeMetadata) {
          rowData.push(
            new Date(row.submission.startedAt).toLocaleDateString(),
            new Date(row.submission.lastSavedAt).toLocaleDateString()
          );
        }

        // Alternate row background
        if (rowIndex % 2 === 0) {
          page.drawRectangle({
            x: margin,
            y: currentY - rowHeight,
            width: contentWidth,
            height: rowHeight,
            color: rgb(0.98, 0.98, 0.98),
          });
        }

        // Draw cell text
        rowData.forEach((cell, i) => {
          const text = cell || "—";
          const truncated = text.length > 15 ? text.substring(0, 15) + "..." : text;

          page.drawText(truncated, {
            x: margin + i * columnWidth + 5,
            y: currentY - 12,
            size: 7,
            font: normalFont,
            color: rgb(0, 0, 0),
          });
        });

        currentY -= rowHeight;
      });

      // Add page numbers to all pages
      const totalPages = pdfDoc.getPageCount();
      pdfDoc.getPages().forEach((p, i) => {
        p.drawText(`Page ${i + 1} of ${totalPages}`, {
          x: pageWidth / 2 - 30,
          y: 20,
          size: 8,
          font: normalFont,
          color: rgb(0.5, 0.5, 0.5),
        });
      });

      // Generate PDF bytes
      const pdfBytes = await pdfDoc.save();
      const base64 = Buffer.from(pdfBytes).toString("base64");

      return {
        data: base64,
        filename: `${sanitizeColumnName(form.name)}_submissions_${
          new Date().toISOString().split("T")[0]
        }.pdf`,
        mimeType: "application/pdf",
      };
    } catch (error) {
      throw new Error(`PDF export failed: ${error}`);
    }
  }
}
