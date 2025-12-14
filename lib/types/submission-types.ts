import { Models } from "node-appwrite";

export type FormSubmission = Models.Document & {
  formId: string;
  formVersion: number;
  companyId: string;
  teamId: string;

  status: "draft" | "completed";

  submittedBy?: string;
  submittedByEmail?: string;
  isAnonymous: boolean;

  startedAt: string;
  submittedAt?: string;
  lastSavedAt: string;

  fileUploads?: string[]; // Array of file IDs stored as JSON
};

export type SubmissionValue = Models.Document & {
  submissionId: string; // Many-to-one relationship
  formId: string;
  companyId: string;
  fieldId: string;
  fieldLabel: string;
  fieldType: string;

  valueText?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  valueDate?: string;
  valueArray?: string[]; // JSON array for multi-select
  valueFileIds?: string[]; // JSON array for file uploads
};

export interface EnrichedSubmission extends FormSubmission {
  values: SubmissionValue[]; // All field values for this submission
  formName?: string;
}

// For display/export purposes
export interface SubmissionRow {
  submission: FormSubmission;
  fieldValues: Record<string, any>; // fieldId -> value
}

// Filter operators
export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "in"
  | "notIn"
  | "isNull"
  | "isNotNull"
  | "between";

export interface FilterCondition {
  fieldId: string;
  operator: FilterOperator;
  value: any;
  value2?: any; // For "between"
}

export interface FilterGroup {
  logic: "AND" | "OR";
  conditions: FilterCondition[];
}

export interface SortConfig {
  fieldId: string;
  direction: "asc" | "desc";
}

export interface GroupConfig {
  fieldId: string;
  aggregation?: "count" | "sum" | "avg" | "min" | "max";
}

export interface SubmissionFilterQuery {
  formId?: string;
  status?: "draft" | "completed";
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: FilterGroup[];
  sort?: SortConfig[];
  groupBy?: GroupConfig;
  limit?: number;
  offset?: number;
}

export type ExportFormat = "excel" | "csv" | "json" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  formId: string;
  filters?: SubmissionFilterQuery;
  includeMetadata?: boolean;
  selectedFields?: string[];
}

export interface SubmissionAnalytics {
  totalSubmissions: number;
  completedSubmissions: number;
  draftSubmissions: number;
  conversionRate: number;
  averageCompletionTime: number;
  submissionsByDate: { date: string; count: number }[];
  fieldAnalytics?: FieldAnalytics[];
}

export interface FieldAnalytics {
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  totalResponses: number;
  uniqueValues?: number;
  mostCommonValue?: any;
  distribution?: { value: any; count: number }[];
  numericStats?: {
    min: number;
    max: number;
    avg: number;
    median: number;
  };
}
