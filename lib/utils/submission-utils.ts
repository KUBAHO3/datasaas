
import { Form, FormField } from "@/lib/types/form-types";
import {
  SubmissionRow,
  FormSubmission,
  SubmissionValue,
  EnrichedSubmission,
} from "../types/submission-types";

export const SubmissionHelpers = {
  toDB(submission: Partial<FormSubmission>): any {
    const dbSubmission: any = { ...submission };

    if (submission.fileUploads && Array.isArray(submission.fileUploads)) {
      dbSubmission.fileUploads = JSON.stringify(submission.fileUploads);
    }

    return dbSubmission;
  },

  fromDB(dbSubmission: any): FormSubmission {
    const submission: any = { ...dbSubmission };

    try {
      if (typeof submission.fileUploads === "string") {
        submission.fileUploads = JSON.parse(submission.fileUploads);
      }
    } catch (error) {
      console.error("Error parsing submission fileUploads:", error);
      submission.fileUploads = [];
    }

    return submission as FormSubmission;
  },

  enrichSubmission(
    submission: FormSubmission,
    values: SubmissionValue[],
    form: Form
  ): EnrichedSubmission {
    return {
      ...submission,
      values,
      formName: form.name,
    };
  },

  toRow(submission: FormSubmission, values: SubmissionValue[]): SubmissionRow {
    const fieldValues: Record<string, any> = {};

    values.forEach((value) => {
      // Extract actual value based on field type
      fieldValues[value.fieldId] = this.extractValue(value);
    });

    return {
      submission,
      fieldValues,
    };
  },

  extractValue(value: SubmissionValue): any {
    switch (value.fieldType) {
      case "text":
      case "textarea":
      case "email":
      case "phone":
      case "url":
      case "select":
      case "radio":
        return value.valueText || null;

      case "number":
      case "currency":
      case "percentage":
      case "rating":
      case "scale":
        return value.valueNumber ?? null;

      case "checkbox":
      case "boolean":
        return value.valueBoolean ?? null;

      case "date":
      case "datetime":
      case "time":
        return value.valueDate || null;

      case "multi_select":
      case "checkbox_group":
        return value.valueArray || [];

      case "file_upload":
        return value.valueFileIds || [];

      default:
        return value.valueText || null;
    }
  },

  formatFieldValue(value: any, fieldType: string): string {
    if (value === null || value === undefined) return "—";

    switch (fieldType) {
      case "date":
        return new Date(value).toLocaleDateString();
      case "datetime":
        return new Date(value).toLocaleString();
      case "time":
        return value;
      case "multi_select":
      case "checkbox_group":
        return Array.isArray(value) ? value.join(", ") : value;
      case "file_upload":
        return Array.isArray(value) ? `${value.length} file(s)` : "0 files";
      case "rating":
        return `${value} ⭐`;
      case "currency":
        return `$${Number(value).toFixed(2)}`;
      case "percentage":
        return `${value}%`;
      case "boolean":
      case "checkbox":
        return value ? "Yes" : "No";
      default:
        return String(value);
    }
  },
};

export const SubmissionValueHelpers = {
  toDB(value: Partial<SubmissionValue>): any {
    const dbValue: any = { ...value };

    // Stringify arrays
    if (value.valueArray && Array.isArray(value.valueArray)) {
      dbValue.valueArray = JSON.stringify(value.valueArray);
    }
    if (value.valueFileIds && Array.isArray(value.valueFileIds)) {
      dbValue.valueFileIds = JSON.stringify(value.valueFileIds);
    }

    return dbValue;
  },

  fromDB(dbValue: any): SubmissionValue {
    const value: any = { ...dbValue };

    try {
      if (typeof value.valueArray === "string") {
        value.valueArray = JSON.parse(value.valueArray);
      }
      if (typeof value.valueFileIds === "string") {
        value.valueFileIds = JSON.parse(value.valueFileIds);
      }
    } catch (error) {
      console.error("Error parsing submission value arrays:", error);
      value.valueArray = [];
      value.valueFileIds = [];
    }

    return value as SubmissionValue;
  },

  fromFieldValue(
    submissionId: string,
    formId: string,
    companyId: string,
    field: FormField,
    value: any
  ): Partial<SubmissionValue> {
    const baseValue: Partial<SubmissionValue> = {
      submissionId,
      formId,
      companyId,
      fieldId: field.id,
      fieldLabel: field.label,
      fieldType: field.type,
    };

    // Set appropriate value field based on type
    switch (field.type) {
      case "text":
      case "textarea":
      case "email":
      case "phone":
      case "url":
      case "select":
      case "radio":
        baseValue.valueText = value ? String(value) : undefined;
        break;

      case "number":
      case "currency":
      case "percentage":
      case "rating":
      case "scale":
        baseValue.valueNumber =
          value !== null && value !== undefined ? Number(value) : undefined;
        break;

      case "checkbox":
      case "boolean":
        baseValue.valueBoolean = Boolean(value);
        break;

      case "date":
      case "datetime":
      case "time":
        baseValue.valueDate = value ? String(value) : undefined;
        break;

      case "multi_select":
      case "checkbox_group":
        baseValue.valueArray = Array.isArray(value) ? value : [];
        break;

      case "file_upload":
        baseValue.valueFileIds = Array.isArray(value) ? value : [];
        break;

      default:
        baseValue.valueText = value ? String(value) : undefined;
    }

    return baseValue;
  },
};

export function sanitizeColumnName(name: string): string {
  return name
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 31);
}

export function submissionToCSVRow(
  row: SubmissionRow,
  fields: FormField[]
): Record<string, any> {
  const csvRow: Record<string, any> = {
    ID: row.submission.$id,
    Status: row.submission.status,
    "Submitted At": row.submission.submittedAt || "—",
    "Submitted By":
      row.submission.submittedByEmail ||
      row.submission.submittedBy ||
      "Anonymous",
  };

  fields.forEach((field) => {
    const value = row.fieldValues[field.id];
    csvRow[sanitizeColumnName(field.label)] =
      SubmissionHelpers.formatFieldValue(value, field.type);
  });

  return csvRow;
}
