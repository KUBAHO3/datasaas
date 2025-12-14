import { Models } from "node-appwrite";

export type OrganizationStatus =
  | "pending"
  | "active"
  | "suspended"
  | "rejected"
  | "draft";

export interface Organization extends Models.Document {
  companyName: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  status: OrganizationStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  logoFileId?: string;
  currentStep?: number;
  completedSteps?: number[];
  street?: string;
  taxId?: string;
  businessRegistrationFileId?: string;
  taxDocumentFileId?: string;
  proofOfAddressFileId?: string;
  certificationsFileIds?: string[];
  submittedAt?: string;
  suspendedBy?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  adminNotes?: string;
}

export interface User extends Models.Document {
  name: string;
  userId: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role?: string;
  teamId?: string;
  companyId?: string;
}

export type FormStatus = "draft" | "published" | "archived";

export interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: any[];
  validation?: any;
  [key: string]: any;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  [key: string]: any;
}

export interface FormConditionalLogic {
  fieldId: string;
  conditions: any[];
  actions: any[];
  [key: string]: any;
}

export interface FormSettings {
  allowAnonymous?: boolean;
  requireAuth?: boolean;
  allowSaveDraft?: boolean;
  showProgressBar?: boolean;
  [key: string]: any;
}

export interface FormTheme {
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  [key: string]: any;
}

export interface FormAccessControl {
  allowedUsers?: string[];
  allowedRoles?: string[];
  isPublic?: boolean;
  [key: string]: any;
}

export interface Form extends Models.Document {
  companyId: string;
  name?: string;
  description?: string;
  status: FormStatus;
  version?: number;
  isTemplate?: boolean;
  templateCategory?: string;
  fields?: string; // JSON string of FormField[]
  steps?: string; // JSON string of FormStep[]
  conditionalLogic?: string; // JSON string of FormConditionalLogic[]
  settings?: string; // JSON string of FormSettings
  theme?: string; // JSON string of FormTheme
  accessControl?: string; // JSON string of FormAccessControl
  createdBy?: string;
  updatedBy?: string;
  publishedAt?: string;
  submissionCollectionId?: string;
  metadata?: string; // JSON string
}

export interface FormParsed
  extends Omit<
    Form,
    | "fields"
    | "steps"
    | "conditionalLogic"
    | "settings"
    | "theme"
    | "accessControl"
    | "metadata"
  > {
  fields?: FormField[];
  steps?: FormStep[];
  conditionalLogic?: FormConditionalLogic[];
  settings?: FormSettings;
  theme?: FormTheme;
  accessControl?: FormAccessControl;
  metadata?: Record<string, any>;
}

export type FormSubmissionStatus = "completed" | "draft";

export interface FileUpload {
  fieldId: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  [key: string]: any;
}

export interface FormSubmission extends Models.Document {
  formId?: string;
  formVersion: number;
  companyId: string;
  data: string; // JSON string of submission data
  status?: FormSubmissionStatus;
  submittedBy?: string;
  submittedByEmail?: string;
  isAnonymous: boolean;
  ipAddress?: string;
  userAgent?: string;
  startedAt?: string;
  submittedAt?: string;
  lastSavedAt: string;
  fileUploads?: string; // JSON string of FileUpload[]
}

export interface FormSubmissionParsed
  extends Omit<FormSubmission, "data" | "fileUploads"> {
  data: Record<string, any>;
  fileUploads?: FileUpload[];
}

export type SubmissionValueStatus = "draft" | "completed";

export interface SubmissionValue extends Models.Document {
  formId: string;
  formVersion: number;
  companyId: string;
  status: SubmissionValueStatus;
  submittedBy?: string;
  submittedByEmail?: string;
  isAnonymous?: boolean;
  startedAt?: string;
  submittedAt?: string;
  lastSavedAt?: string;
  fileUploads?: string[];
}
