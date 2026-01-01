import { z } from "zod";

/**
 * Schema for analyzing uploaded file and detecting fields
 */
export const analyzeImportFileSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  fileName: z.string().min(1, "File name is required"),
  companyId: z.string().min(1, "Company ID is required"),
});

/**
 * Schema for creating form from detected fields
 */
export const createFormFromImportSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  formName: z.string().min(1, "Form name is required").max(100),
  formDescription: z.string().optional(),
  fields: z.array(
    z.object({
      name: z.string().min(1),
      label: z.string().min(1),
      type: z.enum([
        "text",
        "textarea",
        "number",
        "email",
        "phone",
        "url",
        "date",
        "time",
        "datetime",
        "checkbox",
        "radio",
        "dropdown",
        "file",
      ]),
      required: z.boolean().default(false),
      placeholder: z.string().optional(),
      helpText: z.string().optional(),
      options: z.array(z.string()).optional(),
      validation: z
        .object({
          min: z.number().optional(),
          max: z.number().optional(),
          pattern: z.string().optional(),
        })
        .optional(),
    })
  ),
  columnMapping: z.record(z.string(), z.string()), // columnName -> fieldName
  importData: z.boolean().default(true),
  companyId: z.string().min(1, "Company ID is required"),
});

export type AnalyzeImportFileInput = z.infer<typeof analyzeImportFileSchema>;
export type CreateFormFromImportInput = z.infer<
  typeof createFormFromImportSchema
>;
