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

export interface OnboardingProgressWithArrays
  extends Omit<OnboardingProgress, "completedSteps" | "certificationsFileIds"> {
  completedSteps: number[];
  certificationsFileIds?: string[];
}

export const OnboardingHelpers = {
  fromDB(progress: OnboardingProgress): OnboardingProgressWithArrays {
    return {
      ...progress,
      completedSteps: progress.completedSteps
        ? progress.completedSteps
            .map(Number)
            .filter((n) => !isNaN(n))
        : [],
      certificationsFileIds: progress.certificationsFileIds
        ? progress.certificationsFileIds.split(",").filter(Boolean)
        : undefined,
    };
  },

  toDB(
    progress: Partial<OnboardingProgressWithArrays>
  ): Partial<OnboardingProgress> {
    const { completedSteps, certificationsFileIds, ...rest } = progress;
    return {
      ...rest,
      completedSteps: completedSteps ? completedSteps.join(",") : undefined,
      certificationsFileIds: certificationsFileIds
        ? certificationsFileIds.join(",")
        : undefined,
    } as Partial<OnboardingProgress>;
  },
};
