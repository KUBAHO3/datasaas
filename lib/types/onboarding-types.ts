import { Models } from "node-appwrite";

export type OnboardingStatus =
  | "in_progress"
  | "submitted"
  | "approved"
  | "rejected";

export type OnboardingProgress = Models.Document & {
  userId: string;
  currentStep: number;
  completedSteps: number[];
  companyBasicInfo?: {
    companyName: string;
    industry: string;
    size: string;
    website?: string;
    phone: string;
    description?: string;
  };
  companyAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  companyBranding?: {
    logoFileId?: string;
    taxId: string;
  };
  documents?: {
    businessRegistration?: string;
    taxDocument?: string;
    proofOfAddress?: string;
    certifications?: string[];
  };
  status: OnboardingStatus;
  companyId?: string;
  rejectionReason?: string;
};

export interface OnboardingStepData {
  step: number;
  title: string;
  description: string;
  isComplete: boolean;
}
