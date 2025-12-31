import { z } from "zod";

export const validationRuleSchema = z.object({
  type: z.enum([
    "required",
    "min_length",
    "max_length",
    "min_value",
    "max_value",
    "regex",
    "email_format",
    "phone_format",
    "url_format",
    "custom",
  ]),
  value: z.any().optional(),
  message: z.string(),
});

export const fieldOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const fieldLayoutSchema = z.object({
  width: z.enum(["full", "half", "third", "quarter", "auto"]),
  columns: z.number().optional(),
  row: z.number().optional(),
  col: z.number().optional(),
});

export const baseFieldSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean(),
  validation: z.array(validationRuleSchema),
  layout: fieldLayoutSchema,
  order: z.number(),
});

export const formStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(z.string()),
  order: z.number(),
});

export const formThemeSchema = z.object({
  primaryColor: z.string(),
  backgroundColor: z.string(),
  fontFamily: z.string(),
  fontSize: z.string(),
  buttonStyle: z.enum(["rounded", "square", "pill"]),
  showProgressBar: z.boolean(),
  logoUrl: z.string().optional(),
});

export const formSettingsSchema = z.object({
  isPublic: z.boolean(),
  allowAnonymous: z.boolean(),
  requireLogin: z.boolean(),
  allowEdit: z.boolean(),
  allowMultipleSubmissions: z.boolean(),
  showProgressBar: z.boolean(),
  showQuestionNumbers: z.boolean(),
  shuffleQuestions: z.boolean(),
  confirmationMessage: z.string(),
  redirectUrl: z.string().optional(),
  enableNotifications: z.boolean(),
  notificationEmails: z.array(z.string().email()),
  enableAutoSave: z.boolean(),
  autoSaveInterval: z.number(),
  collectEmail: z.boolean(),
  collectIpAddress: z.boolean(),
  enableRecaptcha: z.boolean(),
});

export const formAccessControlSchema = z.object({
  visibility: z.enum(["public", "private", "team"]),
  password: z.string().optional(),
  allowedDomains: z.array(z.string()).optional(),
  expiresAt: z.string().optional(),
  maxSubmissions: z.number().optional(),
});

export const createFormSchema = z.object({
  name: z.string().min(1, "Form name is required").max(200),
  description: z.string().max(1000).optional(),
});

export type CreateFormInput = z.infer<typeof createFormSchema>;

export const updateFormSchema = z.object({
  formId: z.string(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  fields: z.array(z.any()).optional(), // We'll validate field structure separately
  steps: z.array(formStepSchema).optional(),
  conditionalLogic: z.array(z.any()).optional(),
  settings: formSettingsSchema.optional(),
  theme: formThemeSchema.optional(),
  accessControl: formAccessControlSchema.optional(),
});

export type UpdateFormInput = z.infer<typeof updateFormSchema>;

export const publishFormSchema = z.object({
  formId: z.string(),
});

export type PublishFormInput = z.infer<typeof publishFormSchema>;

export const deleteFormSchema = z.object({
  formId: z.string(),
});

export type DeleteFormInput = z.infer<typeof deleteFormSchema>;

export const getFormSchema = z.object({
  formId: z.string(),
});

export type GetFormInput = z.infer<typeof getFormSchema>;

export const listFormsSchema = z.object({
  companyId: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type ListFormsInput = z.infer<typeof listFormsSchema>;

export const createSubmissionSchema = z.object({
  formId: z.string(),
  data: z.record(z.any(), z.any()),
  status: z.enum(["draft", "completed"]).default("draft"),
  submittedByEmail: z.string().email().optional(),
  isAnonymous: z.boolean().default(false),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;

export const updateSubmissionSchema = z.object({
  submissionId: z.string(),
  data: z.record(z.any(), z.any()).optional(),
  status: z.enum(["draft", "completed"]).optional(),
});

export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>;

export const getSubmissionSchema = z.object({
  submissionId: z.string(),
});

export type GetSubmissionInput = z.infer<typeof getSubmissionSchema>;

export const listSubmissionsSchema = z.object({
  formId: z.string().optional(),
  companyId: z.string().optional(),
  status: z.enum(["draft", "completed"]).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type ListSubmissionsInput = z.infer<typeof listSubmissionsSchema>;

export const editSubmissionSchema = z.object({
  submissionId: z.string(),
  fieldValues: z.record(z.string(), z.any()), // fieldId -> new value
  changeDescription: z.string().optional(),
});

export type EditSubmissionInput = z.infer<typeof editSubmissionSchema>;

export const cloneFormSchema = z.object({
  formId: z.string(),
  newName: z.string().min(1, "Form name is required").max(200).optional(),
});

export type CloneFormInput = z.infer<typeof cloneFormSchema>;
