import { Models } from "node-appwrite";

export type CompanyStatus =
  | "draft"
  | "pending"
  | "active"
  | "rejected"
  | "suspended";

export type Company = Models.Document & {
  createdBy: string;
  currentStep: number;
  completedSteps: number[];
  status: CompanyStatus;

  companyName: string;
  industry?: string;
  size?: string;
  website?: string;
  phone?: string;
  email: string;
  description?: string;

  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;

  taxId?: string; 
  logoFileId?: string; 

  businessRegistrationFileId?: string;
  taxDocumentFileId?: string;
  proofOfAddressFileId?: string;
  certificationsFileIds?: string[]; 

  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;

  suspendedBy?: string;
  suspendedAt?: string;
  suspensionReason?: string;
};
