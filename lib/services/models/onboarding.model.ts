import { DATABASE_ID, ONBOARDING_TABLE_ID } from "@/lib/env-config";
import { AdminDBModel, SessionDBModel } from "../core/base-db-model";
import {
  OnboardingProgress,
  OnboardingProgressWithArrays,
  OnboardingHelpers,
} from "@/lib/types/onboarding-types";

export class OnboardingSessionModel extends SessionDBModel<OnboardingProgress> {
  constructor() {
    super(DATABASE_ID, ONBOARDING_TABLE_ID);
  }

  async findByUserId(
    userId: string
  ): Promise<OnboardingProgressWithArrays | null> {
    const progress = await this.findOne({
      where: [{ field: "userId", operator: "equals", value: userId }],
    });

    if (!progress) return null;

    return OnboardingHelpers.fromDB(progress);
  }
}

export class OnboardingAdminModel extends AdminDBModel<OnboardingProgress> {
  constructor() {
    super(DATABASE_ID, ONBOARDING_TABLE_ID);
  }

  async findByUserId(
    userId: string
  ): Promise<OnboardingProgressWithArrays | null> {
    const progress = await this.findOne({
      where: [{ field: "userId", operator: "equals", value: userId }],
    });

    if (!progress) return null;

    return OnboardingHelpers.fromDB(progress);
  }

  async createProgress(userId: string): Promise<OnboardingProgressWithArrays> {
    const dbProgress = await this.create(
      {
        userId,
        currentStep: 2,
        completedSteps: [1],
        status: "in_progress",
      },
      userId
    );

    return OnboardingHelpers.fromDB(dbProgress);
  }

  async updateProgress(
    userId: string,
    data: Partial<OnboardingProgressWithArrays>
  ): Promise<OnboardingProgressWithArrays> {
    const dbData = OnboardingHelpers.toDB(data);

    const updated = await this.updateById(userId, dbData);

    return OnboardingHelpers.fromDB(updated);
  }
}
