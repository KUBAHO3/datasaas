import { Models } from "node-appwrite";

export type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "url"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "date_range"
  | "time"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "multi_select"
  | "file_upload"
  | "image_upload"
  | "signature"
  | "rating"
  | "scale"
  | "matrix"
  | "location"
  | "address"
  | "rich_text"
  | "section_header"
  | "divider";

export type ValidationRuleType =
  | "required"
  | "min_length"
  | "max_length"
  | "min_value"
  | "max_value"
  | "regex"
  | "email_format"
  | "phone_format"
  | "url_format"
  | "custom";

export type ConditionalOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "greater_than"
  | "less_than"
  | "is_empty"
  | "is_not_empty";

export type ConditionalActionType = "show" | "hide" | "require" | "skip_to";

export interface ValidationRule {
  type: ValidationRuleType;
  value?: any;
  message: string;
}

export interface FieldOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  icon?: string;
}

export interface FieldLayout {
  width: "full" | "half" | "third" | "quarter" | "auto";
  columns?: number;
  row?: number;
  col?: number;
}

export interface BaseField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  validation: ValidationRule[];
  layout: FieldLayout;
  order: number;
}

export interface TextField extends BaseField {
  type: "short_text" | "long_text" | "email" | "phone" | "url";
  maxLength?: number;
  minLength?: number;
}

export interface NumberField extends BaseField {
  type: "number" | "currency";
  min?: number;
  max?: number;
  step?: number;
  currencySymbol?: string;
}

export interface DateField extends BaseField {
  type: "date" | "datetime" | "date_range" | "time";
  minDate?: string;
  maxDate?: string;
  format?: string;
}

export interface SelectionField extends BaseField {
  type: "dropdown" | "radio" | "checkbox" | "multi_select";
  options: FieldOption[];
  allowOther?: boolean;
  multipleSelect?: boolean;
}

export interface FileUploadField extends BaseField {
  type: "file_upload" | "image_upload";
  maxSize: number; // in MB
  allowedTypes: string[];
  maxFiles: number;
}

export interface RatingField extends BaseField {
  type: "rating";
  maxRating: number;
  icon?: "star" | "heart" | "thumb" | "number";
}

export interface ScaleField extends BaseField {
  type: "scale";
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
  step: number;
}

export interface MatrixField extends BaseField {
  type: "matrix";
  rows: FieldOption[];
  columns: FieldOption[];
  allowMultiple: boolean;
}

export interface LocationField extends BaseField {
  type: "location";
  enableMap?: boolean;
  enableGeolocation?: boolean;
}

export interface AddressField extends BaseField {
  type: "address";
  fields: {
    street: boolean;
    city: boolean;
    state: boolean;
    zipCode: boolean;
    country: boolean;
  };
}

export interface RichTextField extends BaseField {
  type: "rich_text";
  toolbar: string[];
}

export interface SectionHeaderField extends BaseField {
  type: "section_header";
  size?: "small" | "medium" | "large";
}

export interface DividerField extends BaseField {
  type: "divider";
  style?: "solid" | "dashed" | "dotted";
}

export type FormField =
  | TextField
  | NumberField
  | DateField
  | SelectionField
  | FileUploadField
  | RatingField
  | ScaleField
  | MatrixField
  | LocationField
  | AddressField
  | RichTextField
  | SectionHeaderField
  | DividerField;

export interface ConditionalCondition {
  fieldId: string;
  operator: ConditionalOperator;
  value: any;
}

export interface ConditionalRule {
  id: string;
  conditions: ConditionalCondition[];
  logicOperator: "AND" | "OR";
  action: ConditionalActionType;
  targetFieldId: string;
  skipToStepId?: string;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  order: number;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  fontSize: string;
  buttonStyle: "rounded" | "square" | "pill";
  showProgressBar: boolean;
  logoUrl?: string;
}

export interface FormSettings {
  isPublic: boolean;
  allowAnonymous: boolean;
  requireLogin: boolean;
  allowEdit: boolean;
  allowMultipleSubmissions: boolean;
  showProgressBar: boolean;
  showQuestionNumbers: boolean;
  shuffleQuestions: boolean;
  confirmationMessage: string;
  redirectUrl?: string;
  enableNotifications: boolean;
  notificationEmails: string[];
  enableAutoSave: boolean;
  autoSaveInterval: number; // in seconds
  collectEmail: boolean;
  collectIpAddress: boolean;
  enableRecaptcha: boolean;
}

export interface FormAccessControl {
  visibility: "public" | "private" | "team";
  password?: string;
  allowedDomains?: string[];
  expiresAt?: string;
  maxSubmissions?: number;
}

export interface FormMetadata {
  totalFields: number;
  totalSteps: number;
  estimatedTime: number; // in minutes
  responseCount: number;
  lastSubmittedAt?: string;
}

export type Form = Models.Document & {
  companyId: string;
  name: string;
  description?: string;
  status: "draft" | "published" | "archived";
  version: number;
  isTemplate: boolean;
  templateCategory?: string;

  fields: FormField[];
  steps: FormStep[];
  conditionalLogic: ConditionalRule[];

  settings: FormSettings;
  theme: FormTheme;
  accessControl: FormAccessControl;
  metadata: FormMetadata;

  createdBy: string;
  updatedBy: string;
  publishedAt?: string;

  submissionCollectionId?: string;
};

export type FormTemplate = Models.Document & {
  name: string;
  description: string;
  category:
    | "contact"
    | "survey"
    | "registration"
    | "feedback"
    | "order"
    | "custom";
  thumbnail?: string;
  isSystem: boolean;
  companyId?: string; // null for system templates

  fields: FormField[];
  steps: FormStep[];
  conditionalLogic: ConditionalRule[];
  theme: FormTheme;

  usageCount: number;
};

export type FormVersion = Models.Document & {
  formId: string;
  version: number;
  fields: FormField[];
  steps: FormStep[];
  conditionalLogic: ConditionalRule[];
  settings: FormSettings;
  theme: FormTheme;

  createdBy: string;
  changeDescription?: string;
};

export type FormSubmission = Models.Document & {
  formId: string;
  formVersion: number;
  companyId: string;

  data: Record<string, any>; // fieldId -> value
  status: "draft" | "completed";

  submittedBy?: string; // userId if authenticated
  submittedByEmail?: string;
  isAnonymous: boolean;
  ipAddress?: string;
  userAgent?: string;

  startedAt: string;
  submittedAt?: string;
  lastSavedAt: string;

  fileUploads?: Record<string, string[]>; // fieldId -> fileIds
};

export interface FormSubmissionSummary {
  id: string;
  formId: string;
  status: "draft" | "completed";
  submittedBy?: string;
  submittedByEmail?: string;
  submittedAt?: string;
  lastSavedAt: string;
}

export interface FormStats {
  totalSubmissions: number;
  completedSubmissions: number;
  draftSubmissions: number;
  averageCompletionTime: number; // in seconds
  conversionRate: number; // percentage
  lastSubmissionAt?: string;
}
