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
  status: OnboardingStatus;
  companyId?: string;
  rejectionReason?: string;

  companyName?: string;
  industry?: string;
  size?: string;
  website?: string;
  phone?: string;
  description?: string;

  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;

  logoFileId?: string;
  taxId?: string;

  businessRegistrationFileId?: string;
  taxDocumentFileId?: string;
  proofOfAddressFileId?: string;
  certificationsFileIds?: string[];
};

export interface OnboardingStepData {
  step: number;
  title: string;
  description: string;
  isComplete: boolean;
}

export type OnboardingProgressWithArrays = OnboardingProgress;

export const OnboardingHelpers = {
  fromDB(progress: OnboardingProgress): OnboardingProgressWithArrays {
    return {
      ...progress,
      completedSteps: progress.completedSteps || [],
      certificationsFileIds: progress.certificationsFileIds || [],
    };
  },
  toDB(
    progress: Partial<OnboardingProgressWithArrays>
  ): Partial<OnboardingProgress> {
    // Appwrite accepts arrays directly!
    return {
      ...progress,
      ...(progress.completedSteps !== undefined && {
        completedSteps: progress.completedSteps,
      }),
      ...(progress.certificationsFileIds !== undefined && {
        certificationsFileIds: progress.certificationsFileIds,
      }),
    };
  },
};