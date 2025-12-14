import { z } from "zod";

export const filterConditionSchema = z.object({
  fieldId: z.string(),
  operator: z.enum([
    "equals",
    "notEquals",
    "contains",
    "notContains",
    "startsWith",
    "endsWith",
    "greaterThan",
    "greaterThanOrEqual",
    "lessThan",
    "lessThanOrEqual",
    "in",
    "notIn",
    "isNull",
    "isNotNull",
    "between",
  ]),
  value: z.any(),
  value2: z.any().optional(),
});

export const filterGroupSchema = z.object({
  logic: z.enum(["AND", "OR"]),
  conditions: z.array(filterConditionSchema),
});

export const sortConfigSchema = z.object({
  fieldId: z.string(),
  direction: z.enum(["asc", "desc"]),
});

export const groupConfigSchema = z.object({
  fieldId: z.string(),
  aggregation: z.enum(["count", "sum", "avg", "min", "max"]).optional(),
});

export const submissionFilterQuerySchema = z.object({
  formId: z.string().optional(),
  status: z.enum(["draft", "completed"]).optional(),
  dateRange: z
    .object({
      start: z.string(),
      end: z.string(),
    })
    .optional(),
  filters: z.array(filterGroupSchema).optional(),
  sort: z.array(sortConfigSchema).optional(),
  groupBy: groupConfigSchema.optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export type SubmissionFilterQueryInput = z.infer<
  typeof submissionFilterQuerySchema
>;

export const exportOptionsSchema = z.object({
  format: z.enum(["excel", "csv", "json", "pdf"]),
  formId: z.string(),
  filters: submissionFilterQuerySchema.optional(),
  includeMetadata: z.boolean().default(false),
  selectedFields: z.array(z.string()).optional(),
});

export type ExportOptionsInput = z.infer<typeof exportOptionsSchema>;

export const bulkDeleteSubmissionsSchema = z.object({
  submissionIds: z.array(z.string()).min(1),
});

export type BulkDeleteSubmissionsInput = z.infer<
  typeof bulkDeleteSubmissionsSchema
>;

export const bulkUpdateStatusSchema = z.object({
  submissionIds: z.array(z.string()).min(1),
  status: z.enum(["draft", "completed"]),
});

export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusSchema>;
